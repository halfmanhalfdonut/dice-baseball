import GameEngine from '../../services/GameEngine/GameEngine.js';

class Game extends HTMLElement {
  constructor() {
    super();
    
    GameEngine.setup();
  }

  connectedCallback() {
    this.innerHTML = `
      <section class="game">
        <db-score></db-score>
        <db-scoreboard></db-scoreboard>
        <db-batter class="box"></db-batter>
        <db-controls></db-controls>
      </section>
    `;
  }
}

export const game = () => customElements.define('db-game', Game);
