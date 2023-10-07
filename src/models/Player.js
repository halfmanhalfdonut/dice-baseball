import WithUUID from './WithUUID.js';
import PlayerAttributes from './PlayerAttributes.js';
import firstNames from '../data/first-names.js';
import lastNames from '../data/last-names.js';
import nationalities from '../data/nationalities.js';
import { random } from '../services/Utils/Utils.js';

const firstLength = firstNames.length;
const lastLength = lastNames.length;
const nationalityLength = nationalities.length;

class Player extends WithUUID {
  constructor() {
    super();
    
    this.attributes = new PlayerAttributes();
    this.firstName = firstNames[random(firstLength)];
    this.lastName = lastNames[random(lastLength)];
    this.number = random(99);
    this.nationality = nationalities[random(nationalityLength)];
    
    if (this.attributes.pitching > this.attributes.fielding) {
      this.position = 'Pitcher';
    } else {
      this.position = random(99) > 49 ? 'Infielder' : 'Outfielder';
    }
  }

}

export default Player;
