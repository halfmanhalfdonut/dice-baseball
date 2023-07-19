import { addStyles } from '../../services/Utils/Utils.js';

class TeamDetails extends HTMLElement {
  constructor() {
    super();

    let styles = `
    db-team-details {
      display: grid;
    }
    
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

    @media screen and (min-width: 640px) {
      .score-team-details {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr 10%;
        align-items: center;
      }
    `;

    addStyles(styles, 'db-team-details');

    this.isHome = this.getAttribute('team') === 'home';
    this.visibleTeam = null;
  }

  connectedCallback() {
    this.removeEventListeners();

    this.wrapper = document.createElement('section');
    this.wrapper.setAttribute('class', 'score-team-details score-team-visitor');

    this.teamLogo = document.createElement('db-team-logo');

    this.teamRecord = document.createElement('div');
    this.teamRecord.setAttribute('class', 'score-team-record');
    this.teamRecord.textContent = '0-0';

    this.wrapper.appendChild(this.teamLogo);
    this.wrapper.appendChild(this.teamRecord);

    this.appendChild(this.wrapper);

    document.addEventListener('teams:update', this.handleTeamsUpdate);
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  removeEventListeners = () => {
    document.removeEventListener('teams:update', this.handleTeamsUpdate);
  }

  handleTeamsUpdate = ({ detail }) => {
    const { home, visitor } = detail;
    
    this.visibleTeam = this.isHome ? home.team : visitor.team;
    console.log('Teams update', this.isHome, this.visibleTeam);
    this.updateUI();
  }

  updateUI = () => {
    this.teamLogo.setAttribute('name', this.visibleTeam?.name);
    this.teamLogo.setAttribute('primaryColor', this.visibleTeam?.colors.primary);
    this.teamLogo.setAttribute('secondaryColor', this.visibleTeam?.colors.secondary);

    // update record when that's ready..
  }
}

export const teamDetails = () => customElements.define('db-team-details', TeamDetails);
