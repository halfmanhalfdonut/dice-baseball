import { addStyles } from '../../services/Utils/Utils.js';

class Scoreboard extends HTMLElement {
  constructor() {
    super();

    let styles = `
      .team-name {
        text-transform: capitalize;
        text-align: left;
      }
      
      .scoreboard {
        margin: 0 auto;
        text-align: center;
        font-size: 0.8em;
      }

      .scoreboard-table {
        box-sizing: border-box;
        width: 100%;
        text-align: center;
      }

      .current-inning {
        color: var(--highlight);
      }
    `;
    
    addStyles(styles, 'db-scoreboard');
  }

  removeEventListeners = () => {
    document.removeEventListener('scoreboard:update', this.updateScoreboard);
  }

  getTeamRow = ({ team, totalInnings, currentInning, innings, battingTeam }) => {
    let html = `<tr><td class="team-name">${this[team].team.name.split(' ').at(-1)}</td>`;
    
    for (let i = 0; i < totalInnings; i++) {
      const cssClass = (team === battingTeam && currentInning === i) ? 'current-inning' : '';
      const score = innings[i]?.[team];
      let temp = '<td>&nbsp;</td>';

      if (currentInning > i) {
        temp = `<td>${score}</td>`;
      } else if (currentInning === i && (battingTeam === 'home' || team === 'visitor')) {
        temp = `<td class="${cssClass}">${score}</td>`;
      }

      html += temp;
    }

    return html += `<td>${this[team].runs}</td><td>${this[team].hits}</td></tr>`;
  }

  updateScoreboard = ({ detail }) => {
    const { currentInning, battingTeam, innings, home, visitor } = detail;

    this.home = home;
    this.visitor = visitor;
    const totalInnings = Math.max(innings.length, 9);

    let tableHtml = `<table class="scoreboard-table"><thead><tr><th>&nbsp;</th>`;

    for (let i = 0; i < totalInnings; i++) {
      tableHtml += `<th>${i + 1}</th>`;
    }

    tableHtml += `<th>R</th><th>H</th></tr></thead>`;

    tableHtml += `<tbody>`;
    tableHtml += this.getTeamRow({
      team: 'visitor',
      totalInnings,
      battingTeam,
      currentInning,
      innings
    });
    tableHtml += this.getTeamRow({
      team: 'home',
      totalInnings,
      battingTeam,
      currentInning,
      innings
    });
    tableHtml += `</tbody></table>`;

    this.scoreboard.innerHTML = tableHtml;
  }

  connectedCallback() {
    this.removeEventListeners();

    const wrapper = document.createElement('section');
    wrapper.setAttribute('class', 'scoreboard');
    this.wrapper = wrapper;

    const scoreboard = document.createElement('section');
    scoreboard.setAttribute('class', 'scoreboard-wrapper');
    this.scoreboard = scoreboard;

    this.wrapper.appendChild(this.scoreboard);
    this.appendChild(wrapper);

    document.addEventListener('scoreboard:update', this.updateScoreboard);
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }
}

export const scoreboard = () => customElements.define('db-scoreboard', Scoreboard);
