class Field extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
      3 2 1
    `;
  }
}

export const field = () => customElements.define('db-field', Field);
