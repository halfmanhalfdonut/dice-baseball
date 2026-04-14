import { LitElement, html, css, nothing } from 'lit';
import { ensureDefaultTeams, saveTeam } from '../services/Teams';
import type { Team, TeamPlayer } from '../models/Team';

export class TeamsPage extends LitElement {
  static styles = css`
    :host { display:block }
    h2 { margin:0 0 12px }
    .toolbar { display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin-bottom:12px }
    .toolbar select { background:#222; color:#eee; border:1px solid #444; border-radius:4px; padding:4px 8px; cursor:pointer }
    .toolbar button { background:#222; color:#eee; border:1px solid #444; border-radius:4px; padding:4px 8px; cursor:pointer }
    .toolbar button:hover { background:#444; color:#fff }

    /* Team cards grid */
    .teams-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:12px }
    .team-card { background:#1a1a1a; border:1px solid #333; border-radius:8px; padding:12px; cursor:pointer; transition: border-color 0.15s }
    .team-card:hover { border-color:#4cf }
    .team-card.selected { border-color:#4cf; background:#1c2a3a }
    .team-city { color:#888; font-size:0.8rem; margin-bottom:2px }
    .team-name { font-weight:700; font-size:1.05rem }
    .team-meta { color:#666; font-size:0.75rem; margin-top:4px }

    /* Division headers */
    .division-header { margin:20px 0 8px; padding-bottom:4px; border-bottom:1px solid #333; color:#aaa; font-size:0.85rem; font-weight:600 }
    .division-header:first-child { margin-top:0 }

    /* Roster detail */
    .detail { margin-top:20px }
    .detail h3 { margin:0 0 4px; font-size:1.1rem }
    .detail .sub { color:#888; font-size:0.8rem; margin-bottom:12px }
    .section-label { color:#aaa; font-weight:600; font-size:0.8rem; margin:16px 0 6px; text-transform:uppercase; letter-spacing:0.05em }

    table { width:100%; border-collapse:collapse; font-size:0.82rem }
    td, th { border:1px solid #333; padding:4px 6px; text-align:right; white-space:nowrap }
    th { background:#1a1a1a; color:#aaa; font-weight:600; user-select:none }
    th:first-child, td:first-child { text-align:left }
    td:nth-child(2), th:nth-child(2) { text-align:left }
    tr:hover td { background:#1c1c1c }

    /* Editable cell */
    .editable { cursor:pointer; position:relative }
    .editable:hover { background:#252525; color:#4cf }
    input.cell-edit { width:52px; background:#222; color:#eee; border:1px solid #4cf; border-radius:3px; padding:2px 4px; font-size:0.82rem; text-align:right }

    .back-btn { background:none; border:none; color:#4cf; cursor:pointer; font-size:0.9rem; padding:0; margin-bottom:8px }
    .back-btn:hover { text-decoration:underline }

    .empty { padding:24px; text-align:center; color:#666 }
    .save-indicator { color:#4c6; font-size:0.8rem; margin-left:8px; opacity:0; transition:opacity 0.3s }
    .save-indicator.show { opacity:1 }
  `;

  static properties = {
    teams: { type: Array },
    conferenceFilter: { type: String },
    selectedTeamId: { type: String },
    editingCell: { type: String },
    editValue: { type: String },
    saveFlash: { type: Boolean },
  } as any;

  teams: Team[] = [];
  conferenceFilter = '';
  selectedTeamId = '';
  editingCell = '';  // "playerId:field"
  editValue = '';
  saveFlash = false;

  async connectedCallback() {
    super.connectedCallback();
    this.teams = await ensureDefaultTeams();
    window.addEventListener('hashchange', this._onHash);
  }

  disconnectedCallback() {
    window.removeEventListener('hashchange', this._onHash);
    super.disconnectedCallback();
  }

  _onHash = () => {
    if (window.location.hash === '#teams') {
      this._refreshTeams();
    }
  };

  async _refreshTeams() {
    this.teams = await ensureDefaultTeams();
  }

  _filtered(): Team[] {
    if (!this.conferenceFilter) return this.teams;
    return this.teams.filter(t => t.conference === this.conferenceFilter);
  }

  _grouped(): Map<string, Team[]> {
    const filtered = this._filtered();
    const map = new Map<string, Team[]>();
    // Sort order: American East, Central, West, National East, Central, West
    const divOrder = ['American – East', 'American – Central', 'American – West', 'National – East', 'National – Central', 'National – West'];
    for (const key of divOrder) {
      const [conf, div] = key.split(' – ');
      const teams = filtered.filter(t => t.conference === conf && t.division === div);
      if (teams.length) map.set(key, teams);
    }
    return map;
  }

  _selectedTeam(): Team | undefined {
    return this.teams.find(t => t.id === this.selectedTeamId);
  }

  _selectTeam(id: string) {
    this.selectedTeamId = id;
    this.editingCell = '';
  }

  _back() {
    this.selectedTeamId = '';
    this.editingCell = '';
  }

  // ── Inline editing ───────────────────────────────────────────────────

  _startEdit(playerId: string, field: string, currentValue: string | number) {
    this.editingCell = `${playerId}:${field}`;
    this.editValue = String(currentValue);
  }

  _onEditInput(e: InputEvent) {
    this.editValue = (e.target as HTMLInputElement).value;
  }

  _onEditKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') this._commitEdit();
    if (e.key === 'Escape') { this.editingCell = ''; this.requestUpdate(); }
  }

  _onEditBlur() {
    this._commitEdit();
  }

  async _commitEdit() {
    if (!this.editingCell) return;
    const [playerId, field] = this.editingCell.split(':');
    const team = this._selectedTeam();
    if (!team) return;
    const player = team.roster.find(p => p.id === playerId);
    if (!player) return;

    let val: number | string = this.editValue.trim();

    // Validate numeric fields
    const numericFields = ['batting', 'strength', 'speed', 'streak', 'pitching', 'stamina', 'composure', 'number'];
    const floatFields = ['aggression'];

    if (numericFields.includes(field)) {
      const n = parseInt(val, 10);
      if (isNaN(n) || n < 0 || n > 100) { this.editingCell = ''; return; }
      (player as any)[field] = n;
    } else if (floatFields.includes(field)) {
      const f = parseFloat(val);
      if (isNaN(f) || f < 0 || f > 1) { this.editingCell = ''; return; }
      (player as any)[field] = +f.toFixed(2);
    } else if (field === 'name') {
      if (!val) { this.editingCell = ''; return; }
      player.name = val;
    } else {
      (player as any)[field] = val;
    }

    this.editingCell = '';
    await saveTeam(team);
    // Flash save indicator
    this.saveFlash = true;
    this.requestUpdate();
    setTimeout(() => { this.saveFlash = false; this.requestUpdate(); }, 1200);
  }

  // ── Rendering ────────────────────────────────────────────────────────

  _renderCell(player: TeamPlayer, field: string, value: string | number) {
    const cellKey = `${player.id}:${field}`;
    if (this.editingCell === cellKey) {
      return html`<td>
        <input class="cell-edit" .value=${this.editValue}
          @input=${this._onEditInput}
          @keydown=${this._onEditKeydown}
          @blur=${this._onEditBlur}
          @focus=${(e: FocusEvent) => (e.target as HTMLInputElement).select()}
          autofocus>
      </td>`;
    }
    return html`<td class="editable" @click=${() => this._startEdit(player.id, field, value)}>${value}</td>`;
  }

  _renderBattersTable(players: TeamPlayer[]) {
    return html`
      <table>
        <thead><tr>
          <th>#</th><th>Name</th><th>Pos</th>
          <th>BAT</th><th>STR</th><th>SPD</th><th>STK</th><th>AGG</th>
        </tr></thead>
        <tbody>
          ${players.map(p => html`
            <tr>
              <td>${p.number ?? ''}</td>
              ${this._renderCell(p, 'name', p.name)}
              <td>${p.position ?? ''}</td>
              ${this._renderCell(p, 'batting', p.batting)}
              ${this._renderCell(p, 'strength', p.strength)}
              ${this._renderCell(p, 'speed', p.speed)}
              ${this._renderCell(p, 'streak', p.streak)}
              ${this._renderCell(p, 'aggression', p.aggression)}
            </tr>
          `)}
        </tbody>
      </table>`;
  }

  _renderPitchersTable(players: TeamPlayer[]) {
    return html`
      <table>
        <thead><tr>
          <th>#</th><th>Name</th><th>Pos</th>
          <th>PIT</th><th>STA</th><th>CMP</th><th>BAT</th><th>STR</th>
        </tr></thead>
        <tbody>
          ${players.map(p => html`
            <tr>
              <td>${p.number ?? ''}</td>
              ${this._renderCell(p, 'name', p.name)}
              <td>${p.position ?? ''}</td>
              ${this._renderCell(p, 'pitching', p.pitching ?? 0)}
              ${this._renderCell(p, 'stamina', p.stamina ?? 0)}
              ${this._renderCell(p, 'composure', p.composure ?? 0)}
              ${this._renderCell(p, 'batting', p.batting)}
              ${this._renderCell(p, 'strength', p.strength)}
            </tr>
          `)}
        </tbody>
      </table>`;
  }

  _renderDetail(team: Team) {
    const isPitcher = (p: TeamPlayer) => p.position === 'SP' || p.position === 'RP' || p.position === 'CL';
    const batters = team.roster.filter(p => !isPitcher(p));
    const pitchers = team.roster.filter(p => isPitcher(p));

    return html`
      <div class="detail">
        <button class="back-btn" @click=${this._back}>← All Teams</button>
        <h3>${team.city} ${team.name}
          <span class="save-indicator ${this.saveFlash ? 'show' : ''}">✓ Saved</span>
        </h3>
        <div class="sub">${team.conference} Conference – ${team.division} Division · ${team.roster.length} players</div>

        <div class="section-label">Position Players (${batters.length})</div>
        ${this._renderBattersTable(batters)}

        <div class="section-label">Pitching Staff (${pitchers.length})</div>
        ${this._renderPitchersTable(pitchers)}
      </div>
    `;
  }

  render() {
    const team = this._selectedTeam();
    if (team) return this._renderDetail(team);

    const grouped = this._grouped();
    return html`
      <h2>Teams</h2>
      <div class="toolbar">
        <select @change=${(e: any) => { this.conferenceFilter = e.target.value; }}>
          <option value="">All Conferences</option>
          <option value="American" ?selected=${this.conferenceFilter === 'American'}>American</option>
          <option value="National" ?selected=${this.conferenceFilter === 'National'}>National</option>
        </select>
      </div>
      ${grouped.size === 0
        ? html`<div class="empty">No teams found.</div>`
        : html`${Array.from(grouped.entries()).map(([label, teams]) => html`
            <div class="division-header">${label}</div>
            <div class="teams-grid">
              ${teams.map(t => html`
                <div class="team-card" @click=${() => this._selectTeam(t.id)}>
                  <div class="team-city">${t.city}</div>
                  <div class="team-name">${t.name}</div>
                  <div class="team-meta">${t.roster.length} players</div>
                </div>
              `)}
            </div>
          `)}`
      }
    `;
  }
}

if (!customElements.get('teams-page')) customElements.define('teams-page', TeamsPage as any);
