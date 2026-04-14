import { describe, it, expect } from 'vitest';
import { simulateGame } from '../GameSimulator';

describe('simulateGame lineup rotation', () => {
  it('rotates batting order across innings and preserves indices', () => {
    const lineupAway = Array.from({ length: 9 }).map((_, i) => ({ id: `A${i}`, speed: 50, aggression: 0.2 }));
    const lineupHome = Array.from({ length: 9 }).map((_, i) => ({ id: `H${i}`, speed: 50, aggression: 0.2 }));

    const g = simulateGame({ rngSeed: 424242, lineupAway, lineupHome });

    // should have 9 innings each
    expect(g.away.innings.length).toBe(9);
    expect(g.home.innings.length).toBe(9);

    // Collect first batters used in away innings to ensure rotation
    const awayFirstBatters = g.away.innings.map((inn) => inn.battersUsed[0]);
    // should all be numbers between 0..8
    awayFirstBatters.forEach((idx) => expect(idx).toBeGreaterThanOrEqual(0));
    awayFirstBatters.forEach((idx) => expect(idx).toBeLessThanOrEqual(8));

    // Ensure that at least one inning does not start with the same batter (rotation happened)
    const allSame = awayFirstBatters.every((v) => v === awayFirstBatters[0]);
    expect(allSame).toBe(false);
  });
});
