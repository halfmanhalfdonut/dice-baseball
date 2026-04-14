import { describe, it, expect } from 'vitest';
import { aggregateZoneOutcomes } from '../BallPlacementIntegrator';

describe('BallPlacementIntegrator', () => {
  it('higher contactQuality increases aggregated extra-base probability', () => {
    const low = aggregateZoneOutcomes({ contactQuality: 0.2, handedness: 'R', batterStrength: 60 }, { LF: 60, CF: 60, RF: 60 });
    const high = aggregateZoneOutcomes({ contactQuality: 0.9, handedness: 'R', batterStrength: 60 }, { LF: 60, CF: 60, RF: 60 });

    const extraLow = low.double + low.triple + low.hr;
    const extraHigh = high.double + high.triple + high.hr;
    expect(extraHigh).toBeGreaterThan(extraLow);
  });

  it('better outfield reduces aggregated extra-base probability', () => {
    const weakOutfield = aggregateZoneOutcomes({ contactQuality: 0.6, handedness: 'R', batterStrength: 70 }, { LF: 30, CF: 30, RF: 30 });
    const strongOutfield = aggregateZoneOutcomes({ contactQuality: 0.6, handedness: 'R', batterStrength: 70 }, { LF: 90, CF: 90, RF: 90 });

    const extraWeak = weakOutfield.double + weakOutfield.triple + weakOutfield.hr;
    const extraStrong = strongOutfield.double + strongOutfield.triple + strongOutfield.hr;

    expect(extraStrong).toBeLessThan(extraWeak);
  });
});
