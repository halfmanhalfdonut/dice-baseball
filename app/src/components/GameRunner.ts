import { LitElement, html, css } from 'lit';
import { simulateGame } from '../game/GameSimulator';
import { saveLineupsPouch, loadLineupsPouch, saveLineupsLocal, loadLineupsLocal, getPouchDB } from '../services/Persistence';
import { ensureDefaultTeams } from '../services/Teams';
import { startingLineup, pitchingStaff } from '../services/PlayerGenerator';
import type { Team } from '../models/Team';
import { recordGame } from '../services/StatsService';
import { recordGameResult } from '../services/GameHistoryService';
import '../components/Linescore';

export class GameRunner extends LitElement {
  static styles = css`
    :host { display:block }
    .controls { display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin-bottom:16px }
    .controls label { color:#ccc; font-size:0.9rem }
    .controls input { background:#222; color:#eee; border:1px solid #444; border-radius:4px; padding:4px 8px }
    .controls select { background:#222; color:#eee; border:1px solid #444; border-radius:4px; padding:4px 8px; max-width:200px }
    .controls button { padding:6px 14px; border-radius:6px; border:none; font-weight:600; cursor:pointer }
    .btn-run { background:#2a7; color:#000 }
    .btn-run:hover { background:#3b8 }
    .btn-secondary { background:#333; color:#ccc; border:1px solid #555 }
    .btn-secondary:hover { background:#444; color:#fff }
    .columns { display:flex; gap:16px }
    .column { flex:1; min-width:0 }
    details { margin-top:16px }
    details summary { cursor:pointer; color:#aaa; font-size:0.9rem; padding:8px 0 }
    details summary:hover { color:#eee }
    .lineup-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px }
    .lineup-col ol { padding-left:20px; margin:4px 0 }
    .lineup-col li { margin-bottom:6px; font-size:0.85rem }
    .lineup-col input { background:#222; color:#eee; border:1px solid #444; border-radius:4px; padding:2px 6px; width:100px }
    .lineup-col input[type=number] { width:52px }
    .lineup-col strong { color:#ccc }
    .pos-badge { display:inline-block; width:28px; text-align:center; background:#333; color:#8cf; border-radius:3px; font-size:0.75rem; font-weight:600; margin-right:4px }
    .muted { color:#888 }
    @media (max-width:640px) { .columns { flex-direction:column } .lineup-grid { grid-template-columns:1fr } }
  `;
  static properties = { seed: { type: String }, result: { type: Object }, innings: { type: Number }, loadingTeams: { type: Boolean }, teams: { type: Array }, awayTeamId: { type: String }, homeTeamId: { type: String } } as any;
  seed = Date.now().toString();
  innings = 9;
  lineupA: any[] = Array.from({length:9}).map((_,i)=>({ id: `A${i}`, speed:50, aggression:0.2, batting:50, strength:50, streak:50 }));
  lineupH: any[] = Array.from({length:9}).map((_,i)=>({ id: `H${i}`, speed:50, aggression:0.2, batting:50, strength:50, streak:50 }));
  result: any = null;
  loadingTeams = false;
  teams: Team[] = [];
  awayTeamId = '';
  homeTeamId = '';

  async connectedCallback() {
    super.connectedCallback();
    await this.loadTeams();
    // attempt to restore from URL hash if present
    this.restoreFromHash();
    // listen for lineup events from LineupManager
    // LineupManager is placed as a sibling in the app shell, so listen on window
    window.addEventListener('lineup-load', this._onLineupLoad as EventListener);
    window.addEventListener('request-current-lineup', this._onRequestCurrentLineup as EventListener);
  }

  disconnectedCallback(){
    try{
      window.removeEventListener('lineup-load', this._onLineupLoad as EventListener);
      window.removeEventListener('request-current-lineup', this._onRequestCurrentLineup as EventListener);
    }catch(e){}
    super.disconnectedCallback();
  }

  // event handlers bound as class fields to allow removeEventListener
  _onLineupLoad = (e: Event) => {
    try{
      const ev = e as CustomEvent;
      const data = ev.detail;
      if(data) this.applyLoadedLineups(data);
    }catch(err){}
  }

  _onRequestCurrentLineup = (e: Event) => {
    try{
      const ev = e as CustomEvent;
      const respond = ev.detail?.respond;
      if(typeof respond === 'function'){
        respond({ lineupA: this.lineupA, lineupH: this.lineupH, seed: this.seed, innings: this.innings });
      }
    }catch(err){}
  }

  async loadTeams(){
    try{
      this.loadingTeams = true;
      this.teams = await ensureDefaultTeams();
      // auto-select first two different teams
      if(this.teams.length >= 2 && !this.awayTeamId){
        this.awayTeamId = this.teams[0].id;
        this.homeTeamId = this.teams[1].id;
        this.applyTeamToLineup('away');
        this.applyTeamToLineup('home');
      }
    }catch(e){
      // fallback: keep default simple lineups
    }finally{ this.loadingTeams = false }
  }

  applyTeamToLineup(side: 'away' | 'home'){
    const id = side === 'away' ? this.awayTeamId : this.homeTeamId;
    const team = this.teams.find(t => t.id === id);
    if(!team) return;
    const starters = startingLineup(team.roster as any);
    const lineup = starters.map((p, i) => ({
      id: p.id ?? `${side === 'away' ? 'A' : 'H'}${i}`,
      name: p.name,
      position: p.position,
      number: p.number,
      speed: p.speed ?? 50,
      aggression: p.aggression ?? 0.2,
      batting: p.batting ?? 50,
      strength: p.strength ?? 50,
      streak: p.streak ?? 50,
    }));
    if(side === 'away') this.lineupA = lineup;
    else this.lineupH = lineup;
    this.requestUpdate();
  }

  get awayTeam(): Team | undefined { return this.teams.find(t => t.id === this.awayTeamId) }
  get homeTeam(): Team | undefined { return this.teams.find(t => t.id === this.homeTeamId) }

  saveLineups(){
    try{
      const payload = { seed: this.seed, innings: this.innings, lineupA: this.lineupA, lineupH: this.lineupH };
      // try PouchDB first
      saveLineupsPouch(payload).then(()=>{
        console.log('saved to pouch');
      }).catch(()=>{
        saveLineupsLocal(payload);
        console.log('saved to localStorage fallback');
      });
    }catch(e){ console.warn('save failed', e) }
  }

  loadLineups(){
    try{
      // try loading from PouchDB, fallback to localStorage
      loadLineupsPouch().then((p:any)=>{
        if(p){ this.applyLoadedLineups(p); return; }
        const raw = loadLineupsLocal();
        if(!raw) return;
        this.applyLoadedLineups(raw);
      }).catch(()=>{
        const raw = loadLineupsLocal();
        if(!raw) return;
        this.applyLoadedLineups(raw);
      });
    }catch(e){ console.warn('load failed', e) }
  }

  applyLoadedLineups(p:any){
    if(!p) return;
    if(p.seed) this.seed = String(p.seed);
    if(p.innings) this.innings = Number(p.innings);
    if(Array.isArray(p.lineupA)) this.lineupA = p.lineupA;
    if(Array.isArray(p.lineupH)) this.lineupH = p.lineupH;
    this.requestUpdate();
  }

  makeShareLink(){
    // encode seed + lineups in hash as base64 JSON (small, acceptable for demo)
    try{
      const payload = { seed: this.seed, innings: this.innings, lineupA: this.lineupA, lineupH: this.lineupH };
      const json = JSON.stringify(payload);
      const b64 = btoa(unescape(encodeURIComponent(json)));
      const url = `${location.origin}${location.pathname}#game=${b64}`;
      // also update the location hash for easy sharing
      try{ location.hash = `game=${b64}` }catch(e){}
      // copy to clipboard if available
      if(navigator.clipboard) navigator.clipboard.writeText(url).catch(()=>{});
      return url;
    }catch(e){ console.warn('share failed', e); return '' }
  }

  restoreFromHash(){
    try{
      const h = location.hash || '';
      if(!h) return;
      const m = h.match(/game=([^&]+)/);
      if(!m) return;
      const b64 = m[1];
      const json = decodeURIComponent(escape(atob(b64)));
      const p = JSON.parse(json);
      if(p.seed) this.seed = String(p.seed);
      if(p.innings) this.innings = Number(p.innings);
      if(Array.isArray(p.lineupA)) this.lineupA = p.lineupA;
      if(Array.isArray(p.lineupH)) this.lineupH = p.lineupH;
      // clear previous result when restoring
      this.result = null;
      this.requestUpdate();
    }catch(e){
      // ignore parse errors
    }
  }

  render(){
    const awayLabel = this.awayTeam ? `${this.awayTeam.city} ${this.awayTeam.name}` : 'Away';
    const homeLabel = this.homeTeam ? `${this.homeTeam.city} ${this.homeTeam.name}` : 'Home';
    return html`
      <div class="controls">
        <label>Away
          <select .value=${this.awayTeamId} @change=${(e:any)=>{ this.awayTeamId = e.target.value; this.applyTeamToLineup('away'); }}>
            ${this.teams.map(t => html`<option value=${t.id} ?selected=${t.id === this.awayTeamId}>${t.city} ${t.name}</option>`)}
          </select>
        </label>
        <label>Home
          <select .value=${this.homeTeamId} @change=${(e:any)=>{ this.homeTeamId = e.target.value; this.applyTeamToLineup('home'); }}>
            ${this.teams.map(t => html`<option value=${t.id} ?selected=${t.id === this.homeTeamId}>${t.city} ${t.name}</option>`)}
          </select>
        </label>
        <label>Seed <input .value=${this.seed} @input=${(e:any)=>this.seed = e.target.value} style="width:100px"></label>
        <label>Inn <input type="number" min="1" .value=${this.innings} @input=${(e:any)=>this.innings = Number(e.target.value)} style="width:56px"></label>
        <button class="btn-run" @click=${this.run}>Run Game</button>
        <button class="btn-secondary" @click=${this.randomMatchup} ?disabled=${this.loadingTeams}>${this.loadingTeams ? 'Loading\u2026' : 'Random Matchup'}</button>
        <button class="btn-secondary" @click=${()=>this.saveLineups()}>Save</button>
        <button class="btn-secondary" @click=${()=>this.loadLineups()}>Load</button>
        <button class="btn-secondary" @click=${()=>{ const url = this.makeShareLink(); if(url) window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Share link copied!' } })); }}>Share</button>
      </div>

      ${this.result ? html`
        <line-score
          .awayInnings=${this.result.away.innings}
          .homeInnings=${this.result.home.innings}
          awayLabel=${awayLabel}
          homeLabel=${homeLabel}
        ></line-score>
        <div class="columns">
          <div class="column">
            <box-score .rows=${this.result.box.away} title=${awayLabel}></box-score>
            <play-by-play .plays=${(this.result.away.innings as any[]).flatMap((i:any)=>i.plateAppearances)} title="${awayLabel} Plays"></play-by-play>
          </div>
          <div class="column">
            <box-score .rows=${this.result.box.home} title=${homeLabel}></box-score>
            <play-by-play .plays=${(this.result.home.innings as any[]).flatMap((i:any)=>i.plateAppearances)} title="${homeLabel} Plays"></play-by-play>
          </div>
        </div>
        ${this.result.pitching ? html`
          <details open>
            <summary>Pitching</summary>
            <div class="columns">
              <div class="column">${this._renderPitchLog(awayLabel + ' Pitchers', this.result.pitching.away)}</div>
              <div class="column">${this._renderPitchLog(homeLabel + ' Pitchers', this.result.pitching.home)}</div>
            </div>
          </details>
        ` : ''}
      ` : html`<p class="muted">Press "Run Game" to simulate</p>`}

      <details>
        <summary>Starting Lineups</summary>
        <div class="lineup-grid">
          <div class="lineup-col">${this.renderLineupEditor(awayLabel, 'A', this.lineupA)}</div>
          <div class="lineup-col">${this.renderLineupEditor(homeLabel, 'H', this.lineupH)}</div>
        </div>
      </details>
    `;
  }

  renderLineupEditor(title:string, _prefix:string, lineup:any[]){
    return html`<div><strong>${title}</strong><ol>${lineup.map((p:any,i:number)=>html`<li><span class="pos-badge">${p.position ?? '??'}</span> #${p.number ?? i+1} ${p.name ?? p.id} <span class="muted">(B:${p.batting} S:${p.strength} Spd:${p.speed})</span></li>`)}</ol></div>`;
  }

  private _renderPitchLog(title: string, log: any[]) {
    if (!log || log.length === 0) return '';
    return html`
      <div><strong>${title}</strong>
        <ul style="list-style:none;padding:0;margin:4px 0">
          ${log.map((e: any) => {
            const p = e.pitcher;
            const name = p?.name ?? p?.id ?? 'Unknown';
            const pos = p?.position ?? '';
            const inn = e.inningsEnd - e.inningsStart + 1;
            return html`<li style="margin-bottom:4px;font-size:0.85rem">
              <span class="pos-badge">${pos}</span> ${name}
              <span class="muted">${e.pitchCount} pitches, ${inn} inn</span>
            </li>`;
          })}
        </ul>
      </div>
    `;
  }

  private _labelPlays(innings: any[], lineup: any[]): void {
    for (const inn of innings) {
      for (const pa of inn.plateAppearances) {
        const p = lineup[pa.batterIndex];
        if (p?.name) {
          const parts = p.name.split(' ');
          const first = parts[0] ?? '';
          const last = parts.slice(1).join(' ') || first;
          const pos = p.position ?? '';
          pa._label = `${first[0]} ${last}${pos ? ' - ' + pos : ''}`;
        } else {
          pa._label = p?.id ?? `Batter #${(pa.batterIndex ?? 0) + 1}`;
        }
      }
    }
  }

  run(){
    try{
      const seedNum = Number(this.seed) || 0;
      // Build pitcher staffs from team rosters
      const awayTeam = this.awayTeam;
      const homeTeam = this.homeTeam;
      const pitchersAway = awayTeam ? pitchingStaff(awayTeam.roster as any).map(p => ({
        id: p.id, name: p.name, position: p.position,
        pitching: p.pitching ?? 50, stamina: p.stamina ?? 50, composure: p.composure ?? 50, strength: p.strength ?? 50
      })) : undefined;
      const pitchersHome = homeTeam ? pitchingStaff(homeTeam.roster as any).map(p => ({
        id: p.id, name: p.name, position: p.position,
        pitching: p.pitching ?? 50, stamina: p.stamina ?? 50, composure: p.composure ?? 50, strength: p.strength ?? 50
      })) : undefined;
      const g = simulateGame({ rngSeed: seedNum, lineupAway: this.lineupA, lineupHome: this.lineupH, allowExtras: true, pitchersAway, pitchersHome });
      // Stamp each PA with a display label so PlayByPlay is self-contained
      this._labelPlays(g.away.innings, this.lineupA);
      this._labelPlays(g.home.innings, this.lineupH);
      this.result = { ...g, lineupA: this.lineupA, lineupH: this.lineupH };
      // Persist cumulative player stats
      const awayId = this.awayTeamId || 'away';
      const homeId = this.homeTeamId || 'home';
      recordGame(awayId, this.lineupA, g.away.innings, g.box.away);
      recordGame(homeId, this.lineupH, g.home.innings, g.box.home);
      // Record to game history for standings
      if (awayTeam && homeTeam) {
        recordGameResult({
          awayTeamId: awayId,
          homeTeamId: homeId,
          awayCity: awayTeam.city,
          awayName: awayTeam.name,
          homeCity: homeTeam.city,
          homeName: homeTeam.name,
          awayRuns: g.away.runs,
          homeRuns: g.home.runs,
          innings: Math.max(g.away.innings.length, g.home.innings.length),
          seed: seedNum,
        });
      }
      // Auto-advance seed so the next run is always unique
      this.seed = (seedNum + 1).toString();
    }catch(err){
      console.error(err);
    }
  }

  randomMatchup(){
    if(this.teams.length < 2) return;
    const shuffled = [...this.teams].sort(() => Math.random() - 0.5);
    this.awayTeamId = shuffled[0].id;
    this.homeTeamId = shuffled[1].id;
    this.applyTeamToLineup('away');
    this.applyTeamToLineup('home');
    this.result = null;
  }
}

if (!customElements.get('game-runner')) customElements.define('game-runner', GameRunner as any);
