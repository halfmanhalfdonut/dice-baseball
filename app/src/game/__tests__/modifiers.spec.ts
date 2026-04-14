import { describe, it, expect } from 'vitest';
import { locationModifier, stakesModifier, weatherModifier, staminaModifier } from '../modifiers';

describe('modifiers', () => {
  it('locationModifier returns positive for home, negative for away, zero for neutral', () => {
    expect(locationModifier('home')).toBeGreaterThan(0);
    expect(locationModifier('away')).toBeLessThan(0);
    expect(locationModifier('neutral')).toBe(0);
  });

  it('stakesModifier penalizes worldseries most', () => {
    expect(stakesModifier('worldseries')).toBeLessThan(stakesModifier('playoff'));
    expect(stakesModifier('regular')).toBe(0);
  });

  it('weatherModifier has expected ordering', () => {
    expect(weatherModifier('rain')).toBeLessThan(weatherModifier('windy'));
    expect(weatherModifier('cold')).toBeLessThan(0);
    expect(weatherModifier('clear')).toBe(0);
  });

  it('staminaModifier is zero before 80 and increases afterwards', () => {
    expect(staminaModifier(20)).toBe(0);
    expect(staminaModifier(80)).toBe(0);
    expect(staminaModifier(100)).toBeGreaterThan(0);
    expect(staminaModifier(200)).toBeGreaterThan(staminaModifier(100));
  });
});
