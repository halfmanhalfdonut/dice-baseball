import { standard } from '../../data/standard.js';

class Batter extends HTMLElement {
  constructor() {
    super();

    this.currentRoll;
  }

  removeEventListeners = () => {
    document.removeEventListener('dice:roll', this.handleDiceRoll);
  }

  updateUI = () => {
    document.getElementById(this.currentRoll)?.classList?.toggle('active-roll');
  }

  handleDiceRoll = ({ detail }) => {
    const { roll } = detail;
    
    this.updateUI();
    this.currentRoll = `dice-${roll}`;
    this.updateUI();

    document.dispatchEvent(new CustomEvent('dice:roll:batter', {
      detail: {
        result: standard[roll]
      }
    }));
  }

  connectedCallback() {
    this.removeEventListeners();

    let wrappers = [];
    let currentWrapper = null;

    Object.keys(standard).map((key, index) => {
      const entry = standard[key];

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

    wrappers.forEach(wrapper => {
      this.appendChild(wrapper);
    });

    document.addEventListener('dice:roll', this.handleDiceRoll);
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }
}

export const batter = () => customElements.define('db-batter', Batter);
