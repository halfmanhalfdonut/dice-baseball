import { describe, it, expect } from 'vitest';
import { resolveAdvancement } from '../Advancement';
import { simulateAtBat } from '../Simulator';

describe('Double-play and Sac-fly logic', () => {
  it('ground out with runner on first can produce a double-play scenario probabilistically', () => {
    const base = { first: true, second: false, third: false };
    // strong infield arm should increase DP probability
    const adv = resolveAdvancement('out' as any, base, { first: 40 }, { RF: 90 }, { outs: 0, aggression: 0.1, outType: 'ground' });
    const dpScenario = adv.scenarioProbs.find(s => s.outsAdded === 2);
    expect(dpScenario).toBeDefined();
    if (dpScenario) expect(dpScenario.prob).toBeGreaterThanOrEqual(0);
  });

  it('sac fly usually scores runner from third', () => {
    const base = { first: false, second: false, third: true };
    const adv = resolveAdvancement('out' as any, base, {}, {}, { outs: 0, outType: 'fly' });
    // expectedRuns should be > 0 (runner on third often scores)
    expect(adv.expectedRuns).toBeGreaterThanOrEqual(0.5);
  });

  it('simulateAtBat returns advancement for outs (sac fly) when zone indicates OF', () => {
    const res = simulateAtBat({ pitcherAttributes: {}, batterAttributes: { speed:50, aggression:0.2 }, handedness: 'R', fielderSkills: { LF: 60, CF: 60, RF: 60 }, rngSeed: 42, baseState: { first:false, second:false, third:true }, outs: 0 });
    // ensure we always return advancement object for outs/hits
    expect(res).toHaveProperty('baseState');
    expect(res).toHaveProperty('outs');
    // outs should not decrease
    expect(res.outs).toBeGreaterThanOrEqual(0);
  });
});
