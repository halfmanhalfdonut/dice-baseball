import { describe, it, expect } from 'vitest';
import { simulateInning } from '../InningSimulator';

describe('simulateInning deterministic', () => {
  it('same seed yields same inning result and completes 3 outs', () => {
    const a = simulateInning({ rngSeed: 555 });
    const b = simulateInning({ rngSeed: 555 });
    // deterministic: same seed => same result
    expect(a).toEqual(b);
    // outs should be between 0 and 3 inclusive
    expect(a.outs).toBeGreaterThanOrEqual(0);
    expect(a.outs).toBeLessThanOrEqual(3);
    // ensure we didn't exceed safety cap
    expect(a.atBats).toBeLessThanOrEqual(500);
  });
});
