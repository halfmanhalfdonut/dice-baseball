import { LitElement, html, css } from 'lit';
import { getStats, resetStats } from '../services/StatsService';
import { avg, obp, slg, type PlayerStats } from '../models/PlayerStats';
import { ensureDefaultTeams } from '../services/Teams';
import type { Team } from '../models/Team';

type SortCol = 'name' | 'team' | 'pos' | 'G' | 'PA' | 'AB' | 'H' | '2B' | '3B' | 'HR' | 'R' | 'RBI' | 'BB' | 'AVG' | 'OBP' | 'SLG';

export class StatsPage extends LitElement {
  static styles = css`
    :host { display:block }
    h2 { margin:0 0 12px }
    .toolbar { display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin-bottom:12px }
    .toolbar select, .toolbar button { background:#222; color:#eee; border:1px solid #444; border-radius:4px; padding:4px 8px; cursor:pointer }
    .toolbar button:hover { background:#444; color:#fff }
    .btn-danger { border-color:#a33; color:#f88 }
    .btn-danger:hover { background:#522; color:#fcc }
    table { width:100%; border-collapse:collapse; font-size:0.85rem }
    td, th { border:1px solid #333; padding:5px 7px; text-align:right; white-space:nowrap }
    th { background:#1a1a1a; color:#aaa; font-weight:600; cursor:pointer; user-select:none }
    th:hover { color:#fff }
    th.sorted { color:#4cf }
    th:first-child, td:first-child { text-align:left }
    td:nth-child(2), th:nth-child(2) { text-align:left }
    tr:hover td { background:#1c1c1c }
    .muted { color:#888 }
    .empty { padding:24px; text-align:center; color:#666 }
    .desc::after { content:' ▾' }
    .asc::after { content:' ▴' }
  `;

  static properties = {
    teamFilter: { type: String },
    sortBy: { type: String },
    sortAsc: { type: Boolean },
    teams: { type: Array },
    stats: { type: Array },
  } as any;

  teamFilter = '';
  sortBy: SortCol = 'PA';
  sortAsc = false;
  teams: Team[] = [];
  stats: PlayerStats[] = [];

  async connectedCallback() {
    super.connectedCallback();
    this.teams = await ensureDefaultTeams();
    this.refresh();
    window.addEventListener('hashchange', this._onHash);
  }

  disconnectedCallback() {
    window.removeEventListener('hashchange', this._onHash);
    super.disconnectedCallback();
  }

  _onHash = () => {
    if (window.location.hash === '#stats') this.refresh();
  };

  refresh() {
    this.stats = getStats(this.teamFilter || undefined);
  }

  _teamLabel(teamId: string): string {
    const t = this.teams.find(t => t.id === teamId);
    return t ? `${t.city} ${t.name}` : teamId;
  }

  _sortVal(s: PlayerStats, col: SortCol): number | string {
    switch (col) {
      case 'name': return s.name.toLowerCase();
      case 'team': return this._teamLabel(s.teamId).toLowerCase();
      case 'pos': return s.position;
      case 'AVG': return s.AB === 0 ? -1 : s.H / s.AB;
      case 'OBP': { const d = s.AB + s.BB; return d === 0 ? -1 : (s.H + s.BB) / d; }
      case 'SLG': {
        if (s.AB === 0) return -1;
        const singles = s.H - s['2B'] - s['3B'] - s.HR;
        return (singles + 2 * s['2B'] + 3 * s['3B'] + 4 * s.HR) / s.AB;
      }
      default: return (s as any)[col] ?? 0;
    }
  }

  _sort(col: SortCol) {
    if (this.sortBy === col) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortBy = col;
      this.sortAsc = col === 'name' || col === 'team' || col === 'pos';
    }
    this.requestUpdate();
  }

  _sorted(): PlayerStats[] {
    const list = [...this.stats];
    const dir = this.sortAsc ? 1 : -1;
    list.sort((a, b) => {
      const va = this._sortVal(a, this.sortBy);
      const vb = this._sortVal(b, this.sortBy);
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    return list;
  }

  _thClass(col: SortCol): string {
    if (this.sortBy !== col) return '';
    return `sorted ${this.sortAsc ? 'asc' : 'desc'}`;
  }

  _onReset() {
    if (!confirm('Clear all accumulated player stats?')) return;
    resetStats(this.teamFilter || undefined);
    this.refresh();
  }

  render() {
    const rows = this._sorted();
    const th = (col: SortCol, label: string) =>
      html`<th class=${this._thClass(col)} @click=${() => this._sort(col)}>${label}</th>`;
    return html`
      <h2>Player Stats</h2>
      <div class="toolbar">
        <select @change=${(e: any) => { this.teamFilter = e.target.value; this.refresh(); }}>
          <option value="">All Teams</option>
          ${this.teams.map(t => html`<option value=${t.id} ?selected=${t.id === this.teamFilter}>${t.city} ${t.name}</option>`)}
        </select>
        <button @click=${() => this.refresh()}>Refresh</button>
        <button class="btn-danger" @click=${() => this._onReset()}>Reset Stats</button>
      </div>
      ${rows.length === 0
        ? html`<div class="empty">No stats recorded yet. Play some games first!</div>`
        : html`
          <table>
            <thead><tr>
              ${th('name', 'Player')}
              ${th('team', 'Team')}
              ${th('pos', 'Pos')}
              ${th('G', 'G')}
              ${th('PA', 'PA')}
              ${th('AB', 'AB')}
              ${th('H', 'H')}
              ${th('2B', '2B')}
              ${th('3B', '3B')}
              ${th('HR', 'HR')}
              ${th('R', 'R')}
              ${th('RBI', 'RBI')}
              ${th('BB', 'BB')}
              ${th('AVG', 'AVG')}
              ${th('OBP', 'OBP')}
              ${th('SLG', 'SLG')}
            </tr></thead>
            <tbody>
              ${rows.map(s => html`
                <tr>
                  <td>${s.name}</td>
                  <td>${this._teamLabel(s.teamId)}</td>
                  <td>${s.position}</td>
                  <td>${s.G}</td>
                  <td>${s.PA}</td>
                  <td>${s.AB}</td>
                  <td>${s.H}</td>
                  <td>${s['2B']}</td>
                  <td>${s['3B']}</td>
                  <td>${s.HR}</td>
                  <td>${s.R}</td>
                  <td>${s.RBI}</td>
                  <td>${s.BB}</td>
                  <td>${avg(s)}</td>
                  <td>${obp(s)}</td>
                  <td>${slg(s)}</td>
                </tr>
              `)}
            </tbody>
          </table>
        `}
    `;
  }
}

if (!customElements.get('stats-page')) customElements.define('stats-page', StatsPage as any);
