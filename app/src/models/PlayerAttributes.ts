export default class PlayerAttributes {
  handedness: string;
  stamina: number;
  composure: number;
  strength: number;
  awareness: number;
  batting: number;
  pitching: number;
  fielding: number;
  streak: number;

  constructor(
    handedness = '',
    stamina = 50,
    composure = 50,
    strength = 50,
    awareness = 50,
    batting = 50,
    pitching = 50,
    fielding = 50,
    streak = 50
  ) {
    // Basic validation: all stats must be between 0 and 100
    const stats = [stamina, composure, strength, awareness, batting, pitching, fielding, streak];
    for (const s of stats) {
      if (typeof s !== 'number' || Number.isNaN(s) || s < 0 || s > 100) {
        throw new Error('Stat values must be numbers between 0 and 100');
      }
    }

    this.handedness = handedness;
    this.stamina = stamina;
    this.composure = composure;
    this.strength = strength;
    this.awareness = awareness;
    this.batting = batting;
    this.pitching = pitching;
    this.fielding = fielding;
    this.streak = streak;
  }

  setHandedness(handedness: string) {
    this.handedness = handedness;
    return this;
  }

  setStamina(stamina: number) {
    this.stamina = stamina;
    return this;
  }

  setComposure(composure: number) {
    this.composure = composure;
    return this;
  }

  setStrength(strength: number) {
    this.strength = strength;
    return this;
  }

  setAwareness(awareness: number) {
    this.awareness = awareness;
    return this;
  }

  setBatting(batting: number) {
    this.batting = batting;
    return this;
  }

  setPitching(pitching: number) {
    this.pitching = pitching;
    return this;
  }

  setFielding(fielding: number) {
    this.fielding = fielding;
    return this;
  }

  setStreak(streak: number) {
    this.streak = streak;
    return this;
  }
}
