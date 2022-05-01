import * as namingData from '../../data/team-names.js';
import playerGenerator from '../PlayerGenerator/PlayerGenerator.js';

class TeamGenerator {
  constructor() {
    console.log('Team Generator initialized');
    this.towns = [];
    this.nouns = [];
    this.adjectives = [];
    this.rosterSize = 26;

    this.townsLength = namingData.towns.length;
    this.nounsLength = namingData.nouns.length;
    this.adjectivesLength = namingData.adjectives.length;
  }

  generateHex = () => {
    const chars = 'abcdef0123456789'.split('');
  
    let hex = '#';
    for (let i = 0; i < 6; i++) {
      hex += chars[~~(Math.random() * 16)];
    }
  
    return hex;
  }

  generateColors = () => {
    const primary = this.generateHex();
    const secondary = this.generateHex();
  
    return { primary, secondary };
  }

  getIndex = name => {
    let randomIndex = ~~(Math.random() * this[`${name}Length`]);
    while (this[name].includes(randomIndex)) {
      randomIndex = ~~(Math.random() * this[`${name}Length`]);
    }
    this[name].push(randomIndex);

    return randomIndex;
  }

  generateTeamName = () => {
    let name = `${namingData.towns[this.getIndex('towns')]} `;

    // Sometimes add an adjective
    if (~~(Math.random() * 5) < 1) {
      name += `${namingData.adjectives[this.getIndex('adjectives')]} `;
    }

    name += namingData.nouns[this.getIndex('nouns')];

    return name;
  }

  generateRoster = () => {
    const roster = [];

    for (let i = 0; i < this.rosterSize; i++) {
      roster.push(playerGenerator.generatePlayer());
    }

    return roster;
  }

  generateTeam = () => {
    return {
      name: this.generateTeamName(),
      colors: this.generateColors(),
      roster: this.generateRoster(),
    }
  }
}

export default new TeamGenerator();
