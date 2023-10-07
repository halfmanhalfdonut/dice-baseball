import { addStyles } from '../../services/Utils/Utils.js';

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
        grid-template-rows: 30% 1fr 1fr;
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

    this.visitorDetails = document.createElement('db-team-details');
    this.visitorDetails.setAttribute('team', 'visitor');

    this.visitorScore = document.createElement('section');
    this.visitorScore.setAttribute('class', 'score-digits');
    this.visitorScore.setAttribute('data-leading', 'false');
    this.visitorScore.textContent = '0';

    this.statusWrapper = document.createElement('section');
    this.statusWrapper.setAttribute('class', 'score-innings-outs');

    this.statusInning = document.createElement('div');
    this.statusInning.setAttribute('class', 'score-inning');
    this.statusInning.textContent = 'PRE';

    this.statusWrapper.appendChild(this.statusInning);
    this.statusWrapper.appendChild(document.createElement('db-outs'));
    this.statusWrapper.appendChild(document.createElement('db-field'));

    this.homeScore = document.createElement('section');
    this.homeScore.setAttribute('class', 'score-digits');
    this.homeScore.setAttribute('data-leading', 'false');
    this.homeScore.textContent = '0';

    this.homeDetails = document.createElement('db-team-details');
    this.homeDetails.setAttribute('team', 'home');

    this.wrapper.appendChild(this.visitorDetails);
    this.wrapper.appendChild(this.visitorScore);
    this.wrapper.appendChild(this.statusWrapper);
    this.wrapper.appendChild(this.homeScore);
    this.wrapper.appendChild(this.homeDetails);

    this.appendChild(this.wrapper);

    document.addEventListener('scoreboard:update', this.updateScoreboard);
  }

  updateUI = (inning, visitor, home) => {
    this.visitorScore.setAttribute('class', `score-digits`);
    this.visitorScore.textContent = visitor.runs;

    this.statusInning.textContent = inning;

    this.homeScore.setAttribute('class', `score-digits`);
    this.homeScore.textContent = home.runs;

    this.homeScore.setAttribute('data-leading', home.runs > visitor.runs);
    this.visitorScore.setAttribute('data-leading', visitor.runs > home.runs);
  }

  updateScoreboard = ({ detail }) => {
    let { currentInning, battingTeam, home, visitor } = detail;
    let inningStatus = battingTeam === 'visitor' ? 'TOP' : 'BOT'; // we don't have a mid because this is ALL GAS NO BRAKES

    this.updateUI(`${inningStatus} ${currentInning + 1}`, visitor, home);
  }
}

export const score = () => customElements.define('db-score', Score);
