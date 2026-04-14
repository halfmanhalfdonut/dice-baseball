import { describe, it, expect } from 'vitest';
import PlayerAttributes from '../PlayerAttributes';

describe('PlayerAttributes', () => {
  it('creates a valid good attribute set', () => {
    const attrs = new PlayerAttributes('R', 95, 85, 70, 80, 40, 90, 60, 50);
    expect(attrs.stamina).toBeGreaterThanOrEqual(90);
    expect(attrs.pitching).toBeGreaterThanOrEqual(85);
    expect(attrs.batting).toBeLessThanOrEqual(50);
  });

  it('creates a valid mediocre attribute set', () => {
    const attrs = new PlayerAttributes('L', 50, 50, 50, 50, 50, 50, 50, 50);
    expect(attrs.stamina).toBe(50);
    expect(attrs.batting).toBe(50);
  });

  it('creates a valid bad attribute set', () => {
    const attrs = new PlayerAttributes('R', 10, 20, 15, 10, 5, 8, 12, 5);
    expect(attrs.batting).toBeLessThan(10);
  });

  it('throws for invalid negative stat', () => {
    expect(() => new PlayerAttributes('R', -5, 10, 10, 10, 10, 10, 10, 10)).toThrow();
  });
});
