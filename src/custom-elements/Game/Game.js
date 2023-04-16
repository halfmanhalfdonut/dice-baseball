import teamGenerator from '../../services/TeamGenerator/TeamGenerator.js';

class Game extends HTMLElement {
  constructor() {
    super();
    
    this.GAME_VERSION = '2.0';

    const version = localStorage.getItem('version');
    if (version !== this.GAME_VERSION) {
      localStorage.removeItem('teams');
    }

    const totalTeams = 10;

    if (!localStorage.getItem('teams')) {
      console.log('Generating Teams');
      const teams = [];

      for (let i = 0; i < totalTeams; i++) {
        teams.push(teamGenerator.generateTeam());
      }

      localStorage.setItem('teams', JSON.stringify(teams));
    }

    localStorage.setItem('version', this.GAME_VERSION);
  }

  initializeNewGame = () => {
    this.batterTimeout = 1000;
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
      batter: 0,
    };

    this.home = {
      runs: 0,
      hits: 0,
      batter: 0,
    };

    this.setTeams();
    this.resetInningTally();
    this.dispatchScoreboard();
    this.dispatchOuts();
    this.dispatchBatter();
  }

  handleNewGame = () => {
    this.initializeNewGame();
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

  dispatchScoreboard = () => {
    document.dispatchEvent(new CustomEvent('scoreboard:update', {
      detail: {
        home: this.home,
        visitor: this.visitor,
        currentInning: this.currentInning,
        battingTeam: this.battingTeam,
        innings: this.innings
      }
    }));
  }

  dispatchOuts = () => {
    document.dispatchEvent(new CustomEvent('outs:update', {
      detail: {
        outs: this.inningTally.outs
      }
    }));
  }

  dispatchBatter = () => {
    const battingTeam = this[this.battingTeam];
    const roster = battingTeam.team.roster;

    document.dispatchEvent(new CustomEvent('batter:change', {
      detail: {
        batter: roster[battingTeam.batter],
        battingTeam: battingTeam.team
      }
    }));
  }

  removeEventListeners = () => {
    document.removeEventListener('dice:roll:batter', this.handleBatter);
    document.removeEventListener('game:simulate', this.handleSimulate);
    document.removeEventListener('game:new', this.handleNewGame);
    document.removeEventListener('game:loaded', this.initializeNewGame);
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

  updateBatter = () => {
    if (this[this.battingTeam].batter === 8) {
      this[this.battingTeam].batter = 0;
    } else {
      this[this.battingTeam].batter++;
    }
  }

  handleBatter = ({ detail }) => {
    const { result } = detail;
    const { outs, bases, hits, description } = result;
    const isSacrifice = description.indexOf('Sacrifice') > -1;
    const isWalk = description.indexOf('Walk') > -1;
    
    this.handleOuts(outs);
    this.updateBatter();

    if (this.inningTally.outs < 3) {
      this.handleBases(bases, outs, isSacrifice, isWalk);
      this[this.battingTeam].hits += hits;
    } else {
      this.handleSwitchSides();
    }

    this.dispatchScoreboard();
    this.dispatchOuts();

    setTimeout(() => {
      this.dispatchBatter();
    }, this.batterTimeout);
  }

  handleSimulate = ({ detail }) => {
    this.batterTimeout = detail.isSimulating ? 0 : 1000;
  }

  connectedCallback() {
    this.removeEventListeners();

    this.innerHTML = `
      <section class="game">
        <db-scorebox></db-scorebox>
        <db-batter class="box"></db-batter>
        <section class="field-controls box">
          <db-field></db-field>
          <db-controls></db-controls>
        </section>
      </section>
    `;

    document.addEventListener('dice:roll:batter', this.handleBatter);
    document.addEventListener('game:simulate', this.handleSimulate);
    document.addEventListener('game:new', this.handleNewGame);
    document.addEventListener('game:loaded', this.initializeNewGame);
  }
}

export const game = () => customElements.define('db-game', Game);
