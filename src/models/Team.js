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
  constructor(divisionId, data) {
    super();

    let isNew = false;

    if (!data) {
      isNew = true;

      let players = [];
      for (let i = 0; i < ROSTER_SIZE; i++) {
        let player = new Player(this._id);
        players.push(player._id);
      }

      data = {
        divisionId,
        city: towns[random(townsLength)],
        name: (random(80) < 1 ? adjectives[random(adjectivesLength)] : '') + nouns[random(nounsLength)],
        colors: {
          primary: this.generateHex(),
          secondary: this.generateHex(),
          tertiary: this.generateHex(),
        },
        players,
      }
    }

    this.hydrate(data);
    isNew && this.put();
  }

  hydrate(data) {
    this.divisionId = data.divisionId;
    this.city = data.city;
    this.name = data.name;
    this.colors = data.colors;
    this.players = data.players;
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
    return this.players.filter(_id => _id === id);
  }

}

export default Team;
