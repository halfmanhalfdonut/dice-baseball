import Base from './Base.js';
import Division from './Division.js';

class Conference extends Base {
  constructor(name, leagueId) {
    super();

    let east = new Division('East', this._id);
    let central = new Division('Central', this._id);
    let west = new Division('West', this._id);

    this.leagueId = leagueId;
    this.name = name;
    this.divisions = [ east._id, central._id, west._id ];
  }

  getDivision(id) {
    return this.divisions.filter(_id => _id === id);
  }

}

export default Conference;
