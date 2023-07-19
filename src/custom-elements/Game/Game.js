import GameEngine from '../../services/GameEngine/GameEngine.js';

class Game extends HTMLElement {
  constructor() {
    super();
    
    GameEngine.setup();
  }

  connectedCallback() {
    this.innerHTML = `
      <section class="game">
        <db-score class="box"></db-score>
        <db-scoreboard class="box"></db-scoreboard>
        <db-batter class="box"></db-batter>
        <db-controls class="box"></db-controls>
      </section>
    `;
  }
}

export const game = () => customElements.define('db-game', Game);
