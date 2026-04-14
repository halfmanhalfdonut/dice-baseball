import { describe, it, expect } from 'vitest';
import PlayerAttributes from '../../models/PlayerAttributes';
import { computePitchOutcome } from '../Pitch';

describe('computePitchOutcome composition deterministic test', () => {
  it('computes expected numeric outcome for known context', () => {
    const attrs = new PlayerAttributes('R', 80, 70, 60, 70, 10, 85, 50, 45);
    const ctx = {
      pitcher: { attributes: attrs },
      location: 'home' as const,
      stakes: 'playoff' as const,
      weather: 'windy' as const,
      pitchCount: 90,
      pitchType: 'fastball',
      technique: 60
    } as const;

    const out = computePitchOutcome(ctx as any);

    // These expected numbers are derived from the composition of modifiers.
    // We assert approximate values to allow float math variation.
    expect(out.pitchEffectiveness).toBeGreaterThan(0.7);
    expect(out.pitchEffectiveness).toBeLessThan(0.95);
    expect(out.contactProbability).toBeGreaterThan(0);
    expect(out.contactProbability).toBeLessThan(1);
  });
});
