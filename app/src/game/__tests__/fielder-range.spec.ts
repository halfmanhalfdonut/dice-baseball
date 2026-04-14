import { describe, it, expect } from 'vitest';
import { resolveContact } from '../ContactResolver';
import { adjustForRange } from '../FielderRange';

describe('FielderRange.adjustForRange', () => {
  it('faster fielders reduce extra-base probability', () => {
    const base = resolveContact({ contactQuality: 0.6, batterStrength: 60, fielderSkill: 60 });

    const slowAdjusted = adjustForRange({ outcome: base, fielderSpeed: 30, batterSpeed: 50 });
    const fastAdjusted = adjustForRange({ outcome: base, fielderSpeed: 90, batterSpeed: 50 });

    const extraSlow = slowAdjusted.double + slowAdjusted.triple + slowAdjusted.hr;
    const extraFast = fastAdjusted.double + fastAdjusted.triple + fastAdjusted.hr;

    expect(extraFast).toBeLessThan(extraSlow);
  });

  it('faster batter increases extra-base probability', () => {
    const base = resolveContact({ contactQuality: 0.6, batterStrength: 60, fielderSkill: 60 });

    const slowBatter = adjustForRange({ outcome: base, fielderSpeed: 60, batterSpeed: 20 });
    const fastBatter = adjustForRange({ outcome: base, fielderSpeed: 60, batterSpeed: 90 });

    const extraSlow = slowBatter.double + slowBatter.triple + slowBatter.hr;
    const extraFast = fastBatter.double + fastBatter.triple + fastBatter.hr;

    expect(extraFast).toBeGreaterThan(extraSlow);
  });
});
