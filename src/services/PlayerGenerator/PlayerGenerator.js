import * as namingData from '../../data/player-names.js';
import { average, homer, slugger, weak, blind, diceCharacters } from '../../data/batter-options.js';

class PlayerGenerator {
  constructor() {
    console.log('Player Generator initialized');
    this.first = [];
    this.last = [];

    this.firstLength = namingData.first.length;
    this.lastLength = namingData.last.length;

    this.homer = homer;
    this.slugger = slugger;
    this.average = average;
    this.weak = weak;
    this.blind = blind;
  }

  getIndex = name => {
    let randomIndex = ~~(Math.random() * this[`${name}Length`]);
    while (this[name].includes(randomIndex)) {
      randomIndex = ~~(Math.random() * this[`${name}Length`]);
    }
    this[name].push(randomIndex);

    return randomIndex;
  }

  generateName = () => {
    return `${namingData.first[this.getIndex('first')]} ${namingData.last[this.getIndex('last')]}`;
  }
  
  getBatterType = () => {
    const random = ~~(Math.random() * 13);
    let batterType = 'average';

    if (random === 12) {
      batterType = 'homer';
    } else if (random > 9) {
      batterType = 'slugger';
    } else if (random === 0) {
      batterType = 'blind';
    } else if (random < 3) {
      batterType = 'weak';
    }

    return batterType;
  }

  generateStats = name => {
    const stats = {};
    const usedIndexes = [];
    const max = this[name].length;
    let counter = 0;
    let firstDie = 1;
    let secondDie = 1;

    while (counter < max) {
      let randomIndex = -1;
      while (randomIndex < 0 || usedIndexes.includes(randomIndex)) {
        randomIndex = ~~(Math.random() * max);
      }

      stats[`${firstDie}:${secondDie}`] = Object.assign({
        dice: `${diceCharacters[firstDie]}${diceCharacters[secondDie]}`
      }, this[name][randomIndex]);

      if (secondDie === 6) {
        firstDie++;
        secondDie = firstDie;
      } else {
        secondDie++;
      }
      usedIndexes.push(randomIndex);
      counter++;
    }

    return stats;
  }

  generatePlayer = () => {
    const batterType = this.getBatterType();

    return {
      name: this.generateName(),
      stats: this.generateStats(batterType),
      batterType
    }
  }
}

export default new PlayerGenerator();
