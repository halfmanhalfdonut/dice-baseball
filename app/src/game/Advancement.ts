export type HitType = 'out'|'single'|'double'|'triple'|'hr'|'error';

export interface BaseState {
  first: boolean;
  second: boolean;
  third: boolean;
}

export interface RunnerSpeeds {
  first?: number; // 0..100
  second?: number;
  third?: number;
  batter?: number;
}

export interface FielderArms {
  LF?: number; // 0..100
  CF?: number;
  RF?: number;
}

export interface AdvancementScenario {
  state: BaseState;
  runs: number;
  prob: number;
  outsAdded?: number;
  // which runner positions scored on this scenario (batter or base positions)
  scoredPositions?: Array<'batter'|'first'|'second'|'third'>;
  // whether RBI should be credited to the batter for runs scored on this play
  rbiAllowed?: boolean;
  // whether the play is a sacrifice (e.g., sac fly) which does not count as an AB
  isSacrifice?: boolean;
  // whether the batter reached on a fielder's choice (affects RBI attribution)
  isFielderChoice?: boolean;
}

export interface AdvancementResult {
  expectedRuns: number;
  scenarioProbs: Array<AdvancementScenario>;
}

/**
 * Simple model for baserunner advancement. This is intentionally small and
 * probabilistic: it returns a small list of possible resulting base states
 * with probabilities and expected runs. Tests should assert relative
 * relationships (faster runners -> higher scoring probability, stronger
 * arm -> lower scoring probability).
 */
export function resolveAdvancement(hit: HitType, base: BaseState, speeds: RunnerSpeeds, arms: FielderArms, options?: { outs?: number; aggression?: number; tuning?: { k?: number; midpoint?: number }; outType?: 'generic'|'ground'|'fly' }): AdvancementResult {
  const outs = options?.outs ?? 0;
  const aggression = options?.aggression ?? 0.2; // 0..1, how aggressively runners take extra bases
  // tuning parameters for logistic curves
  const tuning = options?.tuning ?? { k: 8, midpoint: 50 };
  const k = typeof tuning.k === 'number' ? tuning.k : 8;
  const midpoint = typeof tuning.midpoint === 'number' ? tuning.midpoint : 50;

  // logistic helper: maps x (0..100) to (0..1) with steepness k and midpoint m
  const logistic = (x:number, kLocal:number, mLocal:number) => {
    const ex = Math.exp(-kLocal * ((x - mLocal) / 100));
    return 1 / (1 + ex);
  };

  // helper to build scenario and compute scored positions from previous base
  const createScenario = (newState: BaseState, runs: number, prob: number, outsAdded?: number, rbiAllowed?: boolean, isSacrifice?: boolean, isFielderChoiceOverride?: boolean) : AdvancementScenario => {
    const scored: Array<'batter'|'first'|'second'|'third'> = [];
    // detect which base runners scored by comparing prior base occupancy to new state
    if (base.third && !newState.third) scored.push('third');
    if (base.second && !newState.second) scored.push('second');
    if (base.first && !newState.first) scored.push('first');

    // detect batter scoring: happens when runs exceed the number of removed base runners
    const baseRunnersRemoved = scored.length;
    if (runs > baseRunnersRemoved) {
      // extra run(s) are attributed to the batter (typical for HR, or batter scoring on errors)
      // add 'batter' once if at least one extra run exists
      scored.push('batter');
    }

    // default RBI behavior: if rbiAllowed explicitly provided, use it; otherwise
    // suppress RBI on error plays by default and allow on normal plays
    let finalRbiAllowed = typeof rbiAllowed === 'boolean' ? rbiAllowed : true;
    if (hit === 'error' && typeof rbiAllowed !== 'boolean') {
      finalRbiAllowed = false;
    }

    // Heuristic detection for fielder's choice: if outs were recorded (outsAdded>0)
    // and the batter still ends up on a base (i.e., batter did not score and one or more
    // existing runners were removed), treat as a fielder's choice unless caller overrides.
    let isFielderChoice = false;
    if (typeof isFielderChoiceOverride === 'boolean') {
      isFielderChoice = isFielderChoiceOverride;
    } else {
      const batterOnBase = (!newState.first && !newState.second && !newState.third) ? false : true;
      const batterScored = scored.includes('batter');
      if ((outsAdded && outsAdded > 0) && batterOnBase && !batterScored) {
        isFielderChoice = true;
      }
    }

    return { state: newState, runs, prob, outsAdded, scoredPositions: scored, rbiAllowed: finalRbiAllowed, isSacrifice: !!isSacrifice, isFielderChoice };
  };

  // HR: deterministic: all runners + batter score
  if (hit === 'hr') {
    const runners = (base.first ? 1 : 0) + (base.second ? 1 : 0) + (base.third ? 1 : 0) + 1;
    return {
      expectedRuns: runners,
      scenarioProbs: [createScenario({ first:false, second:false, third:false }, runners, 1, 0, true)]
    };
  }

  // For triples: batter to 3rd, other runners likely to score; use simple probability
  if (hit === 'triple') {
    const scenarios: any[] = [];
    let expectedRuns = 0;

    // runner on third always scores
    const r3 = base.third ? 1 : 0;

  // runner on second: score prob depends on speed and arm (CF)
  const s2 = base.second ? (speeds.second ?? 50) : 0;
    const armCF = arms.CF ?? 60;
  // use logistic curves to compute base probabilities then adjust by arm
  let prob2Scores = base.second ? Math.max(0, Math.min(1, logistic(s2, k, midpoint) - (armCF/100) * 0.25)) : 0;

    // runner on first: longer to score; depends on speed and arm
  const s1 = base.first ? (speeds.first ?? 50) : 0;
  let prob1Scores = base.first ? Math.max(0, Math.min(1, logistic(s1, k, midpoint + 10) - (armCF/100) * 0.18)) : 0;

  // Outs and aggression make runners more likely to try to score on a big hit
  // outs & aggression increase willingness to take extra bases; model as logistic shift
  const boostFactor = 1 + aggression * (outs >= 2 ? 0.5 : 0.25);
  prob2Scores = Math.min(1, prob2Scores * boostFactor);
  prob1Scores = Math.min(1, prob1Scores * boostFactor);

    // build two scenario probabilities (all score vs only some score) simplified
    const probAll = prob2Scores * prob1Scores;
    const probSome = (prob2Scores + prob1Scores) - probAll;
    const probNone = 1 - (probAll + probSome);

  // all score
  scenarios.push(createScenario({ first:false, second:false, third:true }, r3 + (base.second?1:0) + (base.first?1:0) + 0 /* batter to 3rd but not score */, probAll, 0, true));
  // some score
  scenarios.push(createScenario({ first:false, second:true, third:true }, r3 + (prob2Scores>0?1:0), probSome, 0, true));
  // none score
  scenarios.push(createScenario({ first:false, second:true, third:true }, r3, probNone, 0, true));

    expectedRuns = scenarios.reduce((s:any, sc:any) => s + sc.runs * sc.prob, 0);

    return { expectedRuns, scenarioProbs: scenarios };
  }

  // For doubles and singles and errors, provide simplified behavior focusing on lead runner on first
  // We'll model single: batter to first, existing runners may advance depending on speed and arm
  if (hit === 'single' || hit === 'double' || hit === 'error') {
    // simplistic model: focus on runner on first
  const s1 = base.first ? (speeds.first ?? 50) : 0;
  const armRF = arms.RF ?? 60;

  // base probabilities using logistic curves; double gives batter extra baseline
  let probTo3 = base.first ? Math.max(0, Math.min(1, logistic(s1, k, midpoint - 5) - (armRF/100)*0.18 + (hit === 'double' ? 0.25 : 0))) : 0;
  let probScoreOnDouble = base.first && hit === 'double' ? Math.max(0, Math.min(1, logistic(s1, k, midpoint + 5) - (armRF/100)*0.22 + 0.15)) : 0;

  // aggression & outs influence advancement (more aggressive or with 2 outs -> higher advance)
  const advanceBoost = 1 + aggression * (outs >= 2 ? 0.6 : 0.25);
  probTo3 = Math.min(1, probTo3 * advanceBoost);
  probScoreOnDouble = Math.min(1, probScoreOnDouble * advanceBoost);

    const scenarios: any[] = [];

    if (hit === 'double') {
      // batter to second; runner on first scores (scenario 1) or stays at third (scenario 2)
      // runner on third always scores in both scenarios
      const r3 = base.third ? 1 : 0;
      const r1Scores = base.first ? 1 : 0;
    scenarios.push(createScenario({ first:false, second:true, third: base.third && !base.first }, r3 + r1Scores, probScoreOnDouble, 0, true));
    scenarios.push(createScenario({ first:false, second:true, third:true }, r3, 1 - probScoreOnDouble, 0, true));
      const expectedRuns = scenarios.reduce((s:any, sc:any) => s + sc.runs * sc.prob, 0);
      return { expectedRuns, scenarioProbs: scenarios };
    }

    // single or error
    const probAdvanceTo3 = probTo3;
    const probStay2 = base.first ? 1 - probAdvanceTo3 : 0;

  // error increases chance of extra advancement
  const errorBonus = hit === 'error' ? 0.2 + aggression * 0.15 : 0;

    const scenarios2: any[] = [];
    // runner to third
  scenarios2.push(createScenario({ first:false, second: base.second, third: true }, (base.third?1:0), Math.min(1, probAdvanceTo3 + errorBonus), 0, true));
  // runner to second
  scenarios2.push(createScenario({ first:false, second: true, third: base.third }, (base.third?1:0), Math.max(0, probStay2 - errorBonus), 0, true));

    const expected = scenarios2.reduce((s:any, sc:any) => s + sc.runs * sc.prob, 0);
    return { expectedRuns: expected, scenarioProbs: scenarios2 };
  }

  // fallback: no advancement
  // handle outs: can be sac fly (runner on third may score) or ground double-play
  if (hit === 'out') {
    const outType = options?.outType ?? 'generic';
    // sac fly: runner on third scores often
    if (outType === 'fly' && base.third) {
      // runner scores; one out recorded
      const runs = 1;
      const newState = { first: base.first, second: base.second, third: false };
  return { expectedRuns: runs, scenarioProbs: [createScenario(newState, runs, 0.9, 1, true, true), createScenario(base, 0, 0.1, 1, false, false)] };
    }

    // ground: possible double-play when force exists (runner on first)
    if (outType === 'ground' && base.first) {
      // simple DP model: probability of DP depends on infield arm and aggression
      const infArm = (arms.RF ?? 60) / 100; // use RF as proxy for infield arm if specific is not present
      const dpProb = Math.max(0, Math.min(1, 0.25 + (infArm * 0.35) - (aggression * 0.15)));
      // if DP occurs: outs +2, lead runner removed, batter out also -> runner on first removed
    const dpState = { first: false, second: base.second, third: base.third };
      // if no DP: regular out, runner hold or advance one base rarely
      const noDpState = { first: base.first, second: base.second, third: base.third };
      const runs = 0;
  return { expectedRuns: 0, scenarioProbs: [createScenario(dpState, runs, dpProb, 2, false, false), createScenario(noDpState, runs, 1 - dpProb, 1, false, false)] };
    }

    // generic out: no advancement
    return { expectedRuns: 0, scenarioProbs: [createScenario(base, 0, 1, 1, false)] };
  }

  return { expectedRuns: 0, scenarioProbs: [createScenario(base, 0, 1, 1, false)] };
}
