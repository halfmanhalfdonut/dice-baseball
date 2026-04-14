import { describe, it, expect } from 'vitest';
import { resolveContact } from '../ContactResolver';

describe('ContactResolver', () => {
  it('higher contactQuality increases overall hit probability', () => {
    const low = resolveContact({ contactQuality: 0.2, batterStrength: 40, fielderSkill: 70 });
    const high = resolveContact({ contactQuality: 0.8, batterStrength: 40, fielderSkill: 70 });

    const hitProbLow = 1 - low.out - low.error;
    const hitProbHigh = 1 - high.out - high.error;

    expect(hitProbHigh).toBeGreaterThan(hitProbLow);
  });

  it('higher batterStrength increases extra-base share (double+triple+hr)', () => {
    const weak = resolveContact({ contactQuality: 0.6, batterStrength: 30, fielderSkill: 70 });
    const strong = resolveContact({ contactQuality: 0.6, batterStrength: 90, fielderSkill: 70 });

    const extraWeak = weak.double + weak.triple + weak.hr;
    const extraStrong = strong.double + strong.triple + strong.hr;

    expect(extraStrong).toBeGreaterThan(extraWeak);
  });

  it('lower fielderSkill increases error probability', () => {
    const good = resolveContact({ contactQuality: 0.6, batterStrength: 60, fielderSkill: 90 });
    const bad = resolveContact({ contactQuality: 0.6, batterStrength: 60, fielderSkill: 10 });

    expect(bad.error).toBeGreaterThan(good.error);
  });
});
