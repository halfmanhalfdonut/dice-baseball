import PlayerAttributes from './PlayerAttributes';

export default class Player {
  teamId: string;
  attributes: PlayerAttributes | null;
  firstName: string;
  lastName: string;
  number: number;
  nationality: string;
  position: string;

  constructor(
    teamId = '',
    attributes: PlayerAttributes | null = null,
    firstName = '',
    lastName = '',
    number = 0,
    nationality = '',
    position = ''
  ) {
    this.teamId = teamId;
    this.attributes = attributes;
    this.firstName = firstName;
    this.lastName = lastName;
    this.number = number;
    this.nationality = nationality;
    this.position = position;
  }

  setTeamId(teamId: string) {
    this.teamId = teamId;
    return this;
  }

  setAttributes(attributes: PlayerAttributes) {
    this.attributes = attributes;
    return this;
  }

  setFirstName(firstName: string) {
    this.firstName = firstName;
    return this;
  }

  setLastName(lastName: string) {
    this.lastName = lastName;
    return this;
  }

  setNumber(number: number) {
    this.number = number;
    return this;
  }

  setNationality(nationality: string) {
    this.nationality = nationality;
    return this;
  }

  setPosition(position: string) {
    this.position = position;
    return this;
  }
}
