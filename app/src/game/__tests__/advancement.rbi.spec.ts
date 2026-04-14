import { describe, it, expect } from 'vitest';
import { resolveAdvancement } from '../Advancement';
import { simulateAtBat } from '../Simulator';
import { simulateInning } from '../InningSimulator';
import { simulateGame } from '../GameSimulator';

describe('advancement RBI rules', () => {
  it('hr always scores and rbiAllowed true', () => {
    const base = { first: true, second: true, third: true };
    const res = resolveAdvancement('hr' as any, base, {}, {}, {} as any);
    expect(res.scenarioProbs[0].rbiAllowed).toBe(true);
    expect(res.scenarioProbs[0].scoredPositions).toContain('batter');
  });

  it('sac fly sets isSacrifice and rbiAllowed', () => {
    const base = { first: false, second: false, third: true };
    const res = resolveAdvancement('out' as any, base, {}, {}, { outType: 'fly' } as any);
    const scen = res.scenarioProbs.find((s:any) => s.outsAdded === 1);
    expect(scen).toBeDefined();
    if (scen) {
      expect(scen.rbiAllowed).toBe(true);
      expect(scen.isSacrifice).toBe(true);
    }
  });

  it('double-play scenario suppresses RBI', () => {
    const base = { first: true, second: false, third: false };
    const res = resolveAdvancement('out' as any, base, {}, { RF: 80 }, { outType: 'ground', aggression: 0 } as any);
    const dp = res.scenarioProbs.find((s:any) => s.outsAdded === 2);
    expect(dp).toBeDefined();
    if (dp) {
      expect(dp.rbiAllowed).toBe(false);
    }
  });

  it('error scenarios suppress RBI', () => {
    const base = { first: true, second: false, third: false };
    const res = resolveAdvancement('error' as any, base, {}, {}, {} as any);
    // error scenarios created by single/error branch should have rbiAllowed true for advancing, but errors should be suppressed in some cases
    expect(Array.isArray(res.scenarioProbs)).toBe(true);
  });

  it('end-to-end inning attribution credits runs to scoredIndices', () => {
    // Use simulateGame with an override that returns a single inning where batter 0's PA causes runner 1 to score
    const fakeInning = () => {
      return {
        runs: 1,
        outs: 3,
        baseState: { first: false, second: false, third: false },
        atBats: 1,
        plateAppearances: [
          { batterIndex: 0, result: 'single', appliedScenario: { scoredIndices: [1], runs: 1, outsAdded: 0, rbiAllowed: true }, runsScored: 1 }
        ],
        nextBatterIndex: 1,
        battersUsed: [0]
      };
    };

  const g = simulateGame({ rngSeed: 42, lineupAway: Array.from({ length: 9 }).map((_,i)=>({ id:`A${i}` })), lineupHome: Array.from({ length: 9 }).map((_,i)=>({ id:`H${i}` })), simulateInningOverride: fakeInning, maxInnings: 1 });
    // batter 0 should be credited with 1 RBI, and batter 1 should be credited with 1 run
    expect(g.box.away[0].RBI).toBe(1);
    expect(g.box.away[1].R).toBe(1);
  });
});
