import { addStyles, numberToOrdinal } from '../../services/Utils/Utils.js';

class Score extends HTMLElement {
  constructor() {
    super();

    let styles = `
    .score-wrapper {
      display: grid;
      grid-template-columns: 15% 20% 30% 20% 15%;
      width: 100%;
      margin: 5px auto;
      padding: 5px;
      box-sizing: border-box;
      background: var(--primary);

      .score-team-details {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr 10%;
        align-items: center;

        .score-team-record {
          font-size: 0.5em;
          color: var(--tertiary);
        }
      }

      .score-digits {
        font-size: 5em;
        color: var(--secondary);
        justify-items: center;

        &[data-leading="true"] {
          color: var(--highlight);
        }
      }

      .score-innings-outs {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 30% 1fr;
        align-items: start;

        .score-inning {
          font-size: 1.25em;
          font-weight: bold;
        }
      }
    }

    @media screen and (min-width: 640px) {
      .score-wrapper {
        grid-template-columns: 10% 30% 20% 30% 10%;
        padding: 10px;

        .score-team-details {
          display: grid;
          grid-template-columns: 1fr;
          grid-template-rows: 1fr 10%;
          align-items: center;
        }

        .score-innings-outs {
        }
      }
    }
    `;

    addStyles(styles, 'db-score');
  }

  removeEventListeners = () => {
    document.removeEventListener('scoreboard:update', this.updateScoreboard);
  }

  connectedCallback() {
    this.removeEventListeners();

    this.wrapper = document.createElement('section');
    this.wrapper.setAttribute('class', 'score-wrapper');

    this.appendChild(this.wrapper);

    document.addEventListener('scoreboard:update', this.updateScoreboard);
  }

  getIsLeading = (a, b) => {
    return a > b ? 'data-leading="true"' : '';
  }

  updateUI = (inning, visitor, home) => {

    let html = `
      <section class="score-team-details score-team-visitor">
        <db-team-logo name="${visitor.team.name}" primaryColor="${visitor.team.colors.primary}" secondaryColor="${visitor.team.colors.secondary}"></db-team-logo>
        <div class="score-team-record">0-0</div>
      </section>
      <section class="score-digits" ${this.getIsLeading(visitor.runs, home.runs)}>${visitor.runs}</section>
      <section class="score-innings-outs">
        <div class="score-inning">${inning}</div>
        <db-outs></db-outs>
      </section>
      <section class="score-digits" ${this.getIsLeading(home.runs, visitor.runs)}>${home.runs}</section>
      <section class="score-team-details score-team-home">
        <db-team-logo name="${home.team.name}" primaryColor="${home.team.colors.primary}" secondaryColor="${home.team.colors.secondary}"></db-team-logo>
        <div class="score-team-record">0-0</div>
      </section>
    `;

    this.wrapper.innerHTML = html;
  }

  updateScoreboard = ({ detail }) => {
    let { currentInning, battingTeam, home, visitor } = detail;
    let inningStatus = battingTeam === 'visitor' ? 'TOP' : 'BOT'; // we don't have a mid because this is ALL GAS NO BRAKES

    this.updateUI(`${inningStatus} ${currentInning + 1}`, visitor, home);
  }
}

export const score = () => customElements.define('db-score', Score);
