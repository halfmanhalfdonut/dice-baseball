import { describe, it, expect } from 'vitest';
import PlayerAttributes from '../../models/PlayerAttributes';
import { computeBatterResponse } from '../BatterEngine';
import { computePitchOutcome } from '../Pitch';

describe('BatterEngine', () => {
  it('higher batting stat increases contactQuality', () => {
    const pitch = computePitchOutcome({ pitcher: { attributes: new PlayerAttributes('R', 80,80,80,80,10,80,40,40) }, location: 'neutral', stakes: 'regular', weather: 'clear', pitchCount: 0 });
    const lowBatter = { batter: { attributes: new PlayerAttributes('L', 50,50,50,50,30,10,40,40) } };
    const highBatter = { batter: { attributes: new PlayerAttributes('L', 80,80,80,80,90,10,40,40) } };

    const rLow = computeBatterResponse(pitch, lowBatter as any);
    const rHigh = computeBatterResponse(pitch, highBatter as any);

    expect(rHigh.contactQuality).toBeGreaterThan(rLow.contactQuality);
  });

  it('higher aggression increases swingProbability', () => {
    const pitch = computePitchOutcome({ pitcher: { attributes: new PlayerAttributes('R', 80,80,80,80,10,80,40,40) }, location: 'neutral', stakes: 'regular', weather: 'clear', pitchCount: 0 });
    const passive = { batter: { attributes: new PlayerAttributes('L', 80,80,80,80,80,10,40,40) }, aggression: 10 };
    const aggressive = { batter: { attributes: new PlayerAttributes('L', 80,80,80,80,80,10,40,40) }, aggression: 90 };

    const rPassive = computeBatterResponse(pitch, passive as any);
    const rAgg = computeBatterResponse(pitch, aggressive as any);

    expect(rAgg.swingProbability).toBeGreaterThan(rPassive.swingProbability);
  });

  it('strong pitchEffectiveness reduces swing probability and contactQuality', () => {
    const weakPitch = computePitchOutcome({ pitcher: { attributes: new PlayerAttributes('R', 80,80,80,80,10,30,40,40) }, location: 'neutral', stakes: 'regular', weather: 'clear', pitchCount: 0 });
    const strongPitch = computePitchOutcome({ pitcher: { attributes: new PlayerAttributes('R', 80,80,80,80,10,95,40,40) }, location: 'neutral', stakes: 'regular', weather: 'clear', pitchCount: 0 });

    const batter = { batter: { attributes: new PlayerAttributes('L', 80,80,80,80,80,10,40,40) } };
    const rWeak = computeBatterResponse(weakPitch, batter as any);
    const rStrong = computeBatterResponse(strongPitch, batter as any);

    expect(rWeak.swingProbability).toBeGreaterThan(rStrong.swingProbability);
    expect(rWeak.contactQuality).toBeGreaterThan(rStrong.contactQuality);
  });
});
