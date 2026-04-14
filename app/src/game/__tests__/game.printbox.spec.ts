import { describe, it, expect } from 'vitest';
import { simulateGame } from '../GameSimulator';

describe('print box score for inspection', () => {
  it('prints a box score (deterministic)', () => {
    const lineupAway = Array.from({ length: 9 }).map((_, i) => ({ id: `A${i}`, speed: 50, aggression: 0.2 }));
    const lineupHome = Array.from({ length: 9 }).map((_, i) => ({ id: `H${i}`, speed: 50, aggression: 0.2 }));
    const g = simulateGame({ rngSeed: 12345, lineupAway, lineupHome });
    // Print box for manual inspection in test output
    // eslint-disable-next-line no-console
    console.log('BOX AWAY:', JSON.stringify(g.box.away, null, 2));
    // eslint-disable-next-line no-console
    console.log('BOX HOME:', JSON.stringify(g.box.home, null, 2));
    expect(g.box.away.length).toBe(9);
    expect(g.box.home.length).toBe(9);
  });
});
