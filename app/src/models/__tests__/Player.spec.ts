import { describe, it, expect } from 'vitest';
import Player from '../Player';
import PlayerAttributes from '../PlayerAttributes';

describe('Player base', () => {
  it('creates a player with attributes', () => {
    const attrs = new PlayerAttributes('R', 50, 50, 50, 50, 50, 50, 50, 50);
    const p = new Player('team-1', attrs, 'John', 'Doe', 12, 'US', '1B');
    expect(p.firstName).toBe('John');
    expect(p.attributes).toBe(attrs);
  });
});
