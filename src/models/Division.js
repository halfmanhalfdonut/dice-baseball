import Base from './Base.js';
import Team from './Team.js';

class Division extends Base {
  constructor(name, conferenceId, teamCount = 5) {
    super();
    
    let teams = [];
    for (let i = 0; i < teamCount; i++) {
      let team = new Team(this._id);
      teams.push(team._id);
    }

    this.conferenceId = conferenceId;
    this.name = name;
    this.teams = teams;
  }

  getTeam(id) {
    return this.teams.filter(_id => _id === id);
  }

}

export default Division;
