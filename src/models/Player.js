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
  constructor(teamId, data) {
    super();

    let isNew = false;
    
    if (!data) {
      isNew = true;

      let attributes = new PlayerAttributes();
      let position = 'Pitcher';
      if (attributes.fielding > attributes.pitching) {
        position = random(99) > 49 ? 'Infielder' : 'Outfielder';
      }

      data = {
        teamId,
        attributes,
        firstName: firstNames[random(firstLength)],
        lastName: lastNames[random(lastLength)],
        number: random(99),
        nationality: nationalities[random(nationalityLength)],
        position,
      };
    }

    this.hydrate(data);
    isNew && this.put(); // save it if it's a new one
  }

  hydrate(data) {
    this.teamId = data.teamId;
    this.attributes = data.attributes;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.number = data.number;
    this.nationality = data.nationality;
    this.position = data.position;
  }
}

export default Player;
