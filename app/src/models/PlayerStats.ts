/** Cumulative batting statistics for a single player across multiple games. */
export interface PlayerStats {
  playerId: string;   // e.g. "J.Smith"
  teamId: string;
  name: string;       // "James Smith"
  position: string;   // "SS"
  G: number;          // games played
  PA: number;         // plate appearances
  AB: number;         // at-bats
  H: number;          // hits
  '2B': number;       // doubles
  '3B': number;       // triples
  HR: number;         // home runs
  R: number;          // runs scored
  RBI: number;        // runs batted in
  BB: number;         // walks
}

/** Derived batting average: H / AB */
export function avg(s: PlayerStats): string {
  return s.AB === 0 ? '.000' : (s.H / s.AB).toFixed(3).replace(/^0/, '');
}

/** Derived on-base percentage: (H + BB) / (AB + BB) */
export function obp(s: PlayerStats): string {
  const denom = s.AB + s.BB;
  return denom === 0 ? '.000' : ((s.H + s.BB) / denom).toFixed(3).replace(/^0/, '');
}

/** Derived slugging percentage: total bases / AB */
export function slg(s: PlayerStats): string {
  if (s.AB === 0) return '.000';
  const singles = s.H - s['2B'] - s['3B'] - s.HR;
  const tb = singles + 2 * s['2B'] + 3 * s['3B'] + 4 * s.HR;
  return (tb / s.AB).toFixed(3).replace(/^0/, '');
}

/** Create a zeroed-out stats object for a player. */
export function emptyStats(playerId: string, teamId: string, name: string, position: string): PlayerStats {
  return { playerId, teamId, name, position, G: 0, PA: 0, AB: 0, H: 0, '2B': 0, '3B': 0, HR: 0, R: 0, RBI: 0, BB: 0 };
}
