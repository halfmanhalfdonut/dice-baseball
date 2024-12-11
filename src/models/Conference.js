import Base from './Base.js';

class Conference extends Base {
  constructor(name = '', leagueId = '', divisions = []) {
    super();

    this.name = name;
    this.leagueId = leagueId;
    this.divisions = divisions;
  }

  setName(name) {
    this.name = name;
    return this;
  }

  setLeagueId(leagueId) {
    this.leagueId = leagueId;
    return this;
  }

  setDivisions(divisions) {
    this.divisions = divisions;
    return this;
  }
}

export default Conference;
