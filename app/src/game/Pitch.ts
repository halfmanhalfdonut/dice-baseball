import PlayerAttributes from '../models/PlayerAttributes';
import { locationModifier, stakesModifier, weatherModifier, staminaModifier, pitchTypeModifier, techniqueModifier } from './modifiers';

export type Location = 'home' | 'away' | 'neutral';
export type Stakes = 'regular' | 'playoff' | 'worldseries';
export type Weather = 'clear' | 'rain' | 'windy' | 'cold';

export interface PitchContext {
  pitcher: { attributes: PlayerAttributes };
  location: Location;
  stakes: Stakes;
  weather: Weather;
  pitchCount: number; // total pitches thrown so far by pitcher
  pitchType?: string | null;
  technique?: number; // 0..100
}

export interface PitchOutcome {
  contactProbability: number; // 0..1
  powerFactor: number; // 0..1 determines likelihood of extra-base hit given contact
  pitchEffectiveness: number; // 0..1 overall pitch effectiveness
}

/**
 * Compute a per-pitch outcome probabilities from context.
 * This is intentionally a small stub: tests drive the required behavior.
 */
export function computePitchOutcome(ctx: PitchContext): PitchOutcome {
  const pitchingStat = ctx.pitcher.attributes.pitching / 100;

  const locMod = locationModifier(ctx.location);
  const stakesMod = stakesModifier(ctx.stakes);
  const weatherMod = weatherModifier(ctx.weather);
  const stamMod = staminaModifier(ctx.pitchCount);
  const typeMod = pitchTypeModifier(ctx.pitchType || null);
  const techMod = techniqueModifier(ctx.technique ?? ctx.pitcher.attributes.composure);

  const pitchEffectiveness = Math.max(0, Math.min(1, pitchingStat + locMod + stakesMod + weatherMod - stamMod + typeMod + techMod));

  const contactProbability = Math.max(0, Math.min(1, 0.6 - 0.45 * pitchEffectiveness));

  const powerFactor = Math.max(0, Math.min(1, ctx.pitcher.attributes.strength / 100));

  return { contactProbability, powerFactor, pitchEffectiveness };
}
