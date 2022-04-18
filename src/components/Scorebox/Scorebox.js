class Scorebox extends HTMLElement {
  constructor() {
    super();

    this.innings = [];
    for (let i = 0; i < 9; i++) {
      this.innings.push({
        home: 0,
        visitor: 0
      });
    }
    this.currentInning = 0;
    this.battingTeam = 'visitor';

    this.visitor = {
      runs: 0,
      hits: 0,
    };

    this.home = {
      runs: 0,
      hits: 0,
    };

    this.resetInningTally();
  }

  removeEventListeners = () => {
    document.removeEventListener('dice:roll:batter', this.handleBatter);
  }

  resetInningTally = () => {
    this.inningTally = {
      visitor: 0,
      home: 0,
      outs: 0,
      bases: []
    };
  }

  handleSwitchSides = () => {
    // Is this game over or what?
    if (this.currentInning >= 8 && this.home.runs > this.visitor.runs) {
      // Game over
      console.log('Game over. Home wins!');
    } else if (this.currentInning >= 8 && this.visitor.runs > this.home.runs) {
      if (this.battingTeam === 'home') {
        console.log('Game over. Visitor wins!');
      }
    }

    if (this.battingTeam === 'visitor') {
      this.inningTally.outs = 0;
      this.inningTally.bases = [];
    } else {
      this.resetInningTally();
      this.currentInning++;
    }

    this.battingTeam = this.battingTeam === 'visitor' ? 'home' : 'visitor';
    this.inningTally.outs = 0;

    // Extra innings?
    if (!this.innings[this.currentInning]) {
      this.innings[this.currentInning] = {
        home: 0,
        visitor: 0
      };
    }
  }

  handleRuns = runs => {
    this.innings[this.currentInning][this.battingTeam] += runs;
    this.inningTally[this.battingTeam] += runs;
    this[this.battingTeam].runs += runs;
  }

  handleBases = bases => {
    if (bases > 0) {
      this.inningTally.bases.splice(0, 0, ...(new Array(bases).fill(null)));
      this.inningTally.bases[bases - 1] = 'x';
      const advances = this.inningTally.bases.splice(3);
      const runs = advances.reduce((runners, base) => {
        if (base === 'x') {
          runners++;
        }

        return runners;
      }, 0);

      this.handleRuns(runs);
    }
  }

  handleBatter = ({ detail }) => {
    const { result } = detail;
    const { outs, bases, hits } = result;
    
    this.inningTally.outs += outs;

    if (this.inningTally.outs < 3) {
      this.handleBases(bases);
      this[this.battingTeam].hits += hits;
    } else {
      this.handleSwitchSides();
    }

    this.updateUI();
  }

  getTeamRow = (team, totalInnings) => {
    let html = `<tr><td class="team-name">${team}</td>`;
    
    for (let i = 0; i < totalInnings; i++) {
      let temp = '<td>&nbsp;</td>';
      const score = this.innings[i]?.[team];

      if (this.currentInning > i) {
        temp = `<td>${score}</td>`;
      } else if (this.currentInning === i && (this.battingTeam === 'home' || team === 'visitor')) {
        temp = `<td>${score}</td>`;
      }

      html += temp;
    }

    return html += `<td>${this[team].runs}</td><td>${this[team].hits}</td></tr>`;
  }

  updateUI = () => {
    const totalInnings = Math.max(this.innings.length, 9);

    let tableHtml = `<table class="scoreboard"><thead><tr><th>&nbsp;</th>`;

    for (let i = 0; i < totalInnings; i++) {
      tableHtml += `<th>${i + 1}</th>`;
    }

    tableHtml += `<th>R</th><th>H</th></tr></thead>`;

    tableHtml += `<tbody>`;
    tableHtml += this.getTeamRow('visitor', totalInnings);
    tableHtml += this.getTeamRow('home', totalInnings);
    tableHtml += `</tbody></table>`;

    let outsHtml = `<div class="outs">`;
    if (this.inningTally.outs > 0) {
      outsHtml += `Outs: ${new Array(this.inningTally.outs).fill('⚾').join(' ')}`;
    } else {
      outsHtml += `No Outs`;
    }

    outsHtml += `</div>`;

    let html = tableHtml + outsHtml;
    this.wrapper.innerHTML = html;
  }

  connectedCallback() {
    this.removeEventListeners();

    const wrapper = document.createElement('section');
    wrapper.setAttribute('class', 'scorebox');
    this.wrapper = wrapper;
    this.updateUI();
    this.appendChild(wrapper);

    document.addEventListener('dice:roll:batter', this.handleBatter);
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }
}

export const scorebox = () => customElements.define('db-scorebox', Scorebox);
