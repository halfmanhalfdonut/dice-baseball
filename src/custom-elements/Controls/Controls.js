import * as Utils from '../../services/Utils/Utils.js';

class Controls extends HTMLElement {
  constructor() {
    super();

    this.isRolling = false;
    this.isSimulating = false;
    this.simulationInterval;
    this.diceMapping = [ null, '⚀', '⚁', '⚂', '⚃', '⚄', '⚅', ];
  }

  removeEventListeners = () => {
    this.button?.removeEventListener('pointerup', this.handleRoll);
    this.simulateButton?.removeEventListener('pointerup', this.handleSimulate);
    this.newGameButton?.removeEventListener('pointerup', this.handleNewGame);
    document.removeEventListener('game:over', this.handleGameOver);
  }

  rollDice = () => {
    const lowValue = 1;
    const highValue = 6;
    const one = Utils.random(highValue) + lowValue;
    const two = Utils.random(highValue) + lowValue;

    this.tray.innerHTML = `${this.diceMapping[one]} ${this.diceMapping[two]}`;

    document.dispatchEvent(new CustomEvent('dice:roll', {
      detail: {
        roll: `${Math.min(one, two)}:${Math.max(one, two)}`
      }
    }));

    this.isRolling = false;
  }

  handleNewGame = () => {
    document.dispatchEvent(new CustomEvent('game:new'));
    this.initializeUI();
  }

  handleRoll = () => {
    if (!this.isRolling && !this.isSimulating) {
      this.isRolling = true;
      this.rollDice();
    }
  }

  handleSimulate = () => {
    if (this.isSimulating) {
      this.isSimulating = false;
      clearInterval(this.simulationInterval);
      this.simulateButton.innerHTML = '🤖 &nbsp; Auto-Roll';
      document.dispatchEvent(new CustomEvent('game:simulate', {
        detail: {
          isSimulating: false
        }
      }));
    } else {
      this.isSimulating = true;
      this.simulationInterval = setInterval(() => {
        this.rollDice();
      }, 750);
      this.simulateButton.innerHTML = 'Stop Auto-Roll';
      document.dispatchEvent(new CustomEvent('game:simulate', {
        detail: {
          isSimulating: true
        }
      }));
    }
  }

  handleGameOver = () => {
    clearInterval(this.simulationInterval);
    this.isSimulating = false;
    this.innerHTML = `<div class="game-over">GAME<br>OVER</div>`;
    const button = document.createElement('button');
    button.setAttribute('class', 'button pitch');
    button.innerHTML = 'New Game';
    button.addEventListener('pointerup', this.handleNewGame);
    this.newGameButton = button;

    this.appendChild(button);
  }

  initializeUI = () => {
    this.innerHTML = '';

    const wrapper = document.createElement('section');
    wrapper.setAttribute('class', 'controls box');

    const button = document.createElement('button');
    button.setAttribute('class', 'button pitch');
    button.innerHTML = 'Batter up';
    button.addEventListener('pointerup', this.handleRoll);
    this.button = button;

    const simulateButton = document.createElement('button');
    simulateButton.setAttribute('class', 'button simulate');
    simulateButton.innerHTML = 'Auto-Roll';
    simulateButton.addEventListener('pointerup', this.handleSimulate);
    this.simulateButton = simulateButton;

    const tray = document.createElement('div');
    tray.setAttribute('class', 'tray');
    tray.innerHTML = '&nbsp;';

    this.tray = tray;
    
    wrapper.appendChild(tray);
    wrapper.appendChild(button);
    wrapper.appendChild(simulateButton);

    this.appendChild(wrapper);
  }

  connectedCallback() {
    this.removeEventListeners();
    
    this.initializeUI();

    document.addEventListener('game:over', this.handleGameOver);
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }
}

export const controls = () => customElements.define('db-controls', Controls);
