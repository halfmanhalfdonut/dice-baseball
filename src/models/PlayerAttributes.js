import Base from './Base.js';
import { random } from '../services/Utils/Utils.js';

class PlayerAttributes extends Base {
  constructor() {
    super();
    
    // handedness can be right, left, or switch
    let randomHand = random(99);
    this.handedness = 'right';
    if (randomHand > 75) { // 25% chance of being lefty
      this.handedness = 'left';
    } else if (randomHand > 65) { // 10% chance of being switch
      this.handedness = 'switch';
    }

    this.stamina = random(99);
    this.composure = random(99);
    this.strength = random(99);
    this.awareness = random(99);
    this.batting = random(99);
    this.pitching = random(99);
    this.fielding = random(99);
    this.streak = 50;
  }

}

export default PlayerAttributes;
