import Player from './Player';
import PlayerAttributes from './PlayerAttributes';

export default class Batter extends Player {
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

    if (attributes && (attributes.batting < 0 || attributes.batting > 100)) {
      throw new Error('Invalid batting stat');
    }
  }
}
