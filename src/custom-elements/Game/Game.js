import League from '../../models/League.js';
import GameEngine from '../../services/GameEngine/GameEngine.js';
import { addStyles } from '../../services/Utils/Utils.js';

class Game extends HTMLElement {
  constructor() {
    super();

    let styles = `
      db-game {
        display: flex;
        align-items: center;
        box-sizing: border-box;
        width: 100vw;
        height: 100vh;
        padding: 0;
        background: #a0c526;
        background: radial-gradient(circle, #a0c526 9%, #4a6717 100%);
      }

      .game {
        margin: 0 auto;
        width: 100vw;
        box-sizing: border-box;
        text-align: center;
        background: var(--outline);
      }

      @media screen and (min-width: 768px) {
        db-game {
          padding: 4px;
        }
      
        .game {
          width: 75vw;
          padding: 5px;
        }
      }
      
      @media screen and (min-width: 1024px) {
        .game {
          width: 55vw;
        }
      }
    `;

    addStyles(styles, 'db-game');

    let l = new League(); // just trying this bad boy out
    localStorage.setItem('league', JSON.stringify(l));
    
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
