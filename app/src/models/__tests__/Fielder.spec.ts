import { describe, it, expect } from 'vitest';
import PlayerAttributes from '../PlayerAttributes';
import Fielder from '../Fielder';

describe('Fielder', () => {
  it('creates a fast and skilled fielder', () => {
    const attrs = new PlayerAttributes('R', 70, 80, 60, 85, 40, 30, 92, 30);
    const f = new Fielder('team-1', attrs, 'Fay', 'Ler', 22, 'US', 'CF');
    expect(f.attributes!.fielding).toBeGreaterThanOrEqual(90 - 5);
    expect(f.position).toBe('CF');
  });

  it('throws for invalid fielding stat (>100)', () => {
    expect(() => new Fielder('team-1', new PlayerAttributes('R', 70, 80, 60, 85, 40, 30, 150, 30), 'Bad', 'F', 1, 'US', 'SS')).toThrow();
  });
});
