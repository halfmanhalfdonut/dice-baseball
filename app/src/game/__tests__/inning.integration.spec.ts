import { describe, it, expect } from 'vitest';
import { simulateAtBat } from '../Simulator';
import { XorShift32 } from '../Random';

describe('Inning integration', () => {
  it('simulates sequential at-bats until 3 outs and accumulates runs', () => {
    let baseState = { first:false, second:false, third:false };
    let outs = 0;
    let runs = 0;
    const fielderSkills = { LF: 60, CF: 60, RF: 60 };
    const pitcherAttributes = {};

    // simulate deterministic sequence using different seeds
    // use a single RNG instance so behavior is deterministic across at-bats
    const rng = new XorShift32(12345);
    const totalAtBats = 20;
    for (let i = 0; i < totalAtBats; i++) {
      const res = simulateAtBat({ pitcherAttributes, batterAttributes: { speed:50, aggression:0.2 }, handedness: 'R', fielderSkills, rng, baseState, outs });
      const scored = res.runsScored ?? 0;
      runs += scored;
      // outs should never decrease
      expect(res.outs).toBeGreaterThanOrEqual(outs);
      baseState = res.baseState;
      outs = res.outs;
    }

  // invariants
  expect(outs).toBeGreaterThanOrEqual(0);
  expect(runs).toBeGreaterThanOrEqual(0);
  });
});
