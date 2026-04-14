import type { GameRecord, TeamRecord } from '../models/GameRecord';
import type { Team } from '../models/Team';

const LS_KEY = 'dice-baseball:game-history';

// ── localStorage helpers ────────────────────────────────────────────────

function loadAll(): GameRecord[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveAll(records: GameRecord[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(records));
}

// ── Public API ──────────────────────────────────────────────────────────

/** Save a completed game to history. */
export function recordGameResult(record: Omit<GameRecord, 'id' | 'timestamp'>): GameRecord {
  const full: GameRecord = {
    ...record,
    id: `game-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
  };
  const all = loadAll();
  all.push(full);
  saveAll(all);
  return full;
}

/** Get all game records, most recent first. */
export function getGameHistory(): GameRecord[] {
  return loadAll().sort((a, b) => b.timestamp - a.timestamp);
}

/** Get game history filtered by team. */
export function getTeamHistory(teamId: string): GameRecord[] {
  return getGameHistory().filter(g => g.awayTeamId === teamId || g.homeTeamId === teamId);
}

/** Clear all game history. */
export function resetGameHistory(): void {
  localStorage.removeItem(LS_KEY);
}

/** Compute W-L standings from game history for all teams. */
export function computeStandings(teams: Team[]): TeamRecord[] {
  const games = loadAll();
  const map = new Map<string, TeamRecord>();

  // Initialize every team with 0-0
  for (const t of teams) {
    map.set(t.id, {
      teamId: t.id,
      city: t.city,
      name: t.name,
      conference: t.conference,
      division: t.division,
      W: 0,
      L: 0,
    });
  }

  // Tally wins and losses
  for (const g of games) {
    const away = map.get(g.awayTeamId);
    const home = map.get(g.homeTeamId);
    if (g.awayRuns > g.homeRuns) {
      if (away) away.W++;
      if (home) home.L++;
    } else {
      if (home) home.W++;
      if (away) away.L++;
    }
  }

  return Array.from(map.values());
}
