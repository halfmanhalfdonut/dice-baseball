import WithUUID from './WithUUID.js';
import Team from './Team.js';

class Division extends WithUUID {
  constructor(name, teamCount = 5) {
    super();
    
    this.name = name;
    this.teams = [];

    for (let i = 0; i < teamCount; i++) {
      this.teams.push(new Team());
    }
  }

  getTeam(id) {
    return this.teams.filter(team => team.id === id);
  }

}

export default Division;
