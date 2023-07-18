import { addStyles } from '../../services/Utils/Utils.js';

class Outs extends HTMLElement {
  constructor() {
    super();

    let styles = `
      .outs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        width: 40px;
        margin: 0 auto;
        line-height: 1em;

        .ball-outs {
          color: var(--secondary);
          font-size: 24px;
        }
      }

      .outs[data-outs="1"] {
        .ball-outs:first-child {
          color: var(--highlight);
        }
      }

      .outs[data-outs="2"] {
        .ball-outs {
          color: var(--highlight);
        }
      }
    `;

    addStyles(styles, 'db-outs');
  }

  connectedCallback() {
    this.removeEventListeners();

    this.wrapper = document.createElement('section');
    this.wrapper.setAttribute('class', 'outs');
    this.wrapper.setAttribute('data-outs', 0);
    this.wrapper.innerHTML = `<span class="ball ball-outs">⏺</span><span class="ball ball-outs">⏺</span>`;

    this.appendChild(this.wrapper);

    document.addEventListener('outs:update', this.updateOuts);
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  removeEventListeners() {
    document.removeEventListener('outs:update', this.updateOuts);
  }

  updateOuts = ({ detail }) => {
    const { outs } = detail;

    this.wrapper.setAttribute('data-outs', outs);
  }
}

export const outs = () => customElements.define('db-outs', Outs);
