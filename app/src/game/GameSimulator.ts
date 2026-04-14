import { XorShift32 } from './Random';
import { simulateInning, InningResult } from './InningSimulator';

export interface LineupPlayer { id?: string; speed?: number; aggression?: number; batting?: number; strength?: number; streak?: number }

export interface GameResult {
  home: { runs: number; innings: InningResult[] };
  away: { runs: number; innings: InningResult[] };
}

export interface BoxLine {
  id?: string | number;
  AB: number;
  H: number;
  R: number;
  RBI: number;
  PA: number;
}

/** A pitcher available in the bullpen */
export interface PitcherOption {
  id?: string;
  name?: string;
  position?: string;
  pitching?: number;
  stamina?: number;
  composure?: number;
  strength?: number;
}

/** Entry in the pitching log for one side */
export interface PitcherLogEntry {
  pitcher: PitcherOption;
  inningsStart: number;  // 0-based inning they entered
  inningsEnd: number;    // 0-based inning they left (or last inning)
  pitchCount: number;
}

export interface GameResultWithBox extends GameResult {
  box: { home: BoxLine[]; away: BoxLine[] };
  pitching?: { home: PitcherLogEntry[]; away: PitcherLogEntry[] };
}

/** Determine max pitches before pulling a pitcher based on stamina (0-100). SP ~90-110, RP ~30-50 */
function maxPitchesForStamina(stamina: number, isStarter: boolean): number {
  if (isStarter) return 70 + Math.round((stamina / 100) * 45);   // 70..115
  return 25 + Math.round((stamina / 100) * 30);                  // 25..55
}

export function simulateGame(opts?: { rngSeed?: number; lineupHome?: LineupPlayer[]; lineupAway?: LineupPlayer[]; simulateInningOverride?: (opts?: any) => InningResult; maxInnings?: number; allowExtras?: boolean; pitchersHome?: PitcherOption[]; pitchersAway?: PitcherOption[]; stakes?: string }): GameResultWithBox {
  const rng = new XorShift32(opts?.rngSeed ?? 9999);
  const lineupHome = opts?.lineupHome ?? Array.from({ length:9 }).map(() => ({ speed:50, aggression:0.2, batting:50, strength:50, streak:50 }));
  const lineupAway = opts?.lineupAway ?? Array.from({ length:9 }).map(() => ({ speed:50, aggression:0.2, batting:50, strength:50, streak:50 }));

  // ── Pitcher management ─────────────────────────────────────────────
  const defaultPitcher: PitcherOption = { id: 'P', pitching: 50, stamina: 50, composure: 50, strength: 50 };
  const homeBullpen = opts?.pitchersHome ? [...opts.pitchersHome] : [];
  const awayBullpen = opts?.pitchersAway ? [...opts.pitchersAway] : [];

  // Current pitcher state per side
  interface PitcherState { pitcher: PitcherOption; pitchCount: { value: number }; isStarter: boolean; maxPitches: number }
  function initPitcher(bullpen: PitcherOption[]): PitcherState {
    const p = bullpen.shift() ?? defaultPitcher;
    const stam = p.stamina ?? 50;
    const isStarter = p.position === 'SP';
    return { pitcher: p, pitchCount: { value: 0 }, isStarter, maxPitches: maxPitchesForStamina(stam, isStarter) };
  }
  function nextReliever(bullpen: PitcherOption[], inning: number): PitcherState | null {
    if (bullpen.length === 0) return null;
    // In late innings (8+), prefer CL if available
    let idx = inning >= 7 ? bullpen.findIndex(p => p.position === 'CL') : -1;
    if (idx === -1) idx = 0;
    const p = bullpen.splice(idx, 1)[0];
    const stam = p.stamina ?? 50;
    return { pitcher: p, pitchCount: { value: 0 }, isStarter: false, maxPitches: maxPitchesForStamina(stam, false) };
  }
  function pitcherAttrs(ps: PitcherState) {
    return { pitching: ps.pitcher.pitching ?? 50, composure: ps.pitcher.composure ?? 50, strength: ps.pitcher.strength ?? 50, stamina: ps.pitcher.stamina ?? 50 };
  }

  // away is pitching when home bats, and vice versa
  let awayPitState = initPitcher(awayBullpen);  // away's pitcher faces home batters
  let homePitState = initPitcher(homeBullpen);   // home's pitcher faces away batters

  const awayPitLog: PitcherLogEntry[] = [{ pitcher: awayPitState.pitcher, inningsStart: 0, inningsEnd: 0, pitchCount: 0 }];
  const homePitLog: PitcherLogEntry[] = [{ pitcher: homePitState.pitcher, inningsStart: 0, inningsEnd: 0, pitchCount: 0 }];

  function maybeSub(state: PitcherState, bullpen: PitcherOption[], log: PitcherLogEntry[], inning: number): PitcherState {
    if (state.pitchCount.value >= state.maxPitches) {
      // Record final pitch count for departing pitcher
      log[log.length - 1].pitchCount = state.pitchCount.value;
      log[log.length - 1].inningsEnd = inning;
      const relief = nextReliever(bullpen, inning);
      if (relief) {
        log.push({ pitcher: relief.pitcher, inningsStart: inning, inningsEnd: inning, pitchCount: 0 });
        return relief;
      }
      // no relievers left: keep current pitcher
    }
    return state;
  }

  const homeInnings: InningResult[] = [];
  const awayInnings: InningResult[] = [];
  let homeRuns = 0;
  let awayRuns = 0;

  // Maintain batting order indices across innings
  let awayIndex = 0;
  let homeIndex = 0;

  const inningRunner = opts?.simulateInningOverride ?? simulateInning;
  const gameStakes = opts?.stakes ?? 'regular';

  let inning = 0;
  // maxInnings can be explicitly set by the caller. If not provided, default to 9 (no extras)
  // or to a larger default when allowExtras is true. This also ensures tests that pass
  // maxInnings (for determinism) are respected even when allowExtras is false.
  const maxInnings = typeof opts?.maxInnings === 'number' ? opts.maxInnings : 50;
  // Play innings until 9 complete or until the game is decided (including extras)
  while (true) {
    // safety: cap on innings to avoid infinite loops in pathological test stubs
    if (inning >= maxInnings) break;
    // top of inning (away bats, home pitches)
    homePitState = maybeSub(homePitState, homeBullpen, homePitLog, inning);
    const awayRes = inningRunner({ rng, lineup: lineupAway, startIndex: awayIndex, pitcherAttributes: pitcherAttrs(homePitState), pitchCount: homePitState.pitchCount, stakes: gameStakes });
    awayInnings.push(awayRes);
    awayRuns += awayRes.runs;
    awayIndex = awayRes.nextBatterIndex;

    // If we're at/after the 9th inning (inning index 8) and away is still behind, home doesn't need to bat
    if (inning >= 8 && awayRuns < homeRuns) {
      break;
    }

    // bottom of inning (home bats, away pitches)
    awayPitState = maybeSub(awayPitState, awayBullpen, awayPitLog, inning);
    const homeRes = inningRunner({ rng, lineup: lineupHome, startIndex: homeIndex, pitcherAttributes: pitcherAttrs(awayPitState), pitchCount: awayPitState.pitchCount, stakes: gameStakes });
    homeInnings.push(homeRes);
    homeRuns += homeRes.runs;
    homeIndex = homeRes.nextBatterIndex;

    // After completing the bottom of 9th or any extra inning, if score is not tied, game ends
    if (inning >= 8) {
      if (homeRuns !== awayRuns) {
        break;
      }
    }

    inning++;
  }
  // compute simple box score for both lineups
  const makeBox = (lineup: LineupPlayer[], innings: InningResult[]) => {
    const box: BoxLine[] = lineup.map((p) => {
      const name = (p as any).name;
      const pos = (p as any).position;
      let label = p.id;
      if (name) {
        const parts = name.split(' ');
        const first = parts[0] ?? '';
        const last = parts.slice(1).join(' ') || first;
        label = `${first[0]} ${last}${pos ? ' - ' + pos : ''}`;
      }
      return { id: label, AB: 0, H: 0, R: 0, RBI: 0, PA: 0 };
    });
    // iterate plateAppearances in innings order
    innings.forEach((inn) => {
      inn.plateAppearances.forEach((pa) => {
        const idx = pa.batterIndex;
        const line = box[idx];
        if (!line) return;
        line.PA += 1;
        const isSac = pa.appliedScenario?.isSacrifice === true;
        if (!isSac) {
          // Walks and takes don't count as ABs
          if (pa.result === 'walk' || pa.result === 'take') {
            // PA only, no AB
          } else if (pa.result && pa.result !== 'out') {
            line.AB += 1;
            if (['single','double','triple','hr'].includes(pa.result)) {
              line.H += 1;
            }
          } else if (pa.result === 'out') {
            line.AB += 1;
          }
        }
        // Better RBI/run attribution using appliedScenario metadata when available.
        const runs = typeof pa.runsScored === 'number' ? Math.round(pa.runsScored) : (pa.appliedScenario && typeof pa.appliedScenario.runs === 'number' ? Math.round(pa.appliedScenario.runs) : 0);
        const outsAdded = pa.appliedScenario?.outsAdded ?? 0;
        const isError = pa.result === 'error';
        const isDP = outsAdded >= 2;
  // Batter gets RBI for runs scored on the play except when the play was an error,
  // a double-play, or a fielder's choice. Only credit RBI when the scenario allows it
  // (not errors, DP, fielder's choice, or explicit suppression)
  const isFC = pa.appliedScenario?.isFielderChoice === true;
  const rbiAllowed = pa.appliedScenario?.rbiAllowed ?? (!isError && !isDP && !isFC);
        if (runs > 0 && rbiAllowed) {
          line.RBI += runs;
        }
        // If appliedScenario has scoredIndices, credit those players with runs
        if (pa.appliedScenario && Array.isArray(pa.appliedScenario.scoredIndices)) {
          pa.appliedScenario.scoredIndices.forEach((si: number) => {
            const scoredLine = box[si];
            if (scoredLine) scoredLine.R += 1;
          });
        } else {
          // Batter gets a run when he personally scores; credit HRs (batters scoring on HR)
          if (pa.result === 'hr') {
            line.R += 1;
          }
        }
      });
    });
    return box;
  };

  const awayBox = makeBox(lineupAway, awayInnings);
  const homeBox = makeBox(lineupHome, homeInnings);

  // Finalize pitcher logs
  homePitLog[homePitLog.length - 1].pitchCount = homePitState.pitchCount.value;
  homePitLog[homePitLog.length - 1].inningsEnd = inning;
  awayPitLog[awayPitLog.length - 1].pitchCount = awayPitState.pitchCount.value;
  awayPitLog[awayPitLog.length - 1].inningsEnd = inning;

  return { home: { runs: homeRuns, innings: homeInnings }, away: { runs: awayRuns, innings: awayInnings }, box: { home: homeBox, away: awayBox }, pitching: { home: homePitLog, away: awayPitLog } };
}
