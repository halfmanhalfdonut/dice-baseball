/** A persisted record of a completed game. */
export interface GameRecord {
  id: string;            // unique, e.g. timestamp-based
  timestamp: number;     // Date.now()
  awayTeamId: string;
  homeTeamId: string;
  awayCity: string;
  awayName: string;
  homeCity: string;
  homeName: string;
  awayRuns: number;
  homeRuns: number;
  innings: number;       // total innings played
  seed: number;
}

/** Win-loss record for a single team. */
export interface TeamRecord {
  teamId: string;
  city: string;
  name: string;
  conference: string;
  division: string;
  W: number;
  L: number;
}

/** Derived winning percentage */
export function winPct(r: TeamRecord): string {
  const total = r.W + r.L;
  return total === 0 ? '.000' : (r.W / total).toFixed(3).replace(/^0/, '');
}

/** Games behind the leader */
export function gamesBehind(leader: TeamRecord, team: TeamRecord): string {
  const gb = ((leader.W - team.W) + (team.L - leader.L)) / 2;
  if (gb <= 0) return '—';
  return gb % 1 === 0 ? gb.toString() : gb.toFixed(1);
}
