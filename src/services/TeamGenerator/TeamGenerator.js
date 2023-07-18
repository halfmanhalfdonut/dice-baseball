import nouns from '../../data/nouns.js';
import adjectives from '../../data/adjectives.js';
import towns from '../../data/towns.js';
import PlayerGenerator from '../PlayerGenerator/PlayerGenerator.js';
import { random } from '../Utils/Utils.js';

const TeamGenerator = {
  ROSTER_SIZE: 26,
  towns: [],
  nouns: [],
  adjectives: [],

  townsLength: towns.length,
  nounsLength: nouns.length,
  adjectivesLength: adjectives.length,

  generateHex: () => {
    let chars = 'abcdef0123456789'.split('');
  
    let hex = '#';
    for (let i = 0; i < 6; i++) {
      hex += chars[random(16)];
    }
  
    return hex;
  },

  generateColors: () => {
    const primary = TeamGenerator.generateHex();
    const secondary = TeamGenerator.generateHex();
  
    return { primary, secondary };
  },

  getIndex: source => {
    let randomIndex = random(TeamGenerator[`${source}Length`]);
    while (TeamGenerator[source].includes(randomIndex)) {
      randomIndex = random(TeamGenerator[`${source}Length`]);
    }
    TeamGenerator[source].push(randomIndex);

    return randomIndex;
  },

  generateTeamName: () => {
    let name = `${towns[TeamGenerator.getIndex('towns')]} `;

    // Sometimes add an adjective
    if (random(18) < 1) {
      name += `${adjectives[TeamGenerator.getIndex('adjectives')]} `;
    }

    name += nouns[TeamGenerator.getIndex('nouns')];

    return name;
  },

  generateRoster: () => {
    let roster = [];

    for (let i = 0; i < TeamGenerator.ROSTER_SIZE; i++) {
      roster.push(PlayerGenerator.generatePlayer());
    }

    return roster;
  },

  generateTeam: () => {
    return {
      name: TeamGenerator.generateTeamName(),
      colors: TeamGenerator.generateColors(),
      roster: TeamGenerator.generateRoster(),
    }
  },
}

export default TeamGenerator;
