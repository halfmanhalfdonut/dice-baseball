class Scorebox extends HTMLElement {
  constructor() {
    super();

    this.isGameOver = false;
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

    this.setTeams();
    this.resetInningTally();
  }

  setTeams = () => {
    const teams = JSON.parse(localStorage.getItem('teams'));
    const visitor = ~~(Math.random() * teams.length);
    let home = visitor;

    while (home === visitor) {
      home = ~~(Math.random() * teams.length);
    }

    this.visitor.team = teams[visitor];
    this.home.team = teams[home];
  }

  removeEventListeners = () => {
    document.removeEventListener('dice:roll:batter', this.handleBatter);
  }

  resetInningTally = () => {
    this.inningTally = {
      visitor: 0,
      home: 0,
      outs: 0,
      bases: ['','','']
    };
  }

  handleSwitchSides = () => {
    // Is this game over or what?
    if (this.currentInning >= 8 && this.home.runs > this.visitor.runs) {
      // Game over
      console.log('Game over. Home wins!');
      this.isGameOver = true;
    } else if (this.currentInning >= 8 && this.visitor.runs > this.home.runs) {
      if (this.battingTeam === 'home') {
        console.log('Game over. Visitor wins!');
        this.isGameOver = true;
      }
    }

    if (this.battingTeam === 'visitor') {
      this.inningTally.outs = 0;
      this.inningTally.bases = ['','',''];
    } else {
      this.resetInningTally();
      this.currentInning++;
    }

    this.battingTeam = this.battingTeam === 'visitor' ? 'home' : 'visitor';
    this.inningTally.outs = 0;

    if (!this.isGameOver) {
      // Extra innings?
      if (!this.innings[this.currentInning]) {
        this.innings[this.currentInning] = {
          home: 0,
          visitor: 0
        };
      }
  
      document.dispatchEvent(new CustomEvent('dice:switch'));
    } else {
      document.dispatchEvent(new CustomEvent('game:over'));
    }
  }

  handleRuns = runs => {
    this.innings[this.currentInning][this.battingTeam] += runs;
    this.inningTally[this.battingTeam] += runs;
    this[this.battingTeam].runs += runs;
  }

  handleBases = (bases, outs, isSacrifice, isWalk) => {
    if (bases > 0) {
      if (isWalk) {
        let baseCounter = 0;
        let hasRunnerNextBase = this.inningTally.bases[baseCounter] === 'x';
        while (hasRunnerNextBase) {
          baseCounter++;
          hasRunnerNextBase = this.inningTally.bases[baseCounter] === 'x';
        }

        for (let i = 0; i < baseCounter + 1; i++) {
          this.inningTally.bases[i] = 'x';
        }
      } else {
        this.inningTally.bases.splice(0, 0, ...(new Array(bases).fill('')));

        if (!isSacrifice) {
          this.inningTally.bases[bases - 1] = 'x';
        }
      }

      const advances = this.inningTally.bases.splice(3);
      const runs = advances.reduce((runners, base) => {
        if (base === 'x') {
          runners++;
        }

        return runners;
      }, 0);

      this.handleRuns(runs);
    } else {
      // double play?
      if (outs > 1) {
        const currentBaserunners = this.inningTally.bases.reduce((runners, base, index) => {
          if (base === 'x') {
            runners.push(index);
          }

          return runners;
        }, []);

        const removeIndex = currentBaserunners.length > 1 ? ~~(Math.random() * currentBaserunners.length) : 0;
        this.inningTally.bases[removeIndex] = ''; // this guy is out
      }
    }

    document.dispatchEvent(new CustomEvent('dice:bases', {
      detail: {
        bases: this.inningTally.bases
      }
    }));
  }

  handleOuts = outs => {
    // can't double play when no one else is on base
    if (outs > 1) {
      const totalCurrentBaserunners = this.inningTally.bases.reduce((total, base) => {
        if (base === 'x') {
          total += 1;
        }

        return total;
      }, 0);

      if (totalCurrentBaserunners === 0) {
        outs = 1;
      }
    }

    this.inningTally.outs += outs;
  }

  handleBatter = ({ detail }) => {
    const { result } = detail;
    const { outs, bases, hits, description } = result;
    const isSacrifice = description.indexOf('Sacrifice') > -1;
    const isWalk = description.indexOf('Walk') > -1;
    
    this.handleOuts(outs);

    if (this.inningTally.outs < 3) {
      this.handleBases(bases, outs, isSacrifice, isWalk);
      this[this.battingTeam].hits += hits;
    } else {
      this.handleSwitchSides();
    }

    this.updateUI();
  }

  getTeamColors = colors => {
    return Object.keys(colors).reduce((memo, key) => {
      return `${memo}<span class="team-color" style="background: ${colors[key]};">&nbsp;&nbsp;</span>`;
    }, '');
  }

  getTeamRow = (team, totalInnings) => {
    let html = `<tr><td class="team-name">${this.getTeamColors(this[team].team.colors)} ${this[team].team.name}</td>`;
    
    for (let i = 0; i < totalInnings; i++) {
      const cssClass = (team === this.battingTeam && this.currentInning === i) ? 'current-inning' : '';
      const score = this.innings[i]?.[team];
      let temp = '<td>&nbsp;</td>';

      if (this.currentInning > i) {
        temp = `<td>${score}</td>`;
      } else if (this.currentInning === i && (this.battingTeam === 'home' || team === 'visitor')) {
        temp = `<td class="${cssClass}">${score}</td>`;
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
      outsHtml += `Outs: ${new Array(this.inningTally.outs).fill('???').join(' ')}`;
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
    wrapper.setAttribute('class', 'scorebox box');
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
