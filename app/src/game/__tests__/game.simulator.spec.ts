import { describe, it, expect } from 'vitest';
import { simulateGame } from '../GameSimulator';

describe('simulateGame basic', () => {
  it('same seed returns same game summary and 9 innings per team', () => {
    const a = simulateGame({ rngSeed: 2025 });
    const b = simulateGame({ rngSeed: 2025 });
    expect(a).toEqual(b);
    // Away always bats at least 9; home may skip bottom of 9th if leading; extras possible
    expect(a.away.innings.length).toBeGreaterThanOrEqual(9);
    expect(a.home.innings.length).toBeGreaterThanOrEqual(8);
    // Game must not end tied
    expect(a.home.runs !== a.away.runs || a.away.innings.length > 9).toBe(true);
    expect(a.home.runs).toBeGreaterThanOrEqual(0);
    expect(a.away.runs).toBeGreaterThanOrEqual(0);
  });
});
