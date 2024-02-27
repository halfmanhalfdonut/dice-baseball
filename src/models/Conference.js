import Base from './Base.js';
import Division from './Division.js';

class Conference extends Base {
  generate(name, leagueId) {
    let east = new Division().generate('East', this._id);
    let central = new Division().generate('Central', this._id);
    let west = new Division().generate('West', this._id);

    this.leagueId = leagueId;
    this.name = name;
    this.divisions = [ east._id, central._id, west._id ];

    this.put();

    return this;
  }

  getDivision(id) {
    return this.divisions.filter(_id => _id === id);
  }

}

export default Conference;
