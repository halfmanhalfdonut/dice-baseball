import Base from './Base.js';
import Team from './Team.js';

class Division extends Base {
  generate(name, conferenceId, teamCount = 5) {
    let teams = [];
    for (let i = 0; i < teamCount; i++) {
      let team = new Team().generate(this._id);
      teams.push(team._id);
    }

    this.conferenceId = conferenceId;
    this.name = name;
    this.teams = teams;
    
    this.put();

    return this;
  }

  getTeam(id) {
    return this.teams.filter(_id => _id === id);
  }

}

export default Division;
