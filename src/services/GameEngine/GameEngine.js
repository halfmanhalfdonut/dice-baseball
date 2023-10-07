import TeamGenerator from '../TeamGenerator/TeamGenerator.js';
import * as Utils from '../Utils/Utils.js';

const GameEngine = {
  VERSION: '2.1',
  TOTAL_TEAMS: 30,

  state: {},

  setup: () => {
    console.log('Setting up game engine');
    let version = localStorage.getItem('version');
    if (version !== GameEngine.VERSION) {
      localStorage.removeItem('teams');
    }

    if (!localStorage.getItem('teams')) {
      let teams = [];

      for (let i = 0; i < GameEngine.TOTAL_TEAMS; i++) {
        teams.push(TeamGenerator.generateTeam());
      }

      localStorage.setItem('teams', JSON.stringify(teams));
    }

    localStorage.setItem('version', GameEngine.VERSION);

    document.addEventListener('dice:roll:batter', GameEngine.handleBatter);
    document.addEventListener('game:simulate', GameEngine.handleSimulate);
    document.addEventListener('game:new', GameEngine.handleNewGame);
    document.addEventListener('game:loaded', GameEngine.initialize);
  },

  initialize: () => {
    let innings = [];
    for (let i = 0; i < 9; i++) {
      innings.push({ home: 0, visitor: 0 });
    }

    let initialTeam = {
      runs: 0,
      hits: 0,
      batter: 0,
    };

    GameEngine.state = {
      batterTimeout: 1000,
      isGameOver: false,
      innings: innings,
      currentInning: 0,
      battingTeam: 'visitor',
      visitor: Object.assign({}, initialTeam),
      home: Object.assign({}, initialTeam)
    };

    GameEngine.setTeams();
    GameEngine.resetInningTally();
    GameEngine.dispatchTeams();
    GameEngine.dispatchScoreboard();
    GameEngine.dispatchOuts();
    GameEngine.dispatchBatter();
  },

  handleNewGame: () => {
    GameEngine.initialize();
  },

  setTeams: () => {
    let teams = JSON.parse(localStorage.getItem('teams'));
    let visitorIndex = Utils.random(teams.length);
    let homeIndex = visitorIndex;

    while (homeIndex === visitorIndex) {
      homeIndex = Utils.random(teams.length);
    }

    GameEngine.state.visitor.team = teams[visitorIndex];
    GameEngine.state.home.team = teams[homeIndex];
  },

  dispatchTeams: () => {
    document.dispatchEvent(new CustomEvent('teams:update', {
      detail: {
        home: GameEngine.state.home,
        visitor: GameEngine.state.visitor,
      }
    }));
  },

  dispatchScoreboard: () => {
    document.dispatchEvent(new CustomEvent('scoreboard:update', {
      detail: {
        home: GameEngine.state.home,
        visitor: GameEngine.state.visitor,
        currentInning: GameEngine.state.currentInning,
        battingTeam: GameEngine.state.battingTeam,
        innings: GameEngine.state.innings
      }
    }));
  },

  dispatchOuts: () => {
    document.dispatchEvent(new CustomEvent('outs:update', {
      detail: {
        outs: GameEngine.state.inningTally.outs
      }
    }));
  },

  dispatchBatter: () => {
    let battingTeam = GameEngine.state[GameEngine.state.battingTeam];
    let roster = battingTeam.team.roster;

    document.dispatchEvent(new CustomEvent('batter:change', {
      detail: {
        batter: roster[battingTeam.batter],
        battingTeam: battingTeam.team
      }
    }));
  },

  removeEventListeners: () => {
    document.removeEventListener('dice:roll:batter', GameEngine.handleBatter);
    document.removeEventListener('game:simulate', GameEngine.handleSimulate);
    document.removeEventListener('game:new', GameEngine.handleNewGame);
    document.removeEventListener('game:loaded', GameEngine.initialize);
  },

  resetInningTally: () => {
    GameEngine.state.inningTally = {
      visitor: 0,
      home: 0,
      outs: 0,
      bases: ['','','']
    };
  },

  handleSwitchSides: () => {
    // Is this game over or what?
    if (GameEngine.state.currentInning >= 8 && GameEngine.state.home.runs > GameEngine.state.visitor.runs) {
      // Game over
      GameEngine.state.isGameOver = true;
    } else if (GameEngine.state.currentInning >= 8 && GameEngine.state.visitor.runs > GameEngine.state.home.runs) {
      if (GameEngine.state.battingTeam === 'home') {
        GameEngine.state.isGameOver = true;
      }
    }

    if (GameEngine.state.battingTeam === 'visitor') {
      GameEngine.state.inningTally.outs = 0;
      GameEngine.state.inningTally.bases = ['','',''];
    } else {
      GameEngine.resetInningTally();
      GameEngine.state.currentInning++;
    }

    GameEngine.state.battingTeam = GameEngine.state.battingTeam === 'visitor' ? 'home' : 'visitor';
    GameEngine.state.inningTally.outs = 0;

    if (!GameEngine.state.isGameOver) {
      // Extra innings?
      if (!GameEngine.state.innings[GameEngine.state.currentInning]) {
        GameEngine.state.innings[GameEngine.state.currentInning] = {
          home: 0,
          visitor: 0
        };
      }
  
      document.dispatchEvent(new CustomEvent('dice:switch'));
    } else {
      document.dispatchEvent(new CustomEvent('game:over'));
    }
  },

  handleRuns: runs => {
    GameEngine.state.innings[GameEngine.state.currentInning][GameEngine.state.battingTeam] += runs;
    GameEngine.state.inningTally[GameEngine.state.battingTeam] += runs;
    GameEngine.state[GameEngine.state.battingTeam].runs += runs;
  },

  handleBases: (bases, outs, isSacrifice, isWalk) => {
    if (bases > 0) {
      if (isWalk) {
        let baseCounter = 0;
        let hasRunnerNextBase = GameEngine.state.inningTally.bases[baseCounter] === 'x';
        while (hasRunnerNextBase) {
          baseCounter++;
          hasRunnerNextBase = GameEngine.state.inningTally.bases[baseCounter] === 'x';
        }

        for (let i = 0; i < baseCounter + 1; i++) {
          GameEngine.state.inningTally.bases[i] = 'x';
        }
      } else {
        GameEngine.state.inningTally.bases.splice(0, 0, ...(new Array(bases).fill('')));

        if (!isSacrifice) {
          GameEngine.state.inningTally.bases[bases - 1] = 'x';
        }
      }

      let advances = GameEngine.state.inningTally.bases.splice(3);
      let runs = advances.reduce((runners, base) => {
        if (base === 'x') {
          runners++;
        }

        return runners;
      }, 0);

      GameEngine.handleRuns(runs);
    } else {
      // double play?
      if (outs > 1) {
        let currentBaserunners = GameEngine.state.inningTally.bases.reduce((runners, base, index) => {
          if (base === 'x') {
            runners.push(index);
          }

          return runners;
        }, []);

        let removeIndex = currentBaserunners.length > 1 ? Utils.random(currentBaserunners.length) : 0;
        GameEngine.state.inningTally.bases[removeIndex] = ''; // this guy is out
      }
    }

    document.dispatchEvent(new CustomEvent('dice:bases', {
      detail: {
        bases: GameEngine.state.inningTally.bases
      }
    }));
  },

  handleOuts: outs => {
    // can't double play when no one else is on base
    if (outs > 1) {
      let totalCurrentBaserunners = GameEngine.state.inningTally.bases.reduce((total, base) => {
        if (base === 'x') {
          total += 1;
        }

        return total;
      }, 0);

      if (totalCurrentBaserunners === 0) {
        outs = 1;
      }
    }

    GameEngine.state.inningTally.outs += outs;
  },

  updateBatter: () => {
    if (GameEngine.state[GameEngine.state.battingTeam].batter === 8) {
      GameEngine.state[GameEngine.state.battingTeam].batter = 0;
    } else {
      GameEngine.state[GameEngine.state.battingTeam].batter++;
    }
  },

  handleBatter: ({ detail }) => {
    let { result } = detail;
    let { outs, bases, hits, description } = result;
    let isSacrifice = description.indexOf('Sacrifice') > -1;
    let isWalk = description.indexOf('Walk') > -1;
    
    GameEngine.handleOuts(outs);
    GameEngine.updateBatter();

    if (GameEngine.state.inningTally.outs < 3) {
      GameEngine.handleBases(bases, outs, isSacrifice, isWalk);
      GameEngine.state[GameEngine.state.battingTeam].hits += hits;
    } else {
      GameEngine.handleSwitchSides();
    }

    GameEngine.dispatchScoreboard();
    GameEngine.dispatchOuts();

    setTimeout(() => {
      GameEngine.dispatchBatter();
    }, GameEngine.state.batterTimeout);
  },

  handleSimulate: ({ detail }) => {
    GameEngine.state.batterTimeout = detail.isSimulating ? 0 : 1000;
  },

};

export default GameEngine;
