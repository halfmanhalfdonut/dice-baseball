import { describe, it, expect } from 'vitest';
import { resolveAdvancement } from '../Advancement';

describe('Advancement', () => {
  it('HR results in deterministic scoring of all runners', () => {
    const res = resolveAdvancement('hr' as any, { first:true, second:true, third:true }, {}, {});
    expect(res.expectedRuns).toBe(4);
    expect(res.scenarioProbs[0].prob).toBe(1);
  });

  it('faster batter increases probability of extra bases on single/double', () => {
    const base = { first:true, second:false, third:false };
    const slow = resolveAdvancement('single', base, { first:20, batter:20 }, { RF: 60 });
    const fast = resolveAdvancement('single', base, { first:80, batter:80 }, { RF: 60 });

    // compare expectedRuns as a proxy for scoring/advancement
    expect(fast.expectedRuns).toBeGreaterThanOrEqual(slow.expectedRuns);
  });

  it('stronger arm reduces scoring probability on triples/doubles', () => {
    const base = { first:true, second:true, third:false };
    const weakArm = resolveAdvancement('triple', base, { first:50, second:50 }, { CF: 20 });
    const strongArm = resolveAdvancement('triple', base, { first:50, second:50 }, { CF: 90 });
    expect(weakArm.expectedRuns).toBeGreaterThanOrEqual(strongArm.expectedRuns);
  });
});
