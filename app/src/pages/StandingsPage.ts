import { LitElement, html, css } from 'lit';
import { ensureDefaultTeams } from '../services/Teams';
import { computeStandings, resetGameHistory, getGameHistory } from '../services/GameHistoryService';
import { winPct, gamesBehind, type TeamRecord } from '../models/GameRecord';
import type { Team } from '../models/Team';

type SortCol = 'team' | 'W' | 'L' | 'PCT' | 'GB';

export class StandingsPage extends LitElement {
  static styles = css`
    :host { display:block }
    h2 { margin:0 0 12px }
    .toolbar { display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin-bottom:12px }
    .toolbar select, .toolbar button { background:#222; color:#eee; border:1px solid #444; border-radius:4px; padding:4px 8px; cursor:pointer }
    .toolbar button:hover { background:#444; color:#fff }
    .btn-danger { border-color:#a33; color:#f88 }
    .btn-danger:hover { background:#522; color:#fcc }
    .division { margin-bottom:24px }
    .division-header { color:#aaa; font-weight:600; font-size:0.85rem; margin-bottom:6px; padding-bottom:4px; border-bottom:1px solid #333 }
    table { width:100%; border-collapse:collapse; font-size:0.85rem; margin-bottom:4px }
    td, th { border:1px solid #333; padding:5px 7px; text-align:right; white-space:nowrap }
    th { background:#1a1a1a; color:#aaa; font-weight:600; cursor:pointer; user-select:none }
    th:hover { color:#fff }
    th:first-child, td:first-child { text-align:left }
    tr:hover td { background:#1c1c1c }
    .leader td { font-weight:600 }
    .games-count { color:#888; font-size:0.82rem; margin-bottom:16px }
    .empty { padding:24px; text-align:center; color:#666 }
    .tab-bar { display:flex; gap:4px; margin-bottom:16px }
    .tab { padding:6px 14px; border-radius:6px 6px 0 0; border:1px solid #333; border-bottom:none; background:#1a1a1a; color:#aaa; cursor:pointer; font-size:0.85rem }
    .tab:hover { color:#eee }
    .tab.active { background:#222; color:#4cf; border-color:#4cf; border-bottom:1px solid #222 }
  `;

  static properties = {
    teams: { type: Array },
    standings: { type: Array },
    conferenceFilter: { type: String },
    gamesPlayed: { type: Number },
    view: { type: String },
  } as any;

  teams: Team[] = [];
  standings: TeamRecord[] = [];
  conferenceFilter = '';
  gamesPlayed = 0;
  view: 'division' | 'overall' = 'division';

  async connectedCallback() {
    super.connectedCallback();
    this.teams = await ensureDefaultTeams();
    this._refresh();
    window.addEventListener('hashchange', this._onHash);
  }

  disconnectedCallback() {
    window.removeEventListener('hashchange', this._onHash);
    super.disconnectedCallback();
  }

  _onHash = () => {
    if (window.location.hash === '#standings') this._refresh();
  };

  _refresh() {
    this.standings = computeStandings(this.teams);
    this.gamesPlayed = getGameHistory().length;
  }

  _grouped(): Map<string, TeamRecord[]> {
    const map = new Map<string, TeamRecord[]>();
    const divOrder = [
      'American – East', 'American – Central', 'American – West',
      'National – East', 'National – Central', 'National – West',
    ];
    for (const key of divOrder) {
      const [conf, div] = key.split(' – ');
      if (this.conferenceFilter && conf !== this.conferenceFilter) continue;
      const teams = this.standings
        .filter(t => t.conference === conf && t.division === div)
        .sort((a, b) => {
          const pctA = a.W + a.L === 0 ? 0 : a.W / (a.W + a.L);
          const pctB = b.W + b.L === 0 ? 0 : b.W / (b.W + b.L);
          return pctB - pctA || a.L - b.L;
        });
      if (teams.length) map.set(key, teams);
    }
    return map;
  }

  _overall(): TeamRecord[] {
    let list = this.standings;
    if (this.conferenceFilter) list = list.filter(t => t.conference === this.conferenceFilter);
    return [...list].sort((a, b) => {
      const pctA = a.W + a.L === 0 ? 0 : a.W / (a.W + a.L);
      const pctB = b.W + b.L === 0 ? 0 : b.W / (b.W + b.L);
      return pctB - pctA || a.L - b.L;
    });
  }

  _onReset() {
    if (!confirm('Clear all game history and standings?')) return;
    resetGameHistory();
    this._refresh();
  }

  _renderDivisionTable(teams: TeamRecord[]) {
    const leader = teams[0];
    return html`
      <table>
        <thead><tr>
          <th style="text-align:left">Team</th>
          <th>W</th><th>L</th><th>PCT</th><th>GB</th>
        </tr></thead>
        <tbody>
          ${teams.map((t, i) => html`
            <tr class=${i === 0 && (t.W + t.L) > 0 ? 'leader' : ''}>
              <td>${t.city} ${t.name}</td>
              <td>${t.W}</td>
              <td>${t.L}</td>
              <td>${winPct(t)}</td>
              <td>${gamesBehind(leader, t)}</td>
            </tr>
          `)}
        </tbody>
      </table>`;
  }

  render() {
    return html`
      <h2>Standings</h2>
      <div class="games-count">${this.gamesPlayed} game${this.gamesPlayed !== 1 ? 's' : ''} played</div>
      <div class="toolbar">
        <select @change=${(e: any) => { this.conferenceFilter = e.target.value; }}>
          <option value="">All Conferences</option>
          <option value="American" ?selected=${this.conferenceFilter === 'American'}>American</option>
          <option value="National" ?selected=${this.conferenceFilter === 'National'}>National</option>
        </select>
        <div class="tab-bar">
          <button class="tab ${this.view === 'division' ? 'active' : ''}" @click=${() => { this.view = 'division'; }}>By Division</button>
          <button class="tab ${this.view === 'overall' ? 'active' : ''}" @click=${() => { this.view = 'overall'; }}>Overall</button>
        </div>
        <button @click=${() => this._refresh()}>Refresh</button>
        <button class="btn-danger" @click=${() => this._onReset()}>Reset History</button>
      </div>

      ${this.gamesPlayed === 0
        ? html`<div class="empty">No games played yet. Go to the Game page and play some games!</div>`
        : this.view === 'division' ? this._renderByDivision() : this._renderOverall()
      }
    `;
  }

  _renderByDivision() {
    const grouped = this._grouped();
    return html`${Array.from(grouped.entries()).map(([label, teams]) => html`
      <div class="division">
        <div class="division-header">${label}</div>
        ${this._renderDivisionTable(teams)}
      </div>
    `)}`;
  }

  _renderOverall() {
    const all = this._overall();
    const leader = all[0];
    return html`
      <table>
        <thead><tr>
          <th style="text-align:left">Team</th>
          <th>Conf</th><th>Div</th>
          <th>W</th><th>L</th><th>PCT</th><th>GB</th>
        </tr></thead>
        <tbody>
          ${all.map((t, i) => html`
            <tr class=${i === 0 && (t.W + t.L) > 0 ? 'leader' : ''}>
              <td>${t.city} ${t.name}</td>
              <td>${t.conference.slice(0, 2)}</td>
              <td>${t.division.slice(0, 1)}</td>
              <td>${t.W}</td>
              <td>${t.L}</td>
              <td>${winPct(t)}</td>
              <td>${gamesBehind(leader, t)}</td>
            </tr>
          `)}
        </tbody>
      </table>`;
  }
}

if (!customElements.get('standings-page')) customElements.define('standings-page', StandingsPage as any);
