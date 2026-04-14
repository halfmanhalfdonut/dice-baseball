import { describe, it, expect } from 'vitest';
import PlayerAttributes from '../PlayerAttributes';
import Batter from '../Batter';

describe('Batter', () => {
  it('creates a good batter', () => {
    const attrs = new PlayerAttributes('L', 80, 70, 70, 75, 92, 30, 60, 55);
    const b = new Batter('team-1', attrs, 'Billy', 'Bat', 7, 'US', 'DH');
    expect(b.attributes!.batting).toBeGreaterThanOrEqual(90 - 2);
  });

  it('throws for invalid batting stat (<0)', () => {
    const attrs = new PlayerAttributes('R', 50, 50, 50, 50, 50, 50, 50, 50);
    // mutate batting to an invalid value after construction so Batter validation triggers
    (attrs as any).batting = -1;
    expect(() => new Batter('team-1', attrs, 'Neg', 'Bat', 7, 'US', '3B')).toThrow();
  });
});
