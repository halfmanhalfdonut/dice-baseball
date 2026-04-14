import { describe, it, expect } from 'vitest';
import { simulateAtBat } from '../Simulator';
import PlayerAttributes from '../../models/PlayerAttributes';

describe('Simulator', () => {
  it('deterministic with seed', () => {
    const pitcher = new PlayerAttributes('R', 80,80,80,80,10,85,40,40);
    const batter = new PlayerAttributes('L', 80,80,80,80,80,10,40,40);
    const fSkills = { LF: 60, CF: 60, RF: 60 } as any;

    const a = simulateAtBat({ pitcherAttributes: pitcher, batterAttributes: batter, handedness: 'L', fielderSkills: fSkills, rngSeed: 42 });
    const b = simulateAtBat({ pitcherAttributes: pitcher, batterAttributes: batter, handedness: 'L', fielderSkills: fSkills, rngSeed: 42 });
    expect(a).toEqual(b);
  });

  it('distribution smoke test', () => {
    const pitcher = new PlayerAttributes('R', 80,80,80,80,10,85,40,40);
    const batter = new PlayerAttributes('L', 80,80,80,80,80,10,40,40);
    const fSkills = { LF: 60, CF: 60, RF: 60 } as any;

    const counts: Record<string, number> = {};
    for (let i = 0; i < 100; i++) {
      const out = simulateAtBat({ pitcherAttributes: pitcher, batterAttributes: batter, handedness: 'L', fielderSkills: fSkills, rngSeed: i });
      counts[out.result] = (counts[out.result] || 0) + 1;
    }

    // ensure we saw some variety
    expect(Object.keys(counts).length).toBeGreaterThan(1);
  });
});
