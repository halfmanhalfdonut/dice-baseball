import WithUUID from './WithUUID.js';
import Division from './Division.js';

class Conference extends WithUUID {
  constructor(name) {
    super();
    
    this.name = name;
    this.divisions = [
      new Division('East'),
      new Division('Central'),
      new Division('West')
    ];
  }

  getDivision(id) {
    return this.divisions.filter(division => division.id === id);
  }

}

export default Conference;
