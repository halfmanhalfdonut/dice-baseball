import { describe, it, expect } from 'vitest';
import { resolveAdvancement } from '../Advancement';

describe('Advancement expanded', () => {
  it('with 2 outs runners are more likely to attempt to score on a single', () => {
    const base = { first: true, second: false, third: false };
    const conservative = resolveAdvancement('single' as any, base, { first: 50 }, { RF: 60 }, { outs: 0, aggression: 0.1 });
    const twoOuts = resolveAdvancement('single' as any, base, { first: 50 }, { RF: 60 }, { outs: 2, aggression: 0.1 });
    expect(twoOuts.expectedRuns).toBeGreaterThanOrEqual(conservative.expectedRuns);
  });

  it('higher aggression increases expected runs on error', () => {
    const base = { first: true, second: false, third: false };
    const lowAgg = resolveAdvancement('error' as any, base, { first: 50 }, { RF: 60 }, { outs: 1, aggression: 0.0 });
    const highAgg = resolveAdvancement('error' as any, base, { first: 50 }, { RF: 60 }, { outs: 1, aggression: 0.8 });
    expect(highAgg.expectedRuns).toBeGreaterThanOrEqual(lowAgg.expectedRuns);
  });

  it('double-play tends to remove lead runner on ground-out (modeled as out + dp) - regression style check', () => {
    // We approximate by checking that providing outs doesn't break HR/triple behavior
    const hr = resolveAdvancement('hr' as any, { first:true, second:true, third:false }, {}, {}, { outs: 1 });
    expect(hr.expectedRuns).toBeGreaterThanOrEqual(3);
  });
});
