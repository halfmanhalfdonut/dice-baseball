class Bases extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
      3 2 1
    `;
  }
}

export const bases = () => customElements.define('db-bases', Bases);
