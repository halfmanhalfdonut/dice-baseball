import Base from './Base.js';

class Season extends Base {
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
