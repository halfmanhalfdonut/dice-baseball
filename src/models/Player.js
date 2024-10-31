import Base from './Base.js';

class Player extends Base {
  constructor(
    teamId = '',
    attributes = null,
    firstName = '',
    lastName = '',
    number = 0,
    nationality = '',
    position = ''
  ) {
    super();

    this.teamId = teamId;
    this.attributes = attributes;
    this.firstName = firstName;
    this.lastName = lastName;
    this.number = number;
    this.nationality = nationality;
    this.position = position;
  }

  setTeamId(teamId) {
    this.teamId = teamId;
    return this;
  }

  setAttributes(attributes) {
    this.attributes = attributes;
    return this;
  }

  setFirstName(firstName) {
    this.firstName = firstName;
    return this;
  }

  setLastName(lastName) {
    this.lastName = lastName;
    return this;
  }

  setNumber(number) {
    this.number = number;
    return this;
  }

  setNationality(nationality) {
    this.nationality = nationality;
    return this;
  }

  setPosition(position) {
    this.position = position;
    return this;
  }
}

export default Player;
