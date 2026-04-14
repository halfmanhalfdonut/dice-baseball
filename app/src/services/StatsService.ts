import { emptyStats, type PlayerStats } from '../models/PlayerStats';
import type { InningResult } from '../game/InningSimulator';

const LS_KEY = 'dice-baseball:player-stats';

// ── localStorage helpers ────────────────────────────────────────────────

function loadAll(): Record<string, PlayerStats> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveAll(map: Record<string, PlayerStats>): void {
  localStorage.setItem(LS_KEY, JSON.stringify(map));
}

// ── Public API ──────────────────────────────────────────────────────────

/** Unique key for a player on a team */
function key(teamId: string, playerId: string): string {
  return `${teamId}::${playerId}`;
}

/**
 * Record stats from a single game for one team's lineup.
 *
 * @param teamId  - Team identifier
 * @param lineup  - The 9 lineup players (same order used by the simulator)
 * @param innings - Array of InningResult from the game
 * @param boxLines - BoxLine[] from makeBox (used for RBI / R already computed)
 */
export function recordGame(
  teamId: string,
  lineup: { id?: string; name?: string; position?: string }[],
  innings: InningResult[],
  boxLines: { id?: string | number; AB: number; H: number; R: number; RBI: number; PA: number }[],
): void {
  const map = loadAll();

  // Mark each lineup player as having played a game
  const touched = new Set<string>();
  lineup.forEach((p, idx) => {
    const pid = p.id ?? `player-${idx}`;
    const k = key(teamId, pid);
    if (!map[k]) {
      map[k] = emptyStats(pid, teamId, p.name ?? pid, p.position ?? '');
    }
    // Only increment G once per player per call
    if (!touched.has(k)) {
      map[k].G += 1;
      touched.add(k);
    }
  });

  // Accumulate from plate appearances (granular hit types, walks)
  for (const inn of innings) {
    for (const pa of inn.plateAppearances) {
      const idx = pa.batterIndex;
      const p = lineup[idx];
      if (!p) continue;
      const pid = p.id ?? `player-${idx}`;
      const k = key(teamId, pid);
      const s = map[k];
      if (!s) continue;

      s.PA += 1;

      const isSac = pa.appliedScenario?.isSacrifice === true;

      if (pa.result === 'walk' || pa.result === 'take') {
        if (pa.result === 'walk') s.BB += 1;
        // walks/takes don't count as AB
      } else if (!isSac) {
        if (pa.result === 'single') { s.AB += 1; s.H += 1; }
        else if (pa.result === 'double') { s.AB += 1; s.H += 1; s['2B'] += 1; }
        else if (pa.result === 'triple') { s.AB += 1; s.H += 1; s['3B'] += 1; }
        else if (pa.result === 'hr') { s.AB += 1; s.H += 1; s.HR += 1; }
        else if (pa.result === 'out') { s.AB += 1; }
        else if (pa.result === 'error') { s.AB += 1; }
        else if (pa.result) { s.AB += 1; }  // any other unknown result
      }
    }
  }

  // Use box score for R and RBI (already properly attributed by makeBox)
  boxLines.forEach((bl, idx) => {
    const p = lineup[idx];
    if (!p) return;
    const pid = p.id ?? `player-${idx}`;
    const k = key(teamId, pid);
    const s = map[k];
    if (!s) return;
    s.R += bl.R;
    s.RBI += bl.RBI;
  });

  saveAll(map);
}

/** Get all player stats, optionally filtered by team. */
export function getStats(teamId?: string): PlayerStats[] {
  const map = loadAll();
  let list = Object.values(map);
  if (teamId) list = list.filter(s => s.teamId === teamId);
  return list.sort((a, b) => b.PA - a.PA);  // most PA first
}

/** Clear all stats, or just for one team. */
export function resetStats(teamId?: string): void {
  if (!teamId) {
    localStorage.removeItem(LS_KEY);
    return;
  }
  const map = loadAll();
  for (const k of Object.keys(map)) {
    if (map[k].teamId === teamId) delete map[k];
  }
  saveAll(map);
}
