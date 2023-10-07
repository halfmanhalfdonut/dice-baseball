import WithUUID from './WithUUID.js';
import Player from './Player.js';
import nouns from '../data/nouns.js';
import adjectives from '../data/adjectives.js';
import towns from '../data/towns.js';
import { random } from '../services/Utils/Utils.js';

const nounsLength = nouns.length;
const adjectivesLength = adjectives.length;
const townsLength = towns.length;
const ROSTER_SIZE = 26;

class Team extends WithUUID {
  constructor() {
    super();
    
    this.city = towns[random(townsLength)];
    this.name = random(80) < 1 ? adjectives[random(adjectivesLength)] : ''; // some get an adjective
    this.name += nouns[random(nounsLength)];
    this.colors = {
      primary: this.generateHex(),
      secondary: this.generateHex(),
      tertiary: this.generateHex(),
    };
    this.players = [];
    
    for (let i = 0; i < ROSTER_SIZE; i++) {
      this.players.push(new Player());
    }
  }

  generateHex() {
    let chars = 'abcdef0123456789'.split('');
  
    let hex = '#';
    for (let i = 0; i < 6; i++) {
      hex += chars[random(16)];
    }
  
    return hex;
  }

  getPlayer(id) {
    return this.players.filter(player => player.id === id);
  }

}

export default Team;
