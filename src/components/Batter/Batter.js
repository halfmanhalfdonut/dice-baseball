import { standard } from '../../data/standard.js';

class Batter extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
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
      div.setAttribute('class', 'dice-roll');
      div.innerHTML = `<span class="dice">${entry.dice}</span> ${entry.description}`;

      currentWrapper.appendChild(div);
    }, '');

    wrappers.forEach(wrapper => {
      this.appendChild(wrapper);
    });
  }
}

export const batter = () => customElements.define('db-batter', Batter);
