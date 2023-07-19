import { addStyles } from '../../services/Utils/Utils.js';

class Field extends HTMLElement {
  constructor() {
    super();

    let styles = `
    db-field {
      align-self: end;
    }

    .field {
      font-size: 2em;
      align-items: bottom;

      .base {
        position: relative;
        margin: 0 -5px;
      }

      .base:nth-child(even) {
        bottom: 0.5em;
      }

      &[data-first="runner"] {
        .base:last-child {
          color: var(--highlight);
        }
      }

      &[data-second="runner"] {
        .base:nth-child(even) {
          color: var(--highlight);
        }
      }

      &[data-third="runner"] {
        .base:first-child {
          color: var(--highlight);
        }
      }
    }
    `;

    addStyles(styles, 'db-field');
  }

  connectedCallback() {
    this.wrapper = document.createElement('section');
    this.wrapper.setAttribute('class', 'field');

    this.wrapper.innerHTML = '<span class="base">◆</span>'.repeat(3);

    this.appendChild(this.wrapper);

    document.addEventListener('dice:bases', this.handleRunners);
    document.addEventListener('dice:switch', this.handleReset);
    document.addEventListener('game:new', this.handleReset);
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  removeEventListeners = () => {
    document.removeEventListener('dice:bases', this.handleRunners);
    document.removeEventListener('dice:switch', this.handleReset);
    document.removeEventListener('game:new', this.handleReset);
  }

  handleRunners = ({ detail }) => {
    const { bases } = detail;
    this.updateUI(bases);
  }

  handleReset = () => {
    this.updateUI(['', '', '']);
  }

  updateUI = bases => {
    console.log('Updating bases', bases);
    this.wrapper.setAttribute('data-first', bases[0] ? 'runner' : 'false');
    this.wrapper.setAttribute('data-second', bases[1] ? 'runner' : 'false');
    this.wrapper.setAttribute('data-third', bases[2] ? 'runner' : 'false');

    this.wrapper.setAttribute('data-updated', true);
  }  
}

export const field = () => customElements.define('db-field', Field);
