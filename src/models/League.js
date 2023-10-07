import WithUUID from './WithUUID.js';

class League extends WithUUID {
  constructor(name) {
    super();
    
    this.name = name;
    this.seasons = [];
    this.managers = [];
    this.playerHistories = [];
  }

  getSeason = id => {
    return this.seasons.filter(season => season.id === id);
  }

  getManager = id => {
    return this.managers.filter(manager => manager.id === id);
  }

  getPlayerHistory = id => {
    return this.playerHistories.filter(history => history.id === id);
  }
}

export default League;
