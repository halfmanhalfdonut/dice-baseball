import { Location, Stakes, Weather } from './Pitch';

export function locationModifier(loc: Location): number {
  if (loc === 'home') return 0.02;
  if (loc === 'away') return -0.02;
  return 0;
}

export function stakesModifier(stakes: Stakes): number {
  if (stakes === 'worldseries') return -0.03;
  if (stakes === 'playoff') return -0.01;
  return 0;
}

export function weatherModifier(weather: Weather): number {
  switch (weather) {
    case 'windy': return -0.02;
    case 'rain': return -0.03;
    case 'cold': return -0.01;
    default: return 0;
  }
}

export function staminaModifier(pitchCount: number): number {
  // linear penalty starting after 80 pitches: (pitchCount - 80) / 200
  return Math.max(0, (pitchCount - 80) / 200);
}

export function pitchTypeModifier(pitchType: string | null): number {
  // simple mapping: fastball slight advantage, breaking balls slightly harder to hit
  if (!pitchType) return 0;
  switch (pitchType) {
    case 'fastball': return 0.01;
    case 'slider': return -0.005;
    case 'curve': return -0.01;
    case 'changeup': return -0.008;
    default: return 0;
  }
}

export function techniqueModifier(technique: number): number {
  // technique is 0..100, map to -0.05..0.05
  return (technique - 50) / 1000; // e.g., 60 -> 0.01
}
