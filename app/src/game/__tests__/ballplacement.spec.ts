import { describe, it, expect } from 'vitest';
import { placementDistribution } from '../BallPlacement';

describe('BallPlacement', () => {
  it('distribution sums to ~1', () => {
    const d = placementDistribution({ contactQuality: 0.5, handedness: 'L' });
    const total = Object.values(d).reduce((s, v) => s + v, 0);
    expect(total).toBeGreaterThan(0.999);
    expect(total).toBeLessThan(1.001);
  });

  it('left-handed batters bias to RF', () => {
    const left = placementDistribution({ contactQuality: 0.5, handedness: 'L' });
    const right = placementDistribution({ contactQuality: 0.5, handedness: 'R' });
    expect(left.RF).toBeGreaterThan(right.RF);
  });

  it('higher contactQuality shifts mass to outfield', () => {
    const low = placementDistribution({ contactQuality: 0.2, handedness: 'R' });
    const high = placementDistribution({ contactQuality: 0.9, handedness: 'R' });

    const outLow = low.LF + low.CF + low.RF;
    const outHigh = high.LF + high.CF + high.RF;
    expect(outHigh).toBeGreaterThan(outLow);
  });
});
