export interface TeamPlayer {
  id: string;
  name: string;
  position?: string;
  number?: number;
  speed: number;
  aggression: number;
  batting: number;
  strength: number;
  streak: number;
  pitching?: number;   // 0-100, relevant for pitchers
  stamina?: number;    // 0-100, how long a pitcher lasts
  composure?: number;  // 0-100, performance under pressure
}

export interface Team {
  id: string;
  city: string;
  name: string;
  conference: string;
  division: string;
  roster: TeamPlayer[];
}
