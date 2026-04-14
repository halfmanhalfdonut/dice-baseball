import type { Season, ScheduledGame, PlayoffBracket, PlayoffSeries, PlayoffGame } from '../models/Season';
import type { Team } from '../models/Team';

const LS_KEY = 'dice-baseball:season';

// ── Schedule generation ─────────────────────────────────────────────────

/** Simple seeded PRNG for schedule shuffling */
function mulberry32(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a balanced schedule: every team plays every other team
 * `gamesPerMatchup` times (alternating home/away).
 * Returns shuffled schedule with deterministic seeds.
 */
export function generateSchedule(teams: Team[], gamesPerMatchup: number, scheduleSeed: number): ScheduledGame[] {
  const rng = mulberry32(scheduleSeed);
  const games: ScheduledGame[] = [];
  let idx = 0;

  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      for (let g = 0; g < gamesPerMatchup; g++) {
        // Alternate home/away for each meeting
        const awayTeam = g % 2 === 0 ? teams[i] : teams[j];
        const homeTeam = g % 2 === 0 ? teams[j] : teams[i];
        games.push({
          gameIndex: idx++,
          awayTeamId: awayTeam.id,
          homeTeamId: homeTeam.id,
          seed: Math.floor(rng() * 0x7FFFFFFF),
          awayRuns: null,
          homeRuns: null,
          innings: null,
          played: false,
        });
      }
    }
  }

  // Shuffle for a mixed schedule (Fisher-Yates)
  for (let i = games.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [games[i], games[j]] = [games[j], games[i]];
  }

  // Re-number after shuffle
  games.forEach((g, idx) => { g.gameIndex = idx; });

  return games;
}

// ── Persistence ─────────────────────────────────────────────────────────

export function saveSeason(season: Season): void {
  localStorage.setItem(LS_KEY, JSON.stringify(season));
}

export function loadSeason(): Season | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function deleteSeason(): void {
  localStorage.removeItem(LS_KEY);
}

/** Create and persist a new season. */
export function createSeason(teams: Team[], name: string, gamesPerMatchup: number): Season {
  const scheduleSeed = Date.now();
  const schedule = generateSchedule(teams, gamesPerMatchup, scheduleSeed);
  const season: Season = {
    id: `season-${Date.now()}`,
    name,
    createdAt: Date.now(),
    gamesPerMatchup,
    schedule,
    currentGameIndex: 0,
  };
  saveSeason(season);
  return season;
}

/** Stats helper: W-L for each team in a season */
export interface SeasonTeamRecord {
  teamId: string;
  W: number;
  L: number;
}

export function seasonStandings(season: Season): SeasonTeamRecord[] {
  const map = new Map<string, SeasonTeamRecord>();

  for (const g of season.schedule) {
    if (!g.played) continue;
    if (!map.has(g.awayTeamId)) map.set(g.awayTeamId, { teamId: g.awayTeamId, W: 0, L: 0 });
    if (!map.has(g.homeTeamId)) map.set(g.homeTeamId, { teamId: g.homeTeamId, W: 0, L: 0 });

    if (g.awayRuns! > g.homeRuns!) {
      map.get(g.awayTeamId)!.W++;
      map.get(g.homeTeamId)!.L++;
    } else {
      map.get(g.homeTeamId)!.W++;
      map.get(g.awayTeamId)!.L++;
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const pctA = a.W + a.L === 0 ? 0 : a.W / (a.W + a.L);
    const pctB = b.W + b.L === 0 ? 0 : b.W / (b.W + b.L);
    return pctB - pctA || a.L - b.L;
  });
}

// ── Playoff bracket ─────────────────────────────────────────────────────

function makeSeries(higherId: string, lowerId: string, gamesNeeded: number): PlayoffSeries {
  return {
    higherSeedId: higherId,
    lowerSeedId: lowerId,
    gamesNeeded,
    games: [],
    higherSeedWins: 0,
    lowerSeedWins: 0,
    winnerId: null,
  };
}

/**
 * Generate a playoff bracket from season standings.
 * Format: top 2 from each division's conference (4 per conference, 8 total).
 *   - Seed teams by overall win pct within each conference
 *   - Division Series: #1 vs #4, #2 vs #3 (best-of-5)
 *   - Conference Series: winners play (best-of-7)
 *   - World Series: conference champs (best-of-7)
 */
export function generatePlayoffBracket(season: Season, teams: Team[]): PlayoffBracket {
  const standings = seasonStandings(season);
  const standMap = new Map(standings.map(s => [s.teamId, s]));

  function conferenceSeeds(conf: string): string[] {
    // Get best 4 teams from this conference (by W-L)
    const confTeams = teams
      .filter(t => t.conference === conf)
      .map(t => ({ id: t.id, ...(standMap.get(t.id) ?? { W: 0, L: 0 }) }))
      .sort((a, b) => {
        const pA = a.W + a.L === 0 ? 0 : a.W / (a.W + a.L);
        const pB = b.W + b.L === 0 ? 0 : b.W / (b.W + b.L);
        return pB - pA || a.L - b.L;
      });
    return confTeams.slice(0, 4).map(t => t.id);
  }

  const amSeeds = conferenceSeeds('American');
  const natSeeds = conferenceSeeds('National');

  const rng = mulberry32(season.createdAt + 7777);

  const divisionSeries: PlayoffSeries[] = [
    // American: #1 vs #4, #2 vs #3
    makeSeries(amSeeds[0], amSeeds[3], 3),
    makeSeries(amSeeds[1], amSeeds[2], 3),
    // National: #1 vs #4, #2 vs #3
    makeSeries(natSeeds[0], natSeeds[3], 3),
    makeSeries(natSeeds[1], natSeeds[2], 3),
  ];

  // Pre-generate seeds for all possible playoff games
  for (const series of divisionSeries) {
    for (let i = 0; i < series.gamesNeeded * 2 - 1; i++) {
      series.games.push({ seed: Math.floor(rng() * 0x7FFFFFFF), awayRuns: null, homeRuns: null, innings: null, played: false });
    }
  }

  return {
    divisionSeries,
    conferenceSeries: [], // generated after division round completes
    worldSeries: null,
    championId: null,
  };
}

/** Advance bracket after a round completes — creates the next series if ready. */
export function advancePlayoffBracket(bracket: PlayoffBracket, season: Season): void {
  const rng = mulberry32(season.createdAt + 9999);

  // Check if Division Series are all complete
  const dsComplete = bracket.divisionSeries.every(s => s.winnerId !== null);
  if (dsComplete && bracket.conferenceSeries.length === 0) {
    // Create Conference Series: Am DS winners, Nat DS winners
    const amWinners = [bracket.divisionSeries[0].winnerId!, bracket.divisionSeries[1].winnerId!];
    const natWinners = [bracket.divisionSeries[2].winnerId!, bracket.divisionSeries[3].winnerId!];
    bracket.conferenceSeries = [
      makeSeries(amWinners[0], amWinners[1], 4),
      makeSeries(natWinners[0], natWinners[1], 4),
    ];
    for (const series of bracket.conferenceSeries) {
      for (let i = 0; i < series.gamesNeeded * 2 - 1; i++) {
        series.games.push({ seed: Math.floor(rng() * 0x7FFFFFFF), awayRuns: null, homeRuns: null, innings: null, played: false });
      }
    }
  }

  // Check if Conference Series are all complete
  const csComplete = bracket.conferenceSeries.length === 2 && bracket.conferenceSeries.every(s => s.winnerId !== null);
  if (csComplete && !bracket.worldSeries) {
    const amChamp = bracket.conferenceSeries[0].winnerId!;
    const natChamp = bracket.conferenceSeries[1].winnerId!;
    bracket.worldSeries = makeSeries(amChamp, natChamp, 4);
    for (let i = 0; i < 7; i++) {
      bracket.worldSeries.games.push({ seed: Math.floor(rng() * 0x7FFFFFFF), awayRuns: null, homeRuns: null, innings: null, played: false });
    }
  }

  // Check if World Series is complete
  if (bracket.worldSeries?.winnerId) {
    bracket.championId = bracket.worldSeries.winnerId;
  }
}
