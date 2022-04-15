class Outs extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
      0 1 2
    `;
  }
}

export const outs = () => customElements.define('db-outs', Outs);
