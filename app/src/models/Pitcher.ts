import Player from './Player';
import PlayerAttributes from './PlayerAttributes';

export default class Pitcher extends Player {
  pitches: Record<string, number>;

  constructor(
    teamId = '',
    attributes: PlayerAttributes | null = null,
    firstName = '',
    lastName = '',
    number = 0,
    nationality = '',
    position = 'P',
    pitches: Record<string, number> = {}
  ) {
    super(teamId, attributes, firstName, lastName, number, nationality, position);

    // validate pitches
    for (const key in pitches) {
      const v = pitches[key];
      if (typeof v !== 'number' || Number.isNaN(v) || v < 0 || v > 200) {
        throw new Error('Invalid pitch value');
      }
    }

    this.pitches = pitches;
  }
}
