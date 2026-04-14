import { describe, it, expect } from 'vitest';
import { simulateGame } from '../GameSimulator';

describe('fielder choice RBI suppression', () => {
  it('suppresses RBI by default for a fielder choice', () => {
    const fakeInning = () => ({
      runs: 1,
      outs: 3,
      baseState: { first: false, second: false, third: false },
      atBats: 1,
      plateAppearances: [
        { batterIndex: 0, result: 'single', appliedScenario: { scoredIndices: [1], runs: 1, outsAdded: 1, rbiAllowed: false, isFielderChoice: true }, runsScored: 1 }
      ],
      nextBatterIndex: 1,
      battersUsed: [0]
    });

    const g = simulateGame({ rngSeed: 1, lineupAway: Array.from({ length: 9 }).map((_,i)=>({ id:`A${i}` })), lineupHome: Array.from({ length: 9 }).map((_,i)=>({ id:`H${i}` })), simulateInningOverride: fakeInning, maxInnings: 1 });
    expect(g.box.away[0].RBI).toBe(0); // batter should not get RBI
    expect(g.box.away[1].R).toBe(1); // runner scored
  });

  it('awards RBI when scenario explicitly allows it despite FC', () => {
    const fakeInning = () => ({
      runs: 1,
      outs: 3,
      baseState: { first: false, second: false, third: false },
      atBats: 1,
      plateAppearances: [
        { batterIndex: 0, result: 'single', appliedScenario: { scoredIndices: [1], runs: 1, outsAdded: 1, rbiAllowed: true, isFielderChoice: true }, runsScored: 1 }
      ],
      nextBatterIndex: 1,
      battersUsed: [0]
    });

    const g = simulateGame({ rngSeed: 1, lineupAway: Array.from({ length: 9 }).map((_,i)=>({ id:`A${i}` })), lineupHome: Array.from({ length: 9 }).map((_,i)=>({ id:`H${i}` })), simulateInningOverride: fakeInning, maxInnings: 1 });
    expect(g.box.away[0].RBI).toBe(1); // batter explicitly allowed RBI
    expect(g.box.away[1].R).toBe(1); // runner scored
  });
});
