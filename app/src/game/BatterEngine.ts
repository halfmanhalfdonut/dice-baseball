import PlayerAttributes from '../models/PlayerAttributes';
import { PitchOutcome } from './Pitch';

export interface BatterContext {
  batter: { attributes: PlayerAttributes };
  aggression?: number; // 0..100 - likeliness to swing
}

export interface BatterResult {
  swingProbability: number; // 0..1
  contactQuality: number; // 0..1, higher means harder/better contact
}

export function computeBatterResponse(pitch: PitchOutcome, ctx: BatterContext): BatterResult {
  // baseline: batting stat influences both swing and contact
  const batting = ctx.batter.attributes.batting / 100;

  const aggression = (ctx.aggression ?? 50) / 100;

  // swing probability increases with aggression and decreases with pitchEffectiveness
  const swing = Math.max(0, Math.min(1, 0.2 + aggression * 0.6 - pitch.pitchEffectiveness * 0.5 + (batting - 0.5) * 0.2));

  // contact quality increases with batting and powerFactor, and decreases with pitchEffectiveness
  const contactQuality = Math.max(0, Math.min(1, batting * 0.6 + pitch.powerFactor * 0.3 - pitch.pitchEffectiveness * 0.3 + 0.1));

  return { swingProbability: swing, contactQuality };
}
