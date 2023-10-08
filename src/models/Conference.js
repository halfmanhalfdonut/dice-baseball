import WithUUID from './WithUUID.js';
import Division from './Division.js';

class Conference extends WithUUID {
  constructor(name, leagueId, data) {
    super();

    let isNew = false;

    if (!data) {
      isNew = true;

      let east = new Division('East', this._id);
      let central = new Division('Central', this._id);
      let west = new Division('West', this._id);

      let divisions = [ east._id, central._id, west._id ];

      data = {
        leagueId,
        name,
        divisions,
      };
    }
    
    this.hydrate(data);
    isNew && this.put();
  }

  hydrate(data) {
    this.leagueId = data.leagueId;
    this.name = data.name;
    this.divisions = data.divisions;
  }

  getDivision(id) {
    return this.divisions.filter(_id => _id === id);
  }

}

export default Conference;
