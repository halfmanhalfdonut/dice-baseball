import Conference from './Conference.js';
import Season from './Season.js';
import WithUUID from './WithUUID.js';

class League extends WithUUID {
  constructor(name, data) {
    super();

    let isNew = false;

    if (!data) {
      isNew = true;

      let americanLeague = new Conference('American League', this._id);
      let nationalLeague = new Conference('National League', this._id);

      let conferences = [ americanLeague._id, nationalLeague._id ];

      let season = new Season(1);
      let seasons = [ season._id ];

      data = {
        name,
        conferences,
        seasons,
        managers: [], // TODO: add managers
        playerHistories: [] // TODO: add player histories
      };
    }

    this.hydrate(data);
    isNew && this.put();
  }

  hydrate(data) {
    this.name = data.name;
    this.conferences = data.conferences;
    this.seasons = data.seasons;
    this.managers = data.managers;
    this.playerHistories = data.playerHistories;
  }

  getSeason(id) {
    return this.seasons.filter(_id => _id === id);
  }

  getManager(id) {
    return this.managers.filter(_id => _id === id);
  }

  getPlayerHistory(id) {
    return this.playerHistories.filter(_id => _id === id);
  }
}

export default League;
