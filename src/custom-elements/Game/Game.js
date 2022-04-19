import teamGenerator from '../../services/TeamGenerator/TeamGenerator.js';

class Game extends HTMLElement {
  constructor() {
    super();

    if (!localStorage.getItem('teams')) {
      console.log('Generating Teams');
      const teams = [];

      for (let i = 0; i < 10; i++) {
        teams.push(teamGenerator.generateTeam());
      }

      localStorage.setItem('teams', JSON.stringify(teams));
    }

    document.addEventListener('game:new', this.handleNewGame);
  }

  handleNewGame = () => {
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

  connectedCallback() {
    this.handleNewGame();
  }
}

export const game = () => customElements.define('db-game', Game);
