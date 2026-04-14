import { ContactOutcomeProbabilities } from './ContactResolver';

export interface RangeContext {
  outcome: ContactOutcomeProbabilities;
  fielderSpeed: number; // 0..100
  batterSpeed: number; // 0..100
}

/**
 * Adjust contact outcomes for fielder range and batter speed.
 * Faster fielders reduce extra-base probabilities; faster batters increase them.
 */
export function adjustForRange(ctx: RangeContext): ContactOutcomeProbabilities {
  const { outcome, fielderSpeed, batterSpeed } = ctx;

  const fSpeedFactor = (100 - fielderSpeed) / 100; // higher when fielders are slow
  const bSpeedFactor = batterSpeed / 100;

  // extra-base shift due to batter speed (more likely to stretch single->double/triple)
  const extraBase = outcome.double + outcome.triple + outcome.hr;
  const extraFromSpeed = extraBase * bSpeedFactor * 0.25; // up to +25% of extraBase

  // reduction due to fielder speed
  const reduction = extraBase * (fielderSpeed / 100) * 0.3; // up to -30% of extraBase

  const adjustedDouble = Math.max(0, outcome.double + extraFromSpeed * 0.5 - reduction * 0.5);
  const adjustedTriple = Math.max(0, outcome.triple + extraFromSpeed * 0.3 - reduction * 0.3);
  const adjustedHr = Math.max(0, outcome.hr + extraFromSpeed * 0.2 - reduction * 0.2);

  const adjustedSingle = Math.max(0, outcome.single - (adjustedDouble - outcome.double) - (adjustedTriple - outcome.triple));

  const adjusted = {
    out: outcome.out,
    single: adjustedSingle,
    double: adjustedDouble,
    triple: adjustedTriple,
    hr: adjustedHr,
    error: outcome.error,
  } as any;

  // normalize
  const total = Object.values(adjusted).reduce((s: number, v: any) => s + v, 0);
  const normalized: any = {};
  for (const k of Object.keys(adjusted)) {
    normalized[k] = adjusted[k as keyof typeof adjusted] / total;
  }

  return normalized as ContactOutcomeProbabilities;
}
