import { addStyles } from '../../services/Utils/Utils.js';

class Batter extends HTMLElement {
  constructor() {
    super();

    let styles = `
    .batter-details {
      display: flex;
      justify-content: space-between;
      font-size: 0.75em;
    }
    
    .batter-name {
      font-weight: bold;
    }

    .dice-columns {
      display: flex;
      box-sizing: border-box;
    }
    
    .dice-column {
      width: 33%;
    }
    
    .dice-roll {
      font-size: 0.7em;
      text-align: left;
      text-transform: uppercase;
    }
    
    .dice {
      font-size: 1.5em;
      line-height: 1em;
      position: relative;
      top: 1px;
    }
    
    .active-roll {
      color: var(--highlight);
    }

    .game-over {
      font-size: 5em;
      line-height: 1em;
      margin: 2px auto;
      padding: 0 25px 25px;
      text-align: center;
      box-sizing: border-box;
    }

    .game-over {
      text-transform: uppercase;
    }

    @media screen and (min-width: 768px) {
      .dice-roll {
        font-size: 1.1em;
      }
      
      .game-over {
        font-size: 3.5em;
      }
    }
    `;

    addStyles(styles, 'db-batter');

    this.currentRoll;
    this.currentBatter;
    this.battingTeam;
  }

  removeEventListeners = () => {
    document.removeEventListener('dice:roll', this.handleDiceRoll);
    document.removeEventListener('batter:change', this.handleBatterChange);
  }

  updateCurrentRoll = () => {
    document.getElementById(this.currentRoll)?.classList?.toggle('active-roll');
  }

  getStars = () => {
    switch (this.currentBatter.batterType) {
      case 'homer':
        return '★★★★★';
      case 'slugger':
        return '★★★★☆';
      case 'average':
        return '★★★☆☆';
      case 'weak':
        return '★★☆☆☆';
      case 'blind':
        return '★☆☆☆☆';
    }
  }

  updateUI = () => {
    let outerWrapper = document.createElement('section');
    outerWrapper.setAttribute('class', 'batter-up');
    
    if (this.currentBatter) {
      outerWrapper.innerHTML = `<header class="batter-details">
        <span class="batter-name">${this.currentBatter?.name} ${this.getStars()}</span>&nbsp;
        <span class="batter-team">${this.battingTeam.name}</span>
      </header>`;
      let wrappers = [];
      let currentWrapper = null;
      let { stats } = this.currentBatter;

      Object.keys(stats).map((key, index) => {
        const entry = stats[key];

        if (index === 0 || index % 7 === 0) {
          currentWrapper = document.createElement('div');
          currentWrapper.setAttribute('class', 'dice-column');
          wrappers.push(currentWrapper);
        }

        const div = document.createElement('div');
        div.setAttribute('id', `dice-${key}`);
        div.setAttribute('class', 'dice-roll');
        div.innerHTML = `<span class="dice">${entry.dice}</span> ${entry.description}`;

        currentWrapper.appendChild(div);
      }, '');

      const columnWrapper = document.createElement('div');
      columnWrapper.setAttribute('class', 'dice-columns');

      wrappers.forEach(wrapper => {
        columnWrapper.appendChild(wrapper);
      });
      outerWrapper.appendChild(columnWrapper);
    }

    this.innerHTML = '';
    this.appendChild(outerWrapper);
  }

  handleDiceRoll = ({ detail }) => {
    const { roll } = detail;
    
    this.currentRoll = `dice-${roll}`;
    this.updateCurrentRoll();

    document.dispatchEvent(new CustomEvent('dice:roll:batter', {
      detail: {
        result: this.currentBatter.stats[roll]
      }
    }));
  }

  handleBatterChange = ({ detail }) => {
    this.currentBatter = detail.batter;
    this.battingTeam = detail.battingTeam;
    this.updateUI();
  }

  connectedCallback() {
    this.removeEventListeners();
    this.updateUI();

    document.addEventListener('dice:roll', this.handleDiceRoll);
    document.addEventListener('batter:change', this.handleBatterChange);
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }
}

export const batter = () => customElements.define('db-batter', Batter);
