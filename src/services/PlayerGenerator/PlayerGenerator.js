import { random } from '../Utils/Utils.js';
import firstNames from '../../data/first-names.js';
import lastNames from '../../data/last-names.js';
import { average, homer, slugger, weak, blind, diceCharacters } from '../../data/batter-options.js';

const PlayerGenerator = {
  first: [],
  last: [],
  firstLength: firstNames.length,
  lastLength: lastNames.length,
  homer: homer,
  slugger: slugger,
  average: average,
  weak: weak,
  blind: blind,

  getIndex: name => {
    let randomIndex = random(PlayerGenerator[`${name}Length`]);
    while (PlayerGenerator[name].includes(randomIndex)) {
      randomIndex = random(PlayerGenerator[`${name}Length`]);
    }
    PlayerGenerator[name].push(randomIndex);

    return randomIndex;
  },

  generateName: () => {
    return `${firstNames[PlayerGenerator.getIndex('first')]} ${lastNames[PlayerGenerator.getIndex('last')]}`;
  },

  getBatterType: () => {
    let random = random(13);
    let batterType = 'average';

    if (random >= 11) {
      batterType = 'homer';
    } else if (random >= 9 ) {
      batterType = 'slugger';
    } else if (random === 0) {
      batterType = 'blind';
    } else if (random < 3) {
      batterType = 'weak';
    }

    return batterType;
  },

  generateStats: name => {
    let stats = {};
    let max = PlayerGenerator[name].length;
    let firstDie = 1;
    let secondDie = 1;

    for (let i = 0; i < max; i++) {
      stats[`${firstDie}:${secondDie}`] = Object.assign({
        dice: `${diceCharacters[firstDie]}${diceCharacters[secondDie]}`
      }, PlayerGenerator[name][i]);

      if (secondDie === 6) {
        firstDie++;
        secondDie = firstDie;
      } else {
        secondDie++;
      }
    }

    return stats;
  },

  generatePlayer: () => {
    let batterType = PlayerGenerator.getBatterType();

    return {
      name: PlayerGenerator.generateName(),
      stats: PlayerGenerator.generateStats(batterType),
      batterType
    }
  },
};

export default PlayerGenerator;
