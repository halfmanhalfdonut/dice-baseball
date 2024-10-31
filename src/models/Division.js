import Base from './Base.js';

class Division extends Base {
  constructor(name = '', conferenceId = '', teams = []) {
    super();

    this.name = name;
    this.conferenceId = conferenceId;
    this.teams = teams;
  }

  setName(name) {
    this.name = name;
    return this;
  }

  setConferenceId(conferenceId) {
    this.conferenceId = conferenceId;
    return this;
  }

  setTeams(teams) {
    this.teams = teams;
    return this;
  }
}

export default Division;
