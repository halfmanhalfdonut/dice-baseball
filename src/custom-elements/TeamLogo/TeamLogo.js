import { addStyles } from '../../services/Utils/Utils.js';

class TeamLogo extends HTMLElement {
  static get observedAttributes() {
    return [
      'name',
      'primaryColor',
      'secondaryColor',
    ];
  }

  constructor() {
    super();

    let styles = `
    .team-logo {
      display: grid;
      grid-template-columns: repeat(6, 6px);
      grid-template-rows: 10px;
      font-size: 36px;
      font-weight: bold;
      font-family: monospace;
      margin: 2px;
      left: -5px;
    }

    .team-logo-first {
      grid-column: 1 / 4;
    }
    
    .team-logo-second {
      grid-column: 2 / 7;
    }

    @media screen and (min-width: 1024px) {
      .team-logo {
        grid-template-columns: repeat(6, 8px);
        grid-template-rows: 16px;
        font-size: 48px;
        margin: 5px;
      }
    }
    `;

    addStyles(styles, 'db-team-logo');
  }

  connectedCallback() {
    this.updateUI();
  }

  attributeChangedCallback() {
    this.updateUI();
  }

  updateUI() {
    let name = this.getAttribute('name') ?? 'No Team';
    let primaryColor = this.getAttribute('primaryColor') ?? '#123456';
    let secondaryColor = this.getAttribute('secondaryColor') ?? '#654321';
    
    const [ city, ...nickname ] = name.split(' ');
    let firstLetter = city.charAt(0);
    let secondLetter = nickname[0].charAt(0);

    let html = `<div class="team-logo">
      <span class="team-logo-first" style="color: ${primaryColor}">${firstLetter}</span>
      <span class="team-logo-second" style="color: ${secondaryColor}">${secondLetter}</span>
    </div>`;

    this.innerHTML = html;
  }
}

export const teamLogo = () => customElements.define('db-team-logo', TeamLogo);
