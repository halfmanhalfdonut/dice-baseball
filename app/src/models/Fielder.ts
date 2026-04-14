import Player from './Player';
import PlayerAttributes from './PlayerAttributes';

export default class Fielder extends Player {
  constructor(
    teamId = '',
    attributes: PlayerAttributes | null = null,
    firstName = '',
    lastName = '',
    number = 0,
    nationality = '',
    position = ''
  ) {
    super(teamId, attributes, firstName, lastName, number, nationality, position);

    if (attributes && (attributes.fielding < 0 || attributes.fielding > 100)) {
      throw new Error('Invalid fielding stat');
    }
  }
}
