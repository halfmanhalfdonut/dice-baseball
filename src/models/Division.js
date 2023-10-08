import WithUUID from './WithUUID.js';
import Team from './Team.js';

class Division extends WithUUID {
  constructor(name, conferenceId, teamCount = 5, data) {
    super();

    let isNew = false;

    if (!data) {
      isNew = true;

      let teams = [];
      for (let i = 0; i < teamCount; i++) {
        console.log('THIS ID', this._id);
        let team = new Team(this._id);
        teams.push(team._id);
      }

      data = {
        conferenceId,
        name,
        teams,
      };
    }
    
    this.hydrate(data);
    isNew && this.put();
  }

  hydrate(data) {
    this.conferenceId = data.conferenceId;
    this.name = data.name;
    this.teams = data.teams;
  }

  getTeam(id) {
    return this.teams.filter(_id => _id === id);
  }

}

export default Division;
