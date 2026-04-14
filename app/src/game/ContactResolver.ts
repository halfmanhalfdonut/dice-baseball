import PlayerAttributes from '../models/PlayerAttributes';

export interface ContactContext {
  contactQuality: number; // 0..1
  batterStrength: number; // 0..100
  fielderSkill: number; // 0..100 average of nearby defenders
}

export interface ContactOutcomeProbabilities {
  out: number;
  single: number;
  double: number;
  triple: number;
  hr: number;
  error: number;
}

export function resolveContact(ctx: ContactContext): ContactOutcomeProbabilities {
  // Base hit chance scales with contactQuality
  const baseHit = ctx.contactQuality * 0.5 + 0.1; // 0.1..0.6

  // Strength shifts distribution toward extra bases
  const strengthFactor = ctx.batterStrength / 100;

  // Fielder skill reduces error probability
  const errorBase = Math.max(0, 0.05 - (ctx.fielderSkill / 100) * 0.04); // 0.01..0.05

  const hr = baseHit * 0.05 * (0.5 + strengthFactor * 1.5);
  const triple = baseHit * 0.01 * (0.5 + strengthFactor);
  const dbl = baseHit * 0.08 * (0.5 + strengthFactor);
  const single = baseHit - (hr + dbl + triple);

  const out = Math.max(0, 1 - baseHit - errorBase);

  // normalize so sum is 1
  const raw = { out, single, double: dbl, triple, hr, error: errorBase };
  const total = Object.values(raw).reduce((s, v) => s + v, 0);
  const normalized: any = {};
  for (const k of Object.keys(raw)) {
    normalized[k] = raw[k as keyof typeof raw] / total;
  }

  return normalized as ContactOutcomeProbabilities;
}

export type Zone = 'P'|'C'|'1B'|'2B'|'3B'|'SS'|'LF'|'CF'|'RF'|'PR'|'PO';

/**
 * Resolve contact with a zone and a map of fielder skills. This will adjust
 * extra-base probabilities based on the fielder skill in the impacted zone.
 */
export function resolveContactWithZone(ctx: ContactContext, zone: Zone, fielderSkills: Record<string, number>): ContactOutcomeProbabilities {
  // derive fielder skill for the zone; fall back to average if missing
  let fSkill = fielderSkills[zone];
  if (typeof fSkill !== 'number') {
    const vals = Object.values(fielderSkills);
    fSkill = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : ctx.fielderSkill;
  }

  // get base probabilities using resolved fielder skill
  const base = resolveContact({ contactQuality: ctx.contactQuality, batterStrength: ctx.batterStrength, fielderSkill: fSkill });

  // Outfielders with good skill suppress extra-base hits (they limit doubles/triples/hr effectively)
  const outfieldZones = ['LF','CF','RF'];
  let adjusted = { ...base } as any;

  if (outfieldZones.includes(zone)) {
    const reductionFactor = (fSkill / 100) * 0.3; // up to 30% reduction on extra bases
    const extraBaseSum = base.double + base.triple + base.hr;
    const reducedExtra = extraBaseSum * (1 - reductionFactor);
    const diff = extraBaseSum - reducedExtra;

    // spread the reduced portion into singles (makes out less likely to be extra-base)
    adjusted.double = base.double * (1 - reductionFactor);
    adjusted.triple = base.triple * (1 - reductionFactor);
    adjusted.hr = base.hr * (1 - reductionFactor);
    adjusted.single = base.single + diff;
  }

  // normalize again
  const total = Object.values(adjusted).reduce((s: number, v: any) => s + v, 0);
  const normalized: any = {};
  for (const k of Object.keys(adjusted)) {
    normalized[k] = adjusted[k as keyof typeof adjusted] / total;
  }

  return normalized as ContactOutcomeProbabilities;
}
