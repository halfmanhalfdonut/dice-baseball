import Base from './Base.js';

class Season extends Base {
  constructor(year = 0, schedule = [], playoff = [], champion = null) {
    super();

    this.year = year;
    this.schedule = schedule;
    this.playoff = playoff;
    this.champion = champion;
  }

  setYear(year) {
    this.year = year;
    return this;
  }

  setSchedule(schedule) {
    this.schedule = schedule;
    return this;
  }

  setPlayoff(playoff) {
    this.playoff = playoff;
    return this;
  }

  setChampion(champion) {
    this.champion = champion;
    return this;
  }
}

export default Season;
