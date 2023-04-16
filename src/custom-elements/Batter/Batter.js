class Batter extends HTMLElement {
  constructor() {
    super();

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
    console.log('Removing event listeners');
    this.removeEventListeners();
  }
}

export const batter = () => customElements.define('db-batter', Batter);
