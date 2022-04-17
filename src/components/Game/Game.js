class Game extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
      <db-scorebox></db-scorebox>
      <db-batter></db-batter>
      <db-field></db-field>
      <db-controls></db-controls>
    `;
  }
}

export const game = () => customElements.define('db-game', Game);
