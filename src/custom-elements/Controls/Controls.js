class Controls extends HTMLElement {
  constructor() {
    super();

    this.numberOfRolls = 7;
    this.isRolling = false;
    this.counter = 0;
    this.diceMapping = [ null, '⚀', '⚁', '⚂', '⚃', '⚄', '⚅', ];
  }

  removeEventListeners = () => {
    this.button?.removeEventListener('pointerup', this.handleRoll);
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
  }

  handleRoll = () => {
    if (!this.isRolling) {
      this.isRolling = true;
      for (let i = 0; i < this.numberOfRolls; i++) {
        setTimeout(this.rollDice, 250 * i);
      }
    }
  }

  handleGameOver = () => {
    this.innerHTML = `<div class="game-over">GAME OVER</div>`;
    const button = document.createElement('button');
    button.setAttribute('class', 'pitch');
    button.innerHTML = '⚾ &nbsp; New Game';
    button.addEventListener('pointerup', this.handleNewGame);
    this.newGameButton = button;

    this.appendChild(button);
  }

  connectedCallback() {
    this.removeEventListeners();
    
    const wrapper = document.createElement('section');
    wrapper.setAttribute('class', 'controls box');

    const button = document.createElement('button');
    button.setAttribute('class', 'pitch');
    button.innerHTML = '⚾ &nbsp; Batter up!';
    button.addEventListener('pointerup', this.handleRoll);
    this.button = button;

    const tray = document.createElement('div');
    tray.setAttribute('class', 'tray');
    tray.innerHTML = '&nbsp;';

    this.tray = tray;
    
    wrapper.appendChild(tray);
    wrapper.appendChild(button);

    this.appendChild(wrapper);

    document.addEventListener('game:over', this.handleGameOver);
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }
}

export const controls = () => customElements.define('db-controls', Controls);
