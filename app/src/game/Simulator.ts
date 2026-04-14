import { XorShift32, sampleFromDistribution } from './Random';
import { computePitchOutcome } from './Pitch';
import { computeBatterResponse } from './BatterEngine';
import { placementDistribution } from './BallPlacement';
import { resolveContactWithZone } from './ContactResolver';
import { resolveAdvancement, BaseState } from './Advancement';

export interface AtBatContext {
  pitcherAttributes: any;
  batterAttributes: any;
  handedness: 'L'|'R';
  pitchType?: string | null;
  weather?: string | null;
  stakes?: string | null;
  location?: string | null;
  fielderSkills: Record<string, number>;
  rngSeed?: number;
  rng?: XorShift32;
  baseState?: BaseState;
  outs?: number;
  pitchCount?: number; // cumulative pitches thrown by the pitcher before this AB
  // optional test-only force object to select an outcome/zone or an applied scenario
  force?: { outcome?: string; zone?: string; appliedScenario?: any };
}

export function simulateAtBat(ctx: AtBatContext): { result: string; zone: string; advancement?: { expectedRuns: number; scenarios: any[]; } ; outs: number; baseState: BaseState; runsScored?: number; appliedScenario?: any; pitchesThrown: number } {
  const rng = ctx.rng ?? new XorShift32(ctx.rngSeed ?? 12345);

  const pa = { pitching:50, composure:50, strength:50, stamina:50, awareness:50, batting:50, fielding:50, streak:50, ...ctx.pitcherAttributes };
  const ba = { batting:50, strength:50, speed:50, aggression:0.2, streak:50, ...ctx.batterAttributes };

  const pitchOutcome = computePitchOutcome({ pitcher: { attributes: pa }, location: (ctx.location ?? 'neutral') as any, stakes: (ctx.stakes ?? 'regular') as any, weather: (ctx.weather ?? 'clear') as any, pitchCount: ctx.pitchCount ?? 0, pitchType: ctx.pitchType as any, technique: pa.composure });

  const batterResp = computeBatterResponse(pitchOutcome, { batter: { attributes: ba }, aggression: ba.streak ?? 50 });

  // default base state and outs
  const base = ctx.baseState ?? { first:false, second:false, third:false };
  const outs = ctx.outs ?? 0;

  // Simulate a multi-pitch at-bat: loop pitches until the batter swings,
  // walks (4 balls), or strikes out looking (3 called strikes).
  let balls = 0;
  let strikes = 0;
  let pitchesThrown = 0;
  const maxPitches = 12; // safety cap
  for (let p = 0; p < maxPitches; p++) {
    pitchesThrown++;
    let swing = rng.next() < batterResp.swingProbability;
    if (ctx.force) swing = true;

    if (swing) break; // batter swings — proceed to contact resolution below

    // Batter took the pitch: determine ball or strike based on pitch effectiveness.
    // Higher effectiveness → more likely a called strike.
    const isStrike = rng.next() < (0.35 + pitchOutcome.pitchEffectiveness * 0.3);
    if (isStrike) {
      strikes++;
      if (strikes >= 3) {
        // Strikeout looking
        return { result: 'out', zone: 'P', outs: outs + 1, baseState: base, appliedScenario: { outsAdded: 1, state: base, runs: 0 }, pitchesThrown };
      }
    } else {
      balls++;
      if (balls >= 4) {
        // Walk — batter takes first base, push runners if forced
        const walkState = { ...base };
        let walkRuns = 0;
        if (base.first) {
          if (base.second) {
            if (base.third) { walkRuns = 1; } // bases loaded walk
            walkState.third = true;
          }
          walkState.second = true;
        }
        walkState.first = true;
        return { result: 'walk', zone: 'P', outs, baseState: walkState, runsScored: walkRuns, appliedScenario: { outsAdded: 0, state: walkState, runs: walkRuns }, pitchesThrown };
      }
    }
  }

  // 1 extra pitch for the contact pitch (the swing)
  pitchesThrown++;

  // sample placement unless a test forces an outcome/zone
  const placement = placementDistribution({ contactQuality: batterResp.contactQuality, handedness: ctx.handedness, pitchType: ctx.pitchType as any, weather: ctx.weather as any });
  let zone = sampleFromDistribution(placement, rng) as string;
  if (ctx.force && ctx.force.zone) zone = ctx.force.zone as string;

  // resolve contact
  const zoneOutcome = resolveContactWithZone({ contactQuality: batterResp.contactQuality, batterStrength: ba.strength, fielderSkill: ctx.fielderSkills[zone] ?? 60 }, zone as any, ctx.fielderSkills);

  const outcomeKey = ctx.force?.outcome ? ctx.force.outcome : sampleFromDistribution(zoneOutcome as any, rng);

  // infer outType from zone for out resolution heuristics
  const outTypeFromZone = (z:string) => {
    if (z.startsWith('IF') || z === 'P') return 'ground';
    if (z.startsWith('OF')) return 'fly';
    return 'generic';
  };

  // if result is a hit-type we should resolve advancement
  if (['single','double','triple','hr','error'].includes(outcomeKey)) {
    const adv = resolveAdvancement(outcomeKey as any, base, { first: ba.speed ?? 50 }, { LF: ctx.fielderSkills.LF ?? 60, CF: ctx.fielderSkills.CF ?? 60, RF: ctx.fielderSkills.RF ?? 60 }, { outs, aggression: ba.aggression ?? 0.2 });
    // sample one advancement scenario using the same RNG so we can apply it to game state
  const dist: Record<string, number> = {};
  adv.scenarioProbs.forEach((s:any) => { dist[JSON.stringify(s.state)] = (s.prob ?? 0); });
  const sampledKey = sampleFromDistribution(dist, rng as any) as any;
    let sampled = adv.scenarioProbs.find((s:any) => JSON.stringify(s.state) === sampledKey) ?? adv.scenarioProbs[0];
    // allow an explicit appliedScenario from force to be used (test-only)
    if (ctx.force && ctx.force.appliedScenario) {
      sampled = { ...ctx.force.appliedScenario };
    }
    const appliedOuts = outs + (sampled.outsAdded ?? 0);
    const appliedBase = sampled.state;
    const runsScored = sampled.runs ?? 0;
  // propagate fielder's choice detection from here if not already set by the advancement
    if (typeof sampled.isFielderChoice === 'undefined' || sampled.isFielderChoice === false) {
      const batterOnBase = !!(appliedBase.first || appliedBase.second || appliedBase.third);
      const batterScored = Array.isArray(sampled.scoredPositions) && sampled.scoredPositions.includes('batter');
      // if one or more outs were added and the batter ended on base without scoring,
      // and the play came from an infield zone, treat as a fielder's choice
      const infieldZones = ['IF1','IF2','IF3','1B','2B','3B','SS','P'];
      if ((sampled.outsAdded ?? 0) > 0 && batterOnBase && !batterScored && infieldZones.includes(zone as string)) {
        sampled.isFielderChoice = true;
      }
    }
    return { result: outcomeKey, zone, advancement: { expectedRuns: adv.expectedRuns, scenarios: adv.scenarioProbs }, outs: appliedOuts, baseState: appliedBase, runsScored, appliedScenario: sampled, pitchesThrown };
  }

  // handle outs: include outType to allow DP/sac-fly modeling
  if (outcomeKey === 'out') {
    const outType = outTypeFromZone(zone as string) as any;
    const adv = resolveAdvancement('out', base, { first: ba.speed ?? 50 }, { LF: ctx.fielderSkills.LF ?? 60, CF: ctx.fielderSkills.CF ?? 60, RF: ctx.fielderSkills.RF ?? 60 }, { outs, aggression: ba.aggression ?? 0.2, outType });
  const dist: Record<string, number> = {};
  adv.scenarioProbs.forEach((s:any) => { dist[JSON.stringify(s.state)] = (s.prob ?? 0); });
  const sampledKey = sampleFromDistribution(dist, rng as any) as any;
    const sampled = adv.scenarioProbs.find((s:any) => JSON.stringify(s.state) === sampledKey) ?? adv.scenarioProbs[0];
    const appliedOuts = outs + (sampled.outsAdded ?? 1);
    const appliedBase = sampled.state;
    const runsScored = sampled.runs ?? 0;
    // for out-type resolutions, also mark fielder's choice when appropriate
    if (typeof sampled.isFielderChoice === 'undefined' || sampled.isFielderChoice === false) {
      const batterOnBase = !!(appliedBase.first || appliedBase.second || appliedBase.third);
      const batterScored = Array.isArray(sampled.scoredPositions) && sampled.scoredPositions.includes('batter');
      const infieldZones = ['IF1','IF2','IF3','1B','2B','3B','SS','P'];
      if ((sampled.outsAdded ?? 0) > 0 && batterOnBase && !batterScored && infieldZones.includes(zone as string)) {
        sampled.isFielderChoice = true;
      }
    }
    return { result: outcomeKey, zone, advancement: { expectedRuns: adv.expectedRuns, scenarios: adv.scenarioProbs }, outs: appliedOuts, baseState: appliedBase, runsScored, appliedScenario: sampled, pitchesThrown };
  }

  return { result: outcomeKey, zone, outs, baseState: base, pitchesThrown };
}
