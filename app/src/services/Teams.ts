import type { Team, TeamPlayer } from '../models/Team';
import { getPouchDB } from './Persistence';
import { generateRoster } from './PlayerGenerator';

// ── helpers ──────────────────────────────────────────────────────────────

function abbr(city: string, name: string): string {
  return (city.slice(0, 3) + name.slice(0, 3)).toUpperCase().replace(/\s/g, '');
}

// Simple hash so each team gets a unique but deterministic seed
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return h >>> 0; // unsigned
}

// ── default 30 teams ─────────────────────────────────────────────────────

const DEFAULT_TEAMS_RAW: Array<[string, string, string, string]> = [
  // American Conference – East
  ['Baltimore', 'Mockingbirds', 'American', 'East'],
  ['Boston', 'Whales', 'American', 'East'],
  ['New York', 'Bombers', 'American', 'East'],
  ['Tampa Bay', 'Sunfish', 'American', 'East'],
  ['Toronto', 'Financiers', 'American', 'East'],
  // American Conference – Central
  ['Chicago', 'Blackbirds', 'American', 'Central'],
  ['Cleveland', 'Bulls', 'American', 'Central'],
  ['Detroit', 'Mechanics', 'American', 'Central'],
  ['Kansas City', 'Homesteaders', 'American', 'Central'],
  ['Minnesota', 'River Rats', 'American', 'Central'],
  // American Conference – West
  ['Oakland', 'Elephants', 'American', 'West'],
  ['Houston', 'Cosmonauts', 'American', 'West'],
  ['Los Angeles', 'Demons', 'American', 'West'],
  ['Seattle', 'Spearmen', 'American', 'West'],
  ['Texas', 'Ranchers', 'American', 'West'],
  // National Conference – East
  ['Atlanta', 'Generals', 'National', 'East'],
  ['Miami', 'Flames', 'National', 'East'],
  ['New York', 'Captains', 'National', 'East'],
  ['Philadelphia', 'Revolutionaries', 'National', 'East'],
  ['DC', 'Ghouls', 'National', 'East'],
  // National Conference – Central
  ['Chicago', 'Lakers', 'National', 'Central'],
  ['Cincinnati', 'Dingers', 'National', 'Central'],
  ['Milwaukee', 'Hops', 'National', 'Central'],
  ['Pittsburgh', 'Scrappers', 'National', 'Central'],
  ['St Louis', 'Clydesdales', 'National', 'Central'],
  // National Conference – West
  ['Arizona', 'Desperados', 'National', 'West'],
  ['Colorado', 'Maulers', 'National', 'West'],
  ['Los Angeles', 'Gunners', 'National', 'West'],
  ['San Diego', 'Nine', 'National', 'West'],
  ['San Francisco', 'Sluggers', 'National', 'West'],
];

function buildDefaultTeams(): Team[] {
  return DEFAULT_TEAMS_RAW.map(([city, name, conference, division]) => {
    const a = abbr(city, name);
    const seed = hashStr(`${city} ${name}`);
    const roster = generateRoster(seed);
    return { id: `team:${a}`, city, name, conference, division, roster };
  });
}

// ── persistence layer ────────────────────────────────────────────────────

const LS_KEY = 'dice-baseball:teams';

async function saveTeamPouch(team: Team) {
  const db = await getPouchDB();
  if (db) {
    try {
      const existing = await db.get(team.id).catch(() => null);
      if (existing) {
        await db.put({ ...existing, ...team, _id: team.id, _rev: existing._rev });
      } else {
        await db.put({ ...team, _id: team.id });
      }
      return true;
    } catch { /* fall through */ }
  }
  // localStorage fallback
  const raw = localStorage.getItem(LS_KEY);
  const map: Record<string, Team> = raw ? JSON.parse(raw) : {};
  map[team.id] = team;
  localStorage.setItem(LS_KEY, JSON.stringify(map));
  return true;
}

export async function saveTeam(team: Team) {
  return saveTeamPouch(team);
}

export async function loadAllTeams(): Promise<Team[]> {
  const db = await getPouchDB();
  if (db) {
    try {
      const res = await db.allDocs({ startkey: 'team:', endkey: 'team:\uffff', include_docs: true });
      if (res.rows.length > 0) {
        return res.rows.map((r: any) => {
          const d = r.doc;
          return { id: d._id, city: d.city, name: d.name, conference: d.conference, division: d.division, roster: d.roster };
        });
      }
    } catch { /* fall through */ }
  }
  // localStorage fallback
  const raw = localStorage.getItem(LS_KEY);
  if (raw) {
    const map: Record<string, Team> = JSON.parse(raw);
    return Object.values(map);
  }
  return [];
}

export async function loadTeam(id: string): Promise<Team | null> {
  const db = await getPouchDB();
  if (db) {
    try {
      const d = await db.get(id);
      return { id: d._id, city: d.city, name: d.name, conference: d.conference, division: d.division, roster: d.roster };
    } catch { /* fall through */ }
  }
  const raw = localStorage.getItem(LS_KEY);
  if (raw) {
    const map: Record<string, Team> = JSON.parse(raw);
    return map[id] ?? null;
  }
  return null;
}

export async function deleteTeam(id: string) {
  const db = await getPouchDB();
  if (db) {
    try {
      const doc = await db.get(id);
      await db.remove(doc);
      return true;
    } catch { /* fall through */ }
  }
  const raw = localStorage.getItem(LS_KEY);
  if (raw) {
    const map: Record<string, Team> = JSON.parse(raw);
    delete map[id];
    localStorage.setItem(LS_KEY, JSON.stringify(map));
  }
  return true;
}

// ── seed defaults on first load ──────────────────────────────────────────

export async function ensureDefaultTeams(): Promise<Team[]> {
  let teams = await loadAllTeams();
  if (teams.length > 0) return teams;
  // first time: seed all 30 teams
  const defaults = buildDefaultTeams();
  for (const t of defaults) {
    await saveTeam(t);
  }
  return defaults;
}

export function getDefaultTeams(): Team[] {
  return buildDefaultTeams();
}
