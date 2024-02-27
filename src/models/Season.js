import Base from './Base.js';

class Season extends Base {
  generate(year) {
    this.year = year; // 1-based "year" of a season
    this.schedule = [];
    this.playoff = [];
    this.champion = null;

    this.put();

    return this;
  }

  generateSchedule() {
    // TODO generate schedule for a season
  }
}

export default Season;
