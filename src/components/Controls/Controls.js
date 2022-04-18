class Controls extends HTMLElement {
  constructor() {
    super();

    this.isRolling = false;
    this.counter = 0;
    this.diceMapping = [ null, '⚀', '⚁', '⚂', '⚃', '⚄', '⚅', ];
  }

  removeEventListeners = () => {
    this.button?.removeEventListener('pointerup', this.handleRoll);
    document.removeEventListener('game:over', this.handleGameOver);
  }

  rollDice = () => {
    this.counter++;

    const lowValue = 1;
    const highValue = 6;
    const one = ~~(Math.random() * highValue) + lowValue;
    const two = ~~(Math.random() * highValue) + lowValue;

    this.tray.innerHTML = `${this.diceMapping[one]} ${this.diceMapping[two]}`;

    if (this.counter === 10) {
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

  handleRoll = () => {
    if (!this.isRolling) {
      this.isRolling = true;
      for (let i = 0; i < 10; i++) {
        setTimeout(this.rollDice, 250 * i);
      }
    }
  }

  handleGameOver = () => {
    this.innerHTML = `Game over!`;
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
