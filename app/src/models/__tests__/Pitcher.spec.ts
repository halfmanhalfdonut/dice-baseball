import { describe, it, expect } from 'vitest';
import PlayerAttributes from '../PlayerAttributes';
import Pitcher from '../Pitcher';

describe('Pitcher', () => {
  it('creates a good pitcher with pitch suite', () => {
    const attrs = new PlayerAttributes('R', 90, 70, 60, 75, 10, 95, 30, 40);
    const p = new Pitcher('team-1', attrs, 'Roy', 'Ace', 32, 'US', 'P', { fastball: 85, slider: 78, curve: 72 });
  expect(p.attributes!.pitching).toBeGreaterThanOrEqual(90 - 5); // allow small variance
    expect(p.pitches.fastball).toBe(85);
  });

  it('creates a mediocre pitcher', () => {
    const attrs = new PlayerAttributes('L', 55, 55, 50, 50, 10, 55, 30, 40);
    const p = new Pitcher('team-1', attrs, 'Medi', 'Ocre', 45, 'US', 'P', { fastball: 60 });
  expect(p.attributes!.pitching).toBe(55);
    expect(p.pitches.fastball).toBe(60);
  });

  it('creates a bad pitcher', () => {
    const attrs = new PlayerAttributes('R', 20, 20, 20, 20, 5, 10, 10, 5);
    const p = new Pitcher('team-1', attrs, 'Bad', 'Arm', 99, 'US', 'P', { fastball: 25 });
  expect(p.attributes!.pitching).toBeLessThan(20 + 5);
    expect(p.pitches.fastball).toBeLessThan(30);
  });

  it('throws if any pitch value is negative', () => {
    const attrs = new PlayerAttributes('R', 50, 50, 50, 50, 50, 50, 50, 50);
    expect(() => new Pitcher('team-1', attrs, 'X', 'Y', 1, 'US', 'P', { fastball: -10 })).toThrow();
  });
});
