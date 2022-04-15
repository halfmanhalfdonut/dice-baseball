class Game extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
      <db-scorebox></db-scorebox>
      <db-batter></db-batter>
      <db-bases></db-bases>
      <db-outs></db-outs>
      <db-controls></db-controls>
    `;
  }
}

export const game = () => customElements.define('db-game', Game);
