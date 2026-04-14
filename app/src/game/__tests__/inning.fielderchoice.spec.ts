import { describe, it, expect } from 'vitest';

import { simulateInning } from '../InningSimulator';

describe('inning simulate FC propagation', () => {
  it('records isFielderChoice on plate appearance when forced via forceAtBat', () => {
    const res = simulateInning({ rngSeed: 42, lineup: Array.from({ length: 9 }).map(() => ({ speed: 50, aggression: 0.2 })), forceAtBat: { outcome: 'single', zone: 'IF1', appliedScenario: { state: { first: true, second: false, third: false }, runs: 0, prob: 1, outsAdded: 1, scoredPositions: [], rbiAllowed: false, isFielderChoice: true } } });
    expect(res.plateAppearances.length).toBeGreaterThan(0);
    const pa = res.plateAppearances[0];
    expect(pa.isFielderChoice).toBe(true);
    expect(pa.appliedScenario?.isFielderChoice).toBe(true);
  });
});
