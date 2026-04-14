import { XorShift32 } from './Random';
import { simulateAtBat } from './Simulator';

export interface PlateAppearance {
  batterIndex: number;
  result: string;
  appliedScenario: any | null;
  runsScored: number;
  isFielderChoice?: boolean;
}

export interface InningResult {
  runs: number;
  outs: number;
  baseState: { first: boolean; second: boolean; third: boolean };
  atBats: number;
  // ordered plate appearances for the inning
  plateAppearances: PlateAppearance[];
  // index of the next batter to bat (for lineup rotation)
  nextBatterIndex: number;
  // array of batter indices who had plate appearances in order
  battersUsed: number[];
  // total pitches thrown this inning
  pitchesThrown: number;
}

export interface LineupPlayer { id?: string | number; speed?: number; aggression?: number; batting?: number; strength?: number; streak?: number }

export function simulateInning(opts?: { rngSeed?: number; rng?: XorShift32; fielderSkills?: Record<string, number>; pitcherAttributes?: any; lineup?: LineupPlayer[]; startIndex?: number; forceAtBat?: { outcome?: string; zone?: string; appliedScenario?: any }; pitchCount?: { value: number }; stakes?: string; location?: string }): InningResult {
  const rng = opts?.rng ?? new XorShift32(opts?.rngSeed ?? 12345);
  const fielderSkills = opts?.fielderSkills ?? { LF: 60, CF: 60, RF: 60 };
  const pitcherAttributes = { pitching: 50, composure: 50, strength: 50, stamina: 50, awareness: 50, batting: 50, fielding: 50, streak: 50, ...(opts?.pitcherAttributes ?? {}) };
  const lineup = opts?.lineup ?? Array.from({ length: 9 }).map(() => ({ speed: 50, aggression: 0.2, batting: 50, strength: 50, streak: 50 } as LineupPlayer));
  let currentIndex = Math.max(0, Math.min(lineup.length - 1, opts?.startIndex ?? 0));

  let outs = 0;
  let runs = 0;
  let baseState = { first: false, second: false, third: false };
  // track which lineup index is on each base (or null)
  let baseIndices: { first: number | null; second: number | null; third: number | null } = { first: null, second: null, third: null };
  let atBats = 0;
  let inningPitches = 0;
  const pitchCountRef = opts?.pitchCount;
  const plateAppearances: PlateAppearance[] = [];
  const battersUsed: number[] = [];

  while (outs < 3) {
    const batter = lineup[currentIndex] ?? { speed: 50, aggression: 0.2 };
  const res = simulateAtBat({ pitcherAttributes, batterAttributes: { speed: batter.speed ?? 50, aggression: batter.aggression ?? 0.2, batting: batter.batting ?? 50, strength: batter.strength ?? 50, streak: batter.streak ?? 50 }, handedness: 'R', fielderSkills, rng, baseState, outs, pitchCount: pitchCountRef?.value ?? 0, force: opts?.forceAtBat, stakes: opts?.stakes, location: opts?.location });
    // update pitch counts
    const thrown = res.pitchesThrown ?? 1;
    inningPitches += thrown;
    if (pitchCountRef) pitchCountRef.value += thrown;
    // record which batter took the plate
    battersUsed.push(currentIndex);

    // determine which runners scored based on appliedScenario.state (if provided)
    const applied = res.appliedScenario ? { ...res.appliedScenario } : null;
    const scoredIndices: number[] = [];
    if (applied && typeof applied.state === 'object') {
      const nextState = applied.state as any;
      // compare previous base occupancy and nextState to see who left the bases
      if (baseIndices.third !== null && !nextState.third) scoredIndices.push(baseIndices.third);
      if (baseIndices.second !== null && !nextState.second) scoredIndices.push(baseIndices.second);
      if (baseIndices.first !== null && !nextState.first) scoredIndices.push(baseIndices.first);
      // if result is hr, batter scores as well
      if (res.result === 'hr') scoredIndices.push(currentIndex);
      // attach scoredIndices and propagate isFielderChoice flag to applied metadata
      applied.scoredIndices = scoredIndices;
      // if the appliedScenario already computed isFielderChoice, keep it; otherwise
      // keep any heuristic set earlier in Advancement.createScenario
      if (typeof applied.isFielderChoice === 'undefined') {
        applied.isFielderChoice = false;
      }
    }

    // capture the full plate appearance for box score
  plateAppearances.push({ batterIndex: currentIndex, result: res.result, appliedScenario: applied ?? null, runsScored: res.runsScored ?? 0, isFielderChoice: applied?.isFielderChoice });
  // advance batter index for next PA
  currentIndex = (currentIndex + 1) % lineup.length;

  atBats++;
  const scored = res.runsScored ?? 0;
  runs += scored;
    outs = res.outs;
    // update baseState and baseIndices according to res.baseState and the batter movement
    const newState = res.baseState;
    // simple mapping: if newState.first is true and previously false, batter likely ended on first
    // shift indices accordingly: build new baseIndices from previous and applied scenario
    if (res.appliedScenario && typeof (res.appliedScenario.state) === 'object') {
      const s = res.appliedScenario.state as any;
      // reset indices and try to map survivors
      const newBaseIndices = { first: null as number | null, second: null as number | null, third: null as number | null };
      // If batter ended on a base (s.first/second/third true while previous corresponding was false), assign batter index
      // Prefer assigning batter to the highest available base where occupancy changed
      if (s.third && !baseState.third) {
        newBaseIndices.third = currentIndex;
      }
      if (s.second && !baseState.second) {
        // if third already occupied by batter, shift accordingly
        if (newBaseIndices.third === currentIndex && baseState.third && baseIndices.third !== null) {
          newBaseIndices.second = baseIndices.third;
        } else {
          newBaseIndices.second = currentIndex;
        }
      }
      if (s.first && !baseState.first) {
        newBaseIndices.first = currentIndex;
      }
      // preserve any runners that remained on base
      if (s.first && baseState.first && baseIndices.first !== null && newBaseIndices.first === null) newBaseIndices.first = baseIndices.first;
      if (s.second && baseState.second && baseIndices.second !== null && newBaseIndices.second === null) newBaseIndices.second = baseIndices.second;
      if (s.third && baseState.third && baseIndices.third !== null && newBaseIndices.third === null) newBaseIndices.third = baseIndices.third;

      baseIndices = newBaseIndices;
      baseState = newState;
    } else {
      baseState = res.baseState;
      // unknown applied scenario: reset baseIndices conservatively
      baseIndices = { first: null, second: null, third: null };
    }
    // safety: avoid pathological infinite loops
    if (atBats >= 500) break;
  }

  return { runs, outs, baseState, atBats, plateAppearances, nextBatterIndex: currentIndex, battersUsed, pitchesThrown: inningPitches };
}
