import GameEngine from '../../services/GameEngine/GameEngine.js';

class Game extends HTMLElement {
  constructor() {
    super();
    
    GameEngine.setup();
  }

  connectedCallback() {
    this.innerHTML = `
      <section class="game">
        <db-scorebox></db-scorebox>
        <db-batter class="box"></db-batter>
        <section class="field-controls box">
          <db-field></db-field>
          <db-controls></db-controls>
        </section>
      </section>
    `;
  }
}

export const game = () => customElements.define('db-game', Game);
