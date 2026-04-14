import { FIRST_NAMES, LAST_NAMES } from '../data/names';
import type { TeamPlayer } from '../models/Team';

// ── MLB-style 40-man roster positions ────────────────────────────────────

export type Position =
  | 'C' | '1B' | '2B' | '3B' | 'SS'
  | 'LF' | 'CF' | 'RF'
  | 'DH'
  | 'SP' | 'RP' | 'CL'
  | 'UTIL';

/**
 * Standard 40-man roster composition (mirrors a typical MLB team):
 *  - 5 SP, 4 RP, 1 CL  (10 pitchers — bullpen is slim in a 40-man; extra arms below)
 *  - 2 C, 2 1B, 2 2B, 2 3B, 2 SS  (10 infielders)
 *  - 2 LF, 2 CF, 2 RF  (6 outfielders)
 *  - 1 DH
 *  - Plus 3 extra SP, 4 extra RP, 4 extra UTIL, 2 extra C to fill to 40
 */
const ROSTER_TEMPLATE: Position[] = [
  // Starting pitchers (5)
  'SP', 'SP', 'SP', 'SP', 'SP',
  // Relief pitchers (7)
  'RP', 'RP', 'RP', 'RP', 'RP', 'RP', 'RP',
  // Closer (1)
  'CL',
  // Catchers (2)
  'C', 'C',
  // Infielders (8)
  '1B', '1B',
  '2B', '2B',
  '3B', '3B',
  'SS', 'SS',
  // Outfielders (6)
  'LF', 'LF',
  'CF', 'CF',
  'RF', 'RF',
  // DH (1)
  'DH',
  // Bench / depth (7)
  'C',       // third catcher
  'UTIL',    // utility infielder
  'UTIL',    // utility outfielder
  'UTIL',    // pinch hitter
  'SP',      // 6th starter / long relief
  'RP',      // extra bullpen arm
  'UTIL',    // extra position player
];
// total = 40

// ── Seeded PRNG (simple mulberry32) ─────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── stat profiles by batter type ─────────────────────────────────────────

type BatterType = 'homer' | 'slugger' | 'average' | 'weak' | 'contact' | 'speedster';

interface StatRange { batting: [number, number]; strength: [number, number]; speed: [number, number]; streak: [number, number]; aggression: [number, number] }

const PROFILES: Record<BatterType, StatRange> = {
  homer:     { batting:[55,75], strength:[70,95], speed:[25,50], streak:[40,70], aggression:[0.25,0.45] },
  slugger:   { batting:[55,70], strength:[60,85], speed:[30,55], streak:[45,70], aggression:[0.20,0.40] },
  average:   { batting:[45,65], strength:[40,65], speed:[40,60], streak:[40,65], aggression:[0.15,0.35] },
  contact:   { batting:[60,80], strength:[30,50], speed:[45,65], streak:[50,75], aggression:[0.10,0.25] },
  speedster: { batting:[40,60], strength:[30,50], speed:[65,90], streak:[40,60], aggression:[0.20,0.40] },
  weak:      { batting:[30,50], strength:[25,45], speed:[35,55], streak:[30,55], aggression:[0.10,0.30] },
};

// Pitchers get a different profile
const PITCHER_PROFILE: StatRange = {
  batting:[20,40], strength:[25,45], speed:[25,45], streak:[35,55], aggression:[0.10,0.20]
};

/** Pitcher-specific stat ranges */
interface PitchingRange { pitching: [number, number]; stamina: [number, number]; composure: [number, number] }

const SP_PITCHING: PitchingRange = { pitching:[55,85], stamina:[60,90], composure:[50,75] };
const RP_PITCHING: PitchingRange = { pitching:[45,75], stamina:[30,55], composure:[45,70] };
const CL_PITCHING: PitchingRange = { pitching:[60,90], stamina:[25,50], composure:[60,85] };

const BATTER_TYPES: BatterType[] = ['homer','slugger','average','average','average','contact','contact','speedster','weak'];

// ── Generator ────────────────────────────────────────────────────────────

function pickRange(rng: () => number, range: [number, number]): number {
  return Math.round(range[0] + rng() * (range[1] - range[0]));
}

function pickRangeF(rng: () => number, range: [number, number]): number {
  return +(range[0] + rng() * (range[1] - range[0])).toFixed(2);
}

export interface RosterPlayer extends TeamPlayer {
  position: Position;
  number: number;
}

export function generateRoster(seed: number): RosterPlayer[] {
  const rng = mulberry32(seed);
  const usedFirstIdx = new Set<number>();
  const usedLastIdx = new Set<number>();
  const usedNumbers = new Set<number>();

  function pickUnique(arr: readonly string[], used: Set<number>): string {
    let idx: number;
    let attempts = 0;
    do {
      idx = Math.floor(rng() * arr.length);
      attempts++;
      if (attempts > arr.length) { used.clear(); } // safety: clear if saturated
    } while (used.has(idx));
    used.add(idx);
    return arr[idx];
  }

  function pickNumber(): number {
    let n: number;
    do { n = 1 + Math.floor(rng() * 99); } while (usedNumbers.has(n));
    usedNumbers.add(n);
    return n;
  }

  return ROSTER_TEMPLATE.map((position, i) => {
    const firstName = pickUnique(FIRST_NAMES, usedFirstIdx);
    const lastName = pickUnique(LAST_NAMES, usedLastIdx);
    const isPitcher = position === 'SP' || position === 'RP' || position === 'CL';
    const profile = isPitcher ? PITCHER_PROFILE : PROFILES[BATTER_TYPES[Math.floor(rng() * BATTER_TYPES.length)]];
    const num = pickNumber();

    return {
      id: `${firstName[0].toUpperCase()}.${lastName}`,
      name: `${firstName} ${lastName}`,
      position,
      number: num,
      batting: pickRange(rng, profile.batting),
      strength: pickRange(rng, profile.strength),
      speed: pickRange(rng, profile.speed),
      streak: pickRange(rng, profile.streak),
      aggression: pickRangeF(rng, profile.aggression),
      ...(isPitcher ? {
        pitching: pickRange(rng, (position === 'SP' ? SP_PITCHING : position === 'CL' ? CL_PITCHING : RP_PITCHING).pitching),
        stamina: pickRange(rng, (position === 'SP' ? SP_PITCHING : position === 'CL' ? CL_PITCHING : RP_PITCHING).stamina),
        composure: pickRange(rng, (position === 'SP' ? SP_PITCHING : position === 'CL' ? CL_PITCHING : RP_PITCHING).composure),
      } : {}),
    };
  });
}

/**
 * Returns a starting lineup of 9 position players from the roster
 * (skips pitchers, picks one per fielding position + DH).
 */
export function startingLineup(roster: RosterPlayer[]): RosterPlayer[] {
  const needed: Position[] = ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH'];
  const lineup: RosterPlayer[] = [];
  const used = new Set<string>();
  for (const pos of needed) {
    const pick = roster.find(p => p.position === pos && !used.has(p.id))
      ?? roster.find(p => p.position === 'UTIL' && !used.has(p.id));
    if (pick) { lineup.push(pick); used.add(pick.id); }
  }
  return lineup;
}

/** Returns the pitching staff from a roster, ordered: SP first, then RP, then CL. */
export function pitchingStaff(roster: RosterPlayer[]): RosterPlayer[] {
  const order: Record<string, number> = { SP: 0, RP: 1, CL: 2 };
  return roster
    .filter(p => p.position === 'SP' || p.position === 'RP' || p.position === 'CL')
    .sort((a, b) => (order[a.position] ?? 9) - (order[b.position] ?? 9));
}

/** Pick the starting pitcher (first SP in the roster). */
export function startingPitcher(roster: RosterPlayer[]): RosterPlayer | undefined {
  return roster.find(p => p.position === 'SP');
}
