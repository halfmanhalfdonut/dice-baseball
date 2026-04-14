import { LitElement, html, css } from 'lit';
import { getGameHistory, getTeamHistory, resetGameHistory } from '../services/GameHistoryService';
import { ensureDefaultTeams } from '../services/Teams';
import type { GameRecord } from '../models/GameRecord';
import type { Team } from '../models/Team';

export class GameLogPage extends LitElement {
  static styles = css`
    :host { display:block }
    h2 { margin:0 0 12px }
    .toolbar { display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin-bottom:12px }
    .toolbar select, .toolbar button { background:#222; color:#eee; border:1px solid #444; border-radius:4px; padding:4px 8px; cursor:pointer }
    .toolbar button:hover { background:#444; color:#fff }
    .btn-danger { border-color:#a33; color:#f88 }
    .btn-danger:hover { background:#522; color:#fcc }
    table { width:100%; border-collapse:collapse; font-size:0.85rem }
    td, th { border:1px solid #333; padding:5px 7px; white-space:nowrap }
    th { background:#1a1a1a; color:#aaa; font-weight:600; user-select:none }
    th:first-child, td:first-child { text-align:left }
    tr:hover td { background:#1c1c1c }
    .winner { font-weight:700; color:#4cf }
    .score { font-family:monospace; font-size:0.9rem }
    .extra { color:#f84; font-size:0.75rem }
    .date { color:#888; font-size:0.8rem }
    .empty { padding:24px; text-align:center; color:#666 }
    .count { color:#888; font-size:0.82rem; margin-bottom:16px }
  `;

  static properties = {
    teams: { type: Array },
    games: { type: Array },
    teamFilter: { type: String },
  } as any;

  teams: Team[] = [];
  games: GameRecord[] = [];
  teamFilter = '';

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
    if (window.location.hash === '#log') this._refresh();
  };

  _refresh() {
    this.games = this.teamFilter ? getTeamHistory(this.teamFilter) : getGameHistory();
  }

  _formatDate(ts: number): string {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  _onReset() {
    if (!confirm('Clear all game history?')) return;
    resetGameHistory();
    this._refresh();
  }

  render() {
    return html`
      <h2>Game Log</h2>
      <div class="count">${this.games.length} game${this.games.length !== 1 ? 's' : ''}</div>
      <div class="toolbar">
        <select @change=${(e: any) => { this.teamFilter = e.target.value; this._refresh(); }}>
          <option value="">All Teams</option>
          ${this.teams.map(t => html`<option value=${t.id} ?selected=${t.id === this.teamFilter}>${t.city} ${t.name}</option>`)}
        </select>
        <button @click=${() => this._refresh()}>Refresh</button>
        <button class="btn-danger" @click=${() => this._onReset()}>Clear Log</button>
      </div>

      ${this.games.length === 0
        ? html`<div class="empty">No games played yet.</div>`
        : html`
          <table>
            <thead><tr>
              <th>Date</th>
              <th>Away</th>
              <th></th>
              <th>Home</th>
              <th>Inn</th>
            </tr></thead>
            <tbody>
              ${this.games.map(g => {
                const awayWon = g.awayRuns > g.homeRuns;
                return html`
                  <tr>
                    <td class="date">${this._formatDate(g.timestamp)}</td>
                    <td class=${awayWon ? 'winner' : ''}>${g.awayCity} ${g.awayName}</td>
                    <td class="score">${g.awayRuns} – ${g.homeRuns}</td>
                    <td class=${!awayWon ? 'winner' : ''}>${g.homeCity} ${g.homeName}</td>
                    <td>${g.innings}${g.innings > 9 ? html` <span class="extra">F/${g.innings}</span>` : ''}</td>
                  </tr>
                `;
              })}
            </tbody>
          </table>
        `}
    `;
  }
}

if (!customElements.get('game-log-page')) customElements.define('game-log-page', GameLogPage as any);
