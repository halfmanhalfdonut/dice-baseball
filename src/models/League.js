import Conference from './Conference.js';
import Season from './Season.js';
import WithUUID from './WithUUID.js';

class League extends WithUUID {
  constructor(name) {
    super();
    
    this.name = name;
    this.conferences = [
      new Conference('American League'),
      new Conference('National League'),
    ];
    this.seasons = [
      new Season(1),
    ];
    this.managers = [];
    this.playerHistories = [];
  }

  getSeason(id) {
    return this.seasons.filter(season => season.id === id);
  }

  getManager(id) {
    return this.managers.filter(manager => manager.id === id);
  }

  getPlayerHistory(id) {
    return this.playerHistories.filter(history => history.id === id);
  }
}

export default League;
