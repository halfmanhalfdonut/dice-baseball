import Base from './Base.js';

class PlayerAttributes extends Base {
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
    super();

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

  setHandedness(handedness) {
    this.handedness = handedness;
    return this;
  }

  setStamina(stamina) {
    this.stamina = stamina;
    return this;
  }

  setComposure(composure) {
    this.composure = composure;
    return this;
  }

  setStrength(strength) {
    this.strength = strength;
    return this;
  }

  setAwareness(awareness) {
    this.awareness = awareness;
    return this;
  }

  setBatting(batting) {
    this.batting = batting;
    return this;
  }

  setPitching(pitching) {
    this.pitching = pitching;
    return this;
  }

  setFielding(fielding) {
    this.fielding = fielding;
    return this;
  }

  setStreak(streak) {
    this.streak = streak;
    return this;
  }
}

export default PlayerAttributes;
