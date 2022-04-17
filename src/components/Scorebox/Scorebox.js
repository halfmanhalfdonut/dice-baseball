class Scorebox extends HTMLElement {
  constructor() {
    super();

    this.innings = [];
    this.currentInning = 0;

    this.visitor = {
      runs: 0,
      hits: 0,
      outs: 0,
    };

    this.home = {
      runs: 0,
      hits: 0,
      outs: 0,
    };
  }

  getTeamRow = (team, totalInnings) => {
    const row = document.createElement('tr');
    const name = document.createElement('td');
    name.setAttribute('class', 'team-name');
    name.innerText = team;

    row.appendChild(name);
    for (let i = 0; i < totalInnings; i++) {
      const inning = document.createElement('td');
      inning.innerText = this.innings[i]?.[team] || '--';
      row.appendChild(inning);
    }
    const runs = document.createElement('td');
    runs.innerText = this[team].runs;
    row.appendChild(runs);

    const hits = document.createElement('td');
    hits.innerText = this[team].hits;
    row.appendChild(hits);

    return row;
  }

  connectedCallback() {
    const wrapper = document.createElement('section');
    wrapper.setAttribute('class', 'scorebox');

    const scoreboard = document.createElement('table');
    scoreboard.setAttribute('class', 'scoreboard');

    const totalInnings = Math.max(this.innings.length, 9);

    const thead = document.createElement('thead');
    const tableHeadingRow = document.createElement('tr');
    const emptyCell = document.createElement('th');
    tableHeadingRow.appendChild(emptyCell);

    for (let i = 0; i < totalInnings; i++) {
      const inning = document.createElement('th');
      inning.innerText = i + 1;
      tableHeadingRow.appendChild(inning);
    }

    const runsLabel = document.createElement('th');
    runsLabel.innerText = 'R';
    tableHeadingRow.appendChild(runsLabel);

    const hitsLabel = document.createElement('th');
    hitsLabel.innerText = 'H';
    tableHeadingRow.appendChild(hitsLabel);

    thead.appendChild(tableHeadingRow);
    scoreboard.appendChild(thead);

    const tbody = document.createElement('tbody');
    const visitorRow = this.getTeamRow('visitor', totalInnings);
    const homeRow = this.getTeamRow('home', totalInnings);
    tbody.appendChild(visitorRow);
    tbody.appendChild(homeRow);
    scoreboard.appendChild(tbody);

    const outs = document.createElement('db-outs');
    outs.setAttribute('class', 'outs');

    wrapper.appendChild(scoreboard);
    wrapper.appendChild(outs);

    this.appendChild(wrapper);
  }
}

export const scorebox = () => customElements.define('db-scorebox', Scorebox);
