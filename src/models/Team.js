import Base from './Base.js';

class Team extends Base {
  constructor(
    divisionId = '',
    city = '',
    name = '',
    colors = {},
    players = []
  ) {
    super();

    this.divisionId = divisionId;
    this.city = city;
    this.name = name;
    this.colors = colors;
    this.players = players;
  }

  setDivisionId(divisionId) {
    this.divisionId = divisionId;
    return this;
  }

  setCity(city) {
    this.city = city;
    return this;
  }

  setName(name) {
    this.name = name;
    return this;
  }

  setColors(colors) {
    this.colors = colors;
    return this;
  }

  setPlayers(players) {
    this.players = players;
    return this;
  }
}

export default Team;
