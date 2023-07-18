import { addStyles } from '../../services/Utils/Utils.js';

class TeamLogo extends HTMLElement {
  constructor() {
    super();

    let styles = `
    .team-logo {
      display: block;
      position: relative;
      font-size: 36px;
      font-weight: bold;
      font-family: monospace;
      margin: 2px;
      left: -5px;
    }
    
    .team-logo-second {
      position: absolute;
      top: 10px;
      left: 22px;
    }

    @media screen and (min-width: 1024px) {
      .team-logo {
        font-size: 48px;
        margin: 5px;
      }
      
      .team-logo-second {
        top: 12px;
        left: 17px;
      }
    }
    `;

    addStyles(styles, 'db-team-logo');
  }

  connectedCallback() {
    let name = this.getAttribute('name');
    let primaryColor = this.getAttribute('primaryColor');
    let secondaryColor = this.getAttribute('secondaryColor');
    
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
