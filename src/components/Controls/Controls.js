class Controls extends HTMLElement {
  constructor() {
    super();

    this.counter = 0;
    this.diceMapping = [ null, '⚀', '⚁', '⚂', '⚃', '⚄', '⚅', ];
  }

  removeListeners = () => {
    this.button?.removeEventListener('pointerup', this.handleRoll);
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
    }
  }

  handleRoll = () => {
    for (let i = 0; i < 10; i++) {
      setTimeout(this.rollDice, 250 * i);
    }
  }

  connectedCallback() {
    this.removeListeners();
    
    const wrapper = document.createElement('section');
    wrapper.setAttribute('class', 'controls');

    const button = document.createElement('button');
    button.setAttribute('class', 'pitch');
    button.innerText = '⚾ Roll';
    button.addEventListener('pointerup', this.handleRoll);

    const tray = document.createElement('div');
    tray.setAttribute('class', 'tray');
    tray.innerHTML = '&nbsp;';

    this.tray = tray;
    
    wrapper.appendChild(tray);
    wrapper.appendChild(button);

    this.appendChild(wrapper);
  }
}

export const controls = () => customElements.define('db-controls', Controls);
