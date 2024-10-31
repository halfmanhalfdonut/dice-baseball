import Base from './Base.js';

class League extends Base {
  constructor(name = '', conferences = [], seasons = [], managers = [], playerHistories = []) {
    super();

    this.name = name;
    this.conferences = conferences;
    this.seasons = seasons;
    this.managers = managers;
    this.playerHistories = playerHistories;
  }

  setName(name) {
    this.name = name;
    return this;
  }

  setConferences(conferences) {
    this.conferences = conferences;
    return this;
  }

  setSeasons(seasons) {
    this.seasons = seasons;
    return this;
  }

  setManagers(managers) {
    this.managers = managers;
    return this;
  }

  setPlayerHistories(playerHistories) {
    this.playerHistories = playerHistories;
    return this;
  }
}

export default League;
