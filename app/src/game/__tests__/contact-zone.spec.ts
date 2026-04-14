import { describe, it, expect } from 'vitest';
import { resolveContactWithZone } from '../ContactResolver';

describe('ContactResolver with zones', () => {
  it('outfielder with high skill reduces extra-base chances', () => {
  const fSkillsHigh = { LF: 90, CF: 90, RF: 90, SS: 70, '1B': 70 } as any;
  const fSkillsLow = { LF: 30, CF: 30, RF: 30, SS: 70, '1B': 70 } as any;

    const high = resolveContactWithZone({ contactQuality: 0.6, batterStrength: 60, fielderSkill: 80 }, 'CF', fSkillsHigh);
    const low = resolveContactWithZone({ contactQuality: 0.6, batterStrength: 60, fielderSkill: 80 }, 'CF', fSkillsLow);

    const extraHigh = high.double + high.triple + high.hr;
    const extraLow = low.double + low.triple + low.hr;

    expect(extraHigh).toBeLessThan(extraLow);
  });

  it('low infield skill increases error probability in infield zone', () => {
  const fSkills = { SS: 20, '2B': 20, '1B': 40, LF: 80 } as any;
    const infield = resolveContactWithZone({ contactQuality: 0.6, batterStrength: 60, fielderSkill: 60 }, 'SS', fSkills);
    const outfield = resolveContactWithZone({ contactQuality: 0.6, batterStrength: 60, fielderSkill: 60 }, 'LF', fSkills);

    expect(infield.error).toBeGreaterThanOrEqual(outfield.error);
  });
});
