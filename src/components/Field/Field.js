class Field extends HTMLElement {
  constructor() {
    super();
    this.bases = ['', '', ''];
  }

  removeEventListeners = () => {
    document.removeEventListener('dice:bases', this.handleRunners);
    document.removeEventListener('dice:switch', this.handleReset);
  }

  handleRunners = ({ detail }) => {
    const { bases } = detail;
    this.bases = bases.slice().reverse();
    this.updateUI();
  }

  handleReset = () => {
    this.bases = ['', '', ''];
    this.updateUI();
  }

  getCssClass = (base, index) => {
    let cssClass = '';

    if (base === 'x') {
      cssClass += ' baserunner';
    }
    
    if (index === 1) {
      cssClass += ' second-base';
    }

    return cssClass;
  }

  updateUI = () => {
    let html = `<section class="field">`;
    html += this.bases.reduce((memo, base, index) => {
      return `${memo}<span class="base${this.getCssClass(base, index)}">◈</span>`;
    }, ``);
    html += `</section>`;

    this.innerHTML = html;
  }

  connectedCallback() {
    document.addEventListener('dice:bases', this.handleRunners);
    document.addEventListener('dice:switch', this.handleReset);
    this.updateUI();
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }
}

export const field = () => customElements.define('db-field', Field);
