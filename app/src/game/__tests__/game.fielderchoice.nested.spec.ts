import { describe, it, expect } from 'vitest';
import { simulateGame } from '../GameSimulator';

describe('nuanced fielder choice and RBI interactions', () => {
  it('multiple runners score on fielder choice with RBI suppressed', () => {
    const fakeInning = () => ({
      runs: 2,
      outs: 3,
      baseState: { first: false, second: false, third: false },
      atBats: 1,
      plateAppearances: [
        { batterIndex: 0, result: 'single', appliedScenario: { scoredIndices: [1,2], runs: 2, outsAdded: 1, rbiAllowed: false, isFielderChoice: true }, runsScored: 2 }
      ],
      nextBatterIndex: 1,
      battersUsed: [0]
    });

    const g = simulateGame({ rngSeed: 2, lineupAway: Array.from({ length: 9 }).map((_,i)=>({ id:`A${i}` })), lineupHome: Array.from({ length: 9 }).map((_,i)=>({ id:`H${i}` })), simulateInningOverride: fakeInning, maxInnings: 1 });
    expect(g.box.away[0].RBI).toBe(0);
    expect(g.box.away[1].R).toBe(1);
    expect(g.box.away[2].R).toBe(1);
  });

  it('fielder choice combined with error suppresses RBI', () => {
    const fakeInning = () => ({
      runs: 1,
      outs: 3,
      baseState: { first: false, second: false, third: false },
      atBats: 1,
      plateAppearances: [
        { batterIndex: 3, result: 'error', appliedScenario: { scoredIndices: [4], runs: 1, outsAdded: 0, rbiAllowed: false, isFielderChoice: true }, runsScored: 1 }
      ],
      nextBatterIndex: 4,
      battersUsed: [3]
    });

    const g = simulateGame({ rngSeed: 3, lineupAway: Array.from({ length: 9 }).map((_,i)=>({ id:`A${i}` })), lineupHome: Array.from({ length: 9 }).map((_,i)=>({ id:`H${i}` })), simulateInningOverride: fakeInning, maxInnings: 1 });
    expect(g.box.away[3].RBI).toBe(0);
    expect(g.box.away[4].R).toBe(1);
  });

  it('double-play plus fielder choice does not award RBI', () => {
    const fakeInning = () => ({
      runs: 1,
      outs: 3,
      baseState: { first: false, second: false, third: false },
      atBats: 1,
      plateAppearances: [
        { batterIndex: 5, result: 'single', appliedScenario: { scoredIndices: [6], runs: 1, outsAdded: 2, rbiAllowed: false, isFielderChoice: true }, runsScored: 1 }
      ],
      nextBatterIndex: 6,
      battersUsed: [5]
    });

    const g = simulateGame({ rngSeed: 4, lineupAway: Array.from({ length: 9 }).map((_,i)=>({ id:`A${i}` })), lineupHome: Array.from({ length: 9 }).map((_,i)=>({ id:`H${i}` })), simulateInningOverride: fakeInning, maxInnings: 1 });
    expect(g.box.away[5].RBI).toBe(0);
    expect(g.box.away[6].R).toBe(1);
  });
});
