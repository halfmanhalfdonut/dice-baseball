import teamGenerator from '../../services/TeamGenerator/TeamGenerator.js';

class Game extends HTMLElement {
  constructor() {
    super();
    
    this.GAME_VERSION = '2.0';

    const version = localStorage.getItem('version');
    if (version !== this.GAME_VERSION) {
      localStorage.removeItem('teams');
    }

    const totalTeams = 10;

    if (!localStorage.getItem('teams')) {
      console.log('Generating Teams');
      const teams = [];

      for (let i = 0; i < totalTeams; i++) {
        teams.push(teamGenerator.generateTeam());
      }

      localStorage.setItem('teams', JSON.stringify(teams));
    }

    localStorage.setItem('version', this.GAME_VERSION);
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
