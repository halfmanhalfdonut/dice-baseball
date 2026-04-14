export type Zone = 'P'|'C'|'1B'|'2B'|'3B'|'SS'|'LF'|'CF'|'RF'|'PO'|'PR';

export interface PlacementContext {
  contactQuality: number; // 0..1
  handedness: 'L'|'R';
  pitchType?: string | null;
  weather?: string | null;
}

export function placementDistribution(ctx: PlacementContext): Record<Zone, number> {
  // base equal distribution favoring infield for weak contact
  const base: Record<Zone, number> = {
    P: 0.02, C: 0.04, '1B': 0.12, '2B': 0.12, '3B': 0.08, SS: 0.12, LF: 0.12, CF: 0.12, RF: 0.12, PO: 0.02, PR: 0.02
  } as any;

  // shift toward outfield as contactQuality increases
  const outfieldShift = Math.max(0, ctx.contactQuality - 0.4) * 0.5; // up to 0.3

  const dist: any = { ...base };
  const outfields: Zone[] = ['LF','CF','RF'];
  const infields: Zone[] = ['1B','2B','3B','SS','C','P'];

  // move mass from infield to outfield proportionally
  const infieldReduction = outfieldShift * 0.6;
  const perInfieldReduce = infieldReduction / infields.length;
  for (const z of infields) dist[z] = Math.max(0, dist[z] - perInfieldReduce);

  const perOutfieldAdd = outfieldShift / outfields.length;
  for (const z of outfields) dist[z] = dist[z] + perOutfieldAdd;

  // handedness bias: left-handed batters pull to right field (RF) more often
  if (ctx.handedness === 'L') {
    dist.RF += 0.03;
    dist.LF -= 0.02;
  } else {
    dist.LF += 0.03;
    dist.RF -= 0.02;
  }

  // normalize
  const values = Object.values(dist) as number[];
  const total = values.reduce((s, v) => s + v, 0);
  const normalized: any = {};
  for (const k of Object.keys(dist) as Zone[]) normalized[k] = (dist[k] as number) / total;

  return normalized as Record<Zone, number>;
}
