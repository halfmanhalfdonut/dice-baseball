import { placementDistribution, Zone } from './BallPlacement';
import { resolveContactWithZone, ContactOutcomeProbabilities } from './ContactResolver';

export interface IntegratorContext {
  contactQuality: number;
  handedness: 'L'|'R';
  pitchType?: string | null;
  weather?: string | null;
  batterStrength: number;
}

export function aggregateZoneOutcomes(ctx: IntegratorContext, fielderSkills: Record<string, number>): ContactOutcomeProbabilities {
  const distribution = placementDistribution({ contactQuality: ctx.contactQuality, handedness: ctx.handedness, pitchType: ctx.pitchType, weather: ctx.weather });

  const zones = Object.keys(distribution) as Zone[];
  const accum: any = { out: 0, single: 0, double: 0, triple: 0, hr: 0, error: 0 };

  for (const z of zones) {
    const probZone = distribution[z];
    const zoneOutcome = resolveContactWithZone({ contactQuality: ctx.contactQuality, batterStrength: ctx.batterStrength, fielderSkill: fielderSkills[z] ?? 60 }, z, fielderSkills);
    for (const k of Object.keys(accum)) {
      accum[k] += (zoneOutcome as any)[k] * probZone;
    }
  }

  // normalize
  const values = Object.values(accum) as number[];
  const total = values.reduce((s, v) => s + v, 0);
  const normalized: any = {};
  for (const k of Object.keys(accum)) normalized[k] = accum[k as keyof typeof accum] / total;

  return normalized as ContactOutcomeProbabilities;
}
