class Controls extends HTMLElement {
  constructor() {
    super();

    this.SIMULATED_ROLLS = 1;
    this.USER_ROLLS = 7;
    this.numberOfRolls = this.USER_ROLLS;
    this.isRolling = false;
    this.isSimulating = false;
    this.simulationInterval;
    this.counter = 0;
    this.diceMapping = [ null, '⚀', '⚁', '⚂', '⚃', '⚄', '⚅', ];
  }

  removeEventListeners = () => {
    this.button?.removeEventListener('pointerup', this.handleRoll);
    this.simulateButton?.removeEventListener('pointerup', this.handleSimulate);
    this.newGameButton?.removeEventListener('pointerup', this.handleNewGame);
    document.removeEventListener('game:over', this.handleGameOver);
  }

  rollDice = () => {
    this.counter++;

    const lowValue = 1;
    const highValue = 6;
    const one = ~~(Math.random() * highValue) + lowValue;
    const two = ~~(Math.random() * highValue) + lowValue;

    this.tray.innerHTML = `${this.diceMapping[one]} ${this.diceMapping[two]}`;

    if (this.counter === this.numberOfRolls) {
      document.dispatchEvent(new CustomEvent('dice:roll', {
        detail: {
          roll: `${Math.min(one, two)}:${Math.max(one, two)}`
        }
      }));

      // reset counter
      this.counter = 0;
      this.isRolling = false;
    }
  }

  handleNewGame = () => {
    document.dispatchEvent(new CustomEvent('game:new'));
    this.initializeUI();
  }

  handleRoll = () => {
    if (!this.isRolling && !this.isSimulating) {
      this.isRolling = true;
      this.numberOfRolls = this.USER_ROLLS;
      for (let i = 0; i < this.numberOfRolls; i++) {
        setTimeout(this.rollDice, 250 * i);
      }
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
      this.numberOfRolls = this.SIMULATED_ROLLS;
      this.simulationInterval = setInterval(() => {
        this.rollDice();
      }, 750);
      this.simulateButton.innerHTML = '🤖 &nbsp; Stop Auto-Roll';
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
    this.innerHTML = `<div class="game-over">GAME OVER</div>`;
    const button = document.createElement('button');
    button.setAttribute('class', 'pitch');
    button.innerHTML = '⚾ &nbsp; New Game';
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
    button.innerHTML = '⚾ &nbsp; Batter up!';
    button.addEventListener('pointerup', this.handleRoll);
    this.button = button;

    const simulateButton = document.createElement('button');
    simulateButton.setAttribute('class', 'button simulate');
    simulateButton.innerHTML = '🤖 &nbsp; Auto-Roll';
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
