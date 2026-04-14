export class XorShift32 {
  private state: number;
  constructor(seed = 123456) {
    this.state = seed >>> 0 || 123456;
  }

  next(): number {
    let x = this.state;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.state = x >>> 0;
    return this.state / 0xffffffff;
  }
}

export function sampleFromDistribution<T>(dist: Record<string, number>, rng: XorShift32): string {
  const entries = Object.entries(dist);
  let r = rng.next();
  let acc = 0;
  for (const [k, v] of entries) {
    acc += v;
    if (r <= acc) return k;
  }
  return entries[entries.length - 1][0];
}
