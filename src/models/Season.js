import WithUUID from './WithUUID.js';

class Season extends WithUUID {
  constructor(year) {
    super();

    this.year = year; // 1-based "year" of a season
    this.schedule = [];
    this.playoff = [];
    this.champion;
  }

  generateSchedule() {
    // TODO generate schedule for a season
  }
}

export default Season;
