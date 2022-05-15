class Scorebox extends HTMLElement {
  constructor() {
    super();
  }

  removeEventListeners = () => {
    document.removeEventListener('scoreboard:update', this.updateScoreboard);
    document.removeEventListener('outs:update', this.updateOuts);
  }

  getTeamLogo = team => {
    const { name, colors } = team;
    const [ city, ...nickname ] = name.split(' ');
    let firstLetter = city.charAt(0);
    let secondLetter = nickname[0].charAt(0);

    if (nickname.length > 1) {
      firstLetter = nickname[0].charAt(0);
      secondLetter = nickname[1].charAt(0);
    }

    return `<div class="team-logo">
      <span class="team-logo-first" style="color: ${colors.primary}">${firstLetter}</span>
      <span class="team-logo-second" style="color: ${colors.secondary}">${secondLetter}</span>
    </div>`;
  }

  getTeamRow = ({ team, totalInnings, currentInning, innings, battingTeam }) => {
    let html = `<tr><td class="team-name">${this.getTeamLogo(this[team].team)} ${this[team].team.name}</td>`;
    
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

  updateScoreboard = ({ detail}) => {
    const { currentInning, battingTeam, innings, home, visitor } = detail;

    this.home = home;
    this.visitor = visitor;
    const totalInnings = Math.max(innings.length, 9);

    let tableHtml = `<table class="scoreboard"><thead><tr><th>&nbsp;</th>`;

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

  updateOuts = ({ detail }) => {
    const { outs } = detail;

    if (outs === 0) {
      this.outs.innerHTML = `Outs: <span class="low-opacity">⚾</span>&nbsp;<span class="low-opacity">⚾</span>`;
    } else if (outs === 1) {
      this.outs.innerHTML = `Outs: ⚾&nbsp;<span class="low-opacity">⚾</span>`;
    } else if (outs === 2) {
      this.outs.innerHTML = `Outs: ⚾&nbsp;⚾`;
    }
  }

  connectedCallback() {
    this.removeEventListeners();

    const wrapper = document.createElement('section');
    wrapper.setAttribute('class', 'scorebox box');
    this.wrapper = wrapper;

    const scoreboard = document.createElement('section');
    scoreboard.setAttribute('class', 'scoreboard-wrapper');
    this.scoreboard = scoreboard;

    const outs = document.createElement('section');
    outs.setAttribute('class', 'outs');
    outs.innerHTML = `Outs: <span class="low-opacity">⚾</span><span class="low-opacity">⚾</span>`;
    this.outs = outs;

    this.wrapper.appendChild(this.scoreboard);
    this.wrapper.appendChild(this.outs);

    this.appendChild(wrapper);

    document.addEventListener('scoreboard:update', this.updateScoreboard);
    document.addEventListener('outs:update', this.updateOuts);
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }
}

export const scorebox = () => customElements.define('db-scorebox', Scorebox);
