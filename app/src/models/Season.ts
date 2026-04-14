/** A single scheduled matchup in a season. */
export interface ScheduledGame {
  gameIndex: number;
  awayTeamId: string;
  homeTeamId: string;
  seed: number;
  /** null = not yet played */
  awayRuns: number | null;
  homeRuns: number | null;
  innings: number | null;
  played: boolean;
}

/** A single game within a playoff series. */
export interface PlayoffGame {
  seed: number;
  awayRuns: number | null;
  homeRuns: number | null;
  innings: number | null;
  played: boolean;
}

/** A best-of series between two teams. */
export interface PlayoffSeries {
  higherSeedId: string;
  lowerSeedId: string;
  gamesNeeded: number; // wins needed (e.g. 3 for best-of-5, 4 for best-of-7)
  games: PlayoffGame[];
  higherSeedWins: number;
  lowerSeedWins: number;
  winnerId: string | null;
}

/** The full playoff bracket: division series → conference championship → world series. */
export interface PlayoffBracket {
  divisionSeries: PlayoffSeries[];   // 4 series (2 per conference)
  conferenceSeries: PlayoffSeries[]; // 2 series (1 per conference)
  worldSeries: PlayoffSeries | null;
  championId: string | null;
}

/** A full season state. */
export interface Season {
  id: string;
  name: string;
  createdAt: number;
  gamesPerMatchup: number;   // e.g. 3 = each pair plays 3 times
  schedule: ScheduledGame[];
  currentGameIndex: number;   // pointer to next unplayed game
  playoffs?: PlayoffBracket;
}
