import Conference from './Conference.js';
import Season from './Season.js';
import Base from './Base.js';

class League extends Base {
  constructor(name) {
    super();

    let americanLeague = new Conference('American League', this._id);
    let nationalLeague = new Conference('National League', this._id);

    let conferences = [ americanLeague._id, nationalLeague._id ];

    let season = new Season(1);
    let seasons = [ season._id ];

    this.name = name;
    this.conferences = conferences;
    this.seasons = seasons;
    this.managers = []; // TODO: Add managers
    this.playerHistories = []; // TODO: add player histories
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
