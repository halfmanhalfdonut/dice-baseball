import Base from './Base.js';
import PlayerAttributes from './PlayerAttributes.js';
import firstNames from '../data/first-names.js';
import lastNames from '../data/last-names.js';
import nationalities from '../data/nationalities.js';
import { random } from '../services/Utils/Utils.js';

const firstLength = firstNames.length;
const lastLength = lastNames.length;
const nationalityLength = nationalities.length;

class Player extends Base {
  constructor(teamId) {
    super();

    let attributes = new PlayerAttributes();
    let position = 'Pitcher';
    if (attributes.fielding > attributes.pitching) {
      position = random(99) > 49 ? 'Infielder' : 'Outfielder';
    }

    this.teamId = teamId;
    this.attributes = attributes;
    this.firstName = firstNames[random(firstLength)];
    this.lastName = lastNames[random(lastLength)];
    this.number = random(99);
    this.nationality = nationalities[random(nationalityLength)];
    this.position = position;
  }
}

export default Player;
