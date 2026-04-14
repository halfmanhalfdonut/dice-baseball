import { LitElement, html, css } from 'lit';
import { ensureDefaultTeams } from '../services/Teams';
import { createSeason, loadSeason, saveSeason, deleteSeason, seasonStandings, generatePlayoffBracket, advancePlayoffBracket, type SeasonTeamRecord } from '../services/SeasonService';
import { simulateGame } from '../game/GameSimulator';
import { startingLineup, pitchingStaff } from '../services/PlayerGenerator';
import { recordGame } from '../services/StatsService';
import { recordGameResult } from '../services/GameHistoryService';
import { winPct } from '../models/GameRecord';
import type { Team } from '../models/Team';
import type { Season, ScheduledGame, PlayoffSeries } from '../models/Season';

export class SeasonPage extends LitElement {
  static styles = css`
    :host { display:block }
    h2 { margin:0 0 12px }
    .toolbar { display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin-bottom:16px }
    .toolbar select, .toolbar input, .toolbar button { background:#222; color:#eee; border:1px solid #444; border-radius:4px; padding:5px 10px; cursor:pointer; font-size:0.85rem }
    .toolbar input { width:180px }
    .toolbar button:hover { background:#444; color:#fff }
    .btn-run { background:#2a7; color:#000; font-weight:600; border:none }
    .btn-run:hover { background:#3b8 }
    .btn-sim10 { background:#28a; color:#fff; font-weight:600; border:none }
    .btn-sim10:hover { background:#3ac }
    .btn-simall { background:#a52; color:#fff; font-weight:600; border:none }
    .btn-simall:hover { background:#c63 }
    .btn-danger { border-color:#a33; color:#f88 }
    .btn-danger:hover { background:#522; color:#fcc }

    .setup { background:#191919; padding:20px; border-radius:8px; max-width:420px }
    .setup h3 { margin:0 0 12px }
    .setup label { display:block; margin-bottom:10px; color:#ccc; font-size:0.9rem }
    .setup input, .setup select { display:block; margin-top:4px; background:#222; color:#eee; border:1px solid #444; border-radius:4px; padding:5px 8px; width:100% }
    .setup button { margin-top:16px; padding:8px 20px; font-size:1rem }

    .progress-bar { background:#222; border-radius:6px; height:20px; margin-bottom:16px; overflow:hidden; position:relative }
    .progress-fill { background: linear-gradient(90deg, #2a7, #4cf); height:100%; transition:width 0.3s }
    .progress-text { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:0.75rem; color:#fff; font-weight:600 }

    .columns { display:grid; grid-template-columns:1fr 1fr; gap:16px }
    @media (max-width:700px) { .columns { grid-template-columns:1fr } }

    .next-game { background:#1a2a3a; border:1px solid #335; border-radius:8px; padding:16px; margin-bottom:16px }
    .next-game h3 { margin:0 0 8px; font-size:0.95rem; color:#4cf }
    .matchup { font-size:1.1rem; font-weight:700; margin-bottom:4px }
    .game-num { color:#888; font-size:0.8rem }

    .last-result { background:#1a3a1a; border:1px solid #353; border-radius:8px; padding:12px; margin-bottom:16px; font-size:0.9rem }
    .last-result .score { font-weight:700; color:#4cf; font-family:monospace }

    table { width:100%; border-collapse:collapse; font-size:0.82rem }
    td, th { border:1px solid #333; padding:4px 6px; text-align:right; white-space:nowrap }
    th { background:#1a1a1a; color:#aaa; font-weight:600 }
    th:first-child, td:first-child { text-align:left }
    tr:hover td { background:#1c1c1c }
    .leader td { font-weight:600 }
    .division-header { color:#aaa; font-weight:600; font-size:0.8rem; margin:14px 0 4px; padding-bottom:3px; border-bottom:1px solid #333 }
    .season-info { color:#888; font-size:0.82rem; margin-bottom:12px }

    .playoff-section { margin-top:24px }
    .playoff-section h3 { margin:0 0 12px; color:#f84 }
    .round-label { color:#aaa; font-weight:600; font-size:0.82rem; margin:16px 0 6px; text-transform:uppercase; letter-spacing:0.05em }
    .series-card { background:#1a1a2a; border:1px solid #336; border-radius:8px; padding:12px; margin-bottom:10px }
    .series-card.complete { border-color:#353; background:#1a2a1a }
    .series-card.ws { border-color:#a72; background:#2a1a0a }
    .series-teams { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px }
    .series-team { font-weight:600; font-size:0.95rem }
    .series-team.winner { color:#4cf }
    .series-team.loser { color:#666 }
    .series-vs { color:#666; font-size:0.8rem }
    .series-score { text-align:center; font-family:monospace; font-size:1.1rem; font-weight:700; color:#eee; margin-bottom:4px }
    .series-games { display:flex; gap:4px; justify-content:center; flex-wrap:wrap }
    .game-pip { width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.6rem; font-weight:700; border:1px solid #444 }
    .game-pip.higher { background:#2a5a2a; color:#8f8 }
    .game-pip.lower { background:#5a2a2a; color:#f88 }
    .game-pip.unplayed { background:#333; color:#666 }
    .champion-banner { background:linear-gradient(135deg, #2a1a0a, #3a2a0a); border:2px solid #d4a843; border-radius:12px; padding:24px; text-align:center; margin:20px 0 }
    .champion-banner h3 { margin:0 0 8px; color:#d4a843; font-size:1.3rem }
    .champion-banner .team-name { font-size:1.5rem; font-weight:800; color:#fff }
    .btn-playoff { background:#d4a843; color:#000; font-weight:700; border:none }
    .btn-playoff:hover { background:#e5b954 }
    .series-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px }
    @media (max-width:700px) { .series-grid { grid-template-columns:1fr } }
  `;

  static properties = {
    teams: { type: Array },
    season: { type: Object },
    lastResult: { type: Object },
    simming: { type: Boolean },
  } as any;

  teams: Team[] = [];
  season: Season | null = null;
  lastResult: { away: string; home: string; awayRuns: number; homeRuns: number } | null = null;
  simming = false;

  // Setup form state
  private _seasonName = 'Season 1';
  private _gamesPerMatchup = 2;

  async connectedCallback() {
    super.connectedCallback();
    this.teams = await ensureDefaultTeams();
    this.season = loadSeason();
    window.addEventListener('hashchange', this._onHash);
  }

  disconnectedCallback() {
    window.removeEventListener('hashchange', this._onHash);
    super.disconnectedCallback();
  }

  _onHash = () => {
    if (window.location.hash === '#season') {
      this.season = loadSeason();
      this.requestUpdate();
    }
  };

  // ── Team helpers ──────────────────────────────────────────────────────

  _team(id: string): Team | undefined {
    return this.teams.find(t => t.id === id);
  }

  _teamLabel(id: string): string {
    const t = this._team(id);
    return t ? `${t.city} ${t.name}` : id;
  }

  // ── Season creation ───────────────────────────────────────────────────

  _createSeason() {
    this.season = createSeason(this.teams, this._seasonName, this._gamesPerMatchup);
    this.lastResult = null;
    this.requestUpdate();
  }

  _deleteSeason() {
    if (!confirm('Delete this season? This cannot be undone.')) return;
    deleteSeason();
    this.season = null;
    this.lastResult = null;
    this.requestUpdate();
  }

  // ── Simulation ────────────────────────────────────────────────────────

  _nextGame(): ScheduledGame | undefined {
    if (!this.season) return undefined;
    return this.season.schedule.find(g => !g.played);
  }

  _simOneGame() {
    const game = this._nextGame();
    if (!game || !this.season) return;
    this._simulateScheduledGame(game);
    saveSeason(this.season);
    this.requestUpdate();
  }

  async _simBatch(count: number) {
    if (!this.season || this.simming) return;
    this.simming = true;
    this.requestUpdate();

    let simmed = 0;
    const batchSize = 5; // sim in small batches to keep UI responsive

    const doBatch = () => {
      for (let i = 0; i < batchSize && simmed < count; i++) {
        const game = this._nextGame();
        if (!game) break;
        this._simulateScheduledGame(game);
        simmed++;
      }
      saveSeason(this.season!);
      this.requestUpdate();

      if (simmed < count && this._nextGame()) {
        requestAnimationFrame(doBatch);
      } else {
        this.simming = false;
        this.requestUpdate();
      }
    };

    requestAnimationFrame(doBatch);
  }

  _simAll() {
    if (!this.season) return;
    const remaining = this.season.schedule.filter(g => !g.played).length;
    this._simBatch(remaining);
  }

  _simulateScheduledGame(game: ScheduledGame) {
    const awayTeam = this._team(game.awayTeamId);
    const homeTeam = this._team(game.homeTeamId);
    if (!awayTeam || !homeTeam) return;

    const lineupAway = startingLineup(awayTeam.roster as any);
    const lineupHome = startingLineup(homeTeam.roster as any);
    const pitchersAway = pitchingStaff(awayTeam.roster as any).map(p => ({
      id: p.id, name: p.name, position: p.position,
      pitching: p.pitching ?? 50, stamina: p.stamina ?? 50, composure: p.composure ?? 50, strength: p.strength ?? 50
    }));
    const pitchersHome = pitchingStaff(homeTeam.roster as any).map(p => ({
      id: p.id, name: p.name, position: p.position,
      pitching: p.pitching ?? 50, stamina: p.stamina ?? 50, composure: p.composure ?? 50, strength: p.strength ?? 50
    }));

    const result = simulateGame({
      rngSeed: game.seed,
      lineupAway,
      lineupHome,
      allowExtras: true,
      pitchersAway,
      pitchersHome,
    });

    // Update schedule entry
    game.awayRuns = result.away.runs;
    game.homeRuns = result.home.runs;
    game.innings = Math.max(result.away.innings.length, result.home.innings.length);
    game.played = true;

    // Record to cumulative stats
    recordGame(game.awayTeamId, lineupAway, result.away.innings, result.box.away);
    recordGame(game.homeTeamId, lineupHome, result.home.innings, result.box.home);

    // Record to game history
    recordGameResult({
      awayTeamId: game.awayTeamId,
      homeTeamId: game.homeTeamId,
      awayCity: awayTeam.city,
      awayName: awayTeam.name,
      homeCity: homeTeam.city,
      homeName: homeTeam.name,
      awayRuns: result.away.runs,
      homeRuns: result.home.runs,
      innings: game.innings!,
      seed: game.seed,
    });

    this.lastResult = {
      away: `${awayTeam.city} ${awayTeam.name}`,
      home: `${homeTeam.city} ${homeTeam.name}`,
      awayRuns: result.away.runs,
      homeRuns: result.home.runs,
    };
  }

  // ── Playoffs ──────────────────────────────────────────────────────────

  _isRegularSeasonDone(): boolean {
    if (!this.season) return false;
    return this.season.schedule.every(g => g.played);
  }

  _startPlayoffs() {
    if (!this.season || !this._isRegularSeasonDone()) return;
    this.season.playoffs = generatePlayoffBracket(this.season, this.teams);
    saveSeason(this.season);
    this.requestUpdate();
  }

  _nextPlayoffGame(): { series: PlayoffSeries; gameIndex: number; stakes: string } | null {
    const p = this.season?.playoffs;
    if (!p) return null;

    // Check rounds in order: DS → CS → WS
    for (const s of p.divisionSeries) {
      if (s.winnerId) continue;
      const gi = s.games.findIndex(g => !g.played);
      if (gi !== -1) return { series: s, gameIndex: gi, stakes: 'playoff' };
    }
    for (const s of p.conferenceSeries) {
      if (s.winnerId) continue;
      const gi = s.games.findIndex(g => !g.played);
      if (gi !== -1) return { series: s, gameIndex: gi, stakes: 'playoff' };
    }
    if (p.worldSeries && !p.worldSeries.winnerId) {
      const gi = p.worldSeries.games.findIndex(g => !g.played);
      if (gi !== -1) return { series: p.worldSeries, gameIndex: gi, stakes: 'worldseries' };
    }
    return null;
  }

  _simNextPlayoffGame() {
    const next = this._nextPlayoffGame();
    if (!next || !this.season) return;

    const { series, gameIndex, stakes } = next;
    const game = series.games[gameIndex];
    const higherTeam = this._team(series.higherSeedId);
    const lowerTeam = this._team(series.lowerSeedId);
    if (!higherTeam || !lowerTeam) return;

    // Higher seed has home-field advantage in games 1,2,5,7 (0-indexed: 0,1,4,6)
    const homeIsHigher = [0, 1, 4, 6].includes(gameIndex);
    const homeTeam = homeIsHigher ? higherTeam : lowerTeam;
    const awayTeam = homeIsHigher ? lowerTeam : higherTeam;

    const lineupAway = startingLineup(awayTeam.roster as any);
    const lineupHome = startingLineup(homeTeam.roster as any);
    const pitchersAway = pitchingStaff(awayTeam.roster as any).map(p => ({
      id: p.id, name: p.name, position: p.position,
      pitching: p.pitching ?? 50, stamina: p.stamina ?? 50, composure: p.composure ?? 50, strength: p.strength ?? 50
    }));
    const pitchersHome = pitchingStaff(homeTeam.roster as any).map(p => ({
      id: p.id, name: p.name, position: p.position,
      pitching: p.pitching ?? 50, stamina: p.stamina ?? 50, composure: p.composure ?? 50, strength: p.strength ?? 50
    }));

    const result = simulateGame({
      rngSeed: game.seed,
      lineupAway,
      lineupHome,
      allowExtras: true,
      pitchersAway,
      pitchersHome,
      stakes,
    });

    game.awayRuns = result.away.runs;
    game.homeRuns = result.home.runs;
    game.innings = Math.max(result.away.innings.length, result.home.innings.length);
    game.played = true;

    // Tally series wins
    const homeWon = result.home.runs > result.away.runs;
    if (homeIsHigher ? homeWon : !homeWon) {
      series.higherSeedWins++;
    } else {
      series.lowerSeedWins++;
    }

    // Check if series is over
    if (series.higherSeedWins >= series.gamesNeeded) {
      series.winnerId = series.higherSeedId;
    } else if (series.lowerSeedWins >= series.gamesNeeded) {
      series.winnerId = series.lowerSeedId;
    }

    // Advance bracket if a round completed
    advancePlayoffBracket(this.season!.playoffs!, this.season!);

    this.lastResult = {
      away: `${awayTeam.city} ${awayTeam.name}`,
      home: `${homeTeam.city} ${homeTeam.name}`,
      awayRuns: result.away.runs,
      homeRuns: result.home.runs,
    };

    saveSeason(this.season!);
    this.requestUpdate();
  }

  _simAllPlayoffs() {
    if (!this.season?.playoffs) return;
    while (this._nextPlayoffGame()) {
      this._simNextPlayoffGame();
    }
  }

  // ── Standings ─────────────────────────────────────────────────────────

  _standings(): Array<SeasonTeamRecord & { city: string; name: string; conference: string; division: string }> {
    if (!this.season) return [];
    const records = seasonStandings(this.season);
    return records.map(r => {
      const t = this._team(r.teamId);
      return { ...r, city: t?.city ?? '', name: t?.name ?? '', conference: t?.conference ?? '', division: t?.division ?? '' };
    });
  }

  _groupedStandings() {
    const all = this._standings();
    const map = new Map<string, typeof all>();
    const divOrder = [
      'American – East', 'American – Central', 'American – West',
      'National – East', 'National – Central', 'National – West',
    ];
    for (const key of divOrder) {
      const [conf, div] = key.split(' – ');
      const teams = all
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

  // ── Rendering ─────────────────────────────────────────────────────────

  render() {
    if (!this.season) return this._renderSetup();
    return this._renderSeason();
  }

  _renderSetup() {
    return html`
      <h2>Season Mode</h2>
      <div class="setup">
        <h3>New Season</h3>
        <label>Season Name
          <input type="text" .value=${this._seasonName} @input=${(e: any) => { this._seasonName = e.target.value; }}>
        </label>
        <label>Games per matchup
          <select @change=${(e: any) => { this._gamesPerMatchup = Number(e.target.value); }}>
            <option value="1">1 (${30 * 29 / 2} games)</option>
            <option value="2" selected>2 (${30 * 29} games)</option>
            <option value="3">3 (${30 * 29 * 3 / 2} games)</option>
          </select>
        </label>
        <p style="color:#888;font-size:0.8rem;margin:8px 0">${this.teams.length} teams loaded. Each pair plays the selected number of games.</p>
        <button class="btn-run" @click=${this._createSeason}>Create Season</button>
      </div>
    `;
  }

  _renderSeason() {
    const s = this.season!;
    const played = s.schedule.filter(g => g.played).length;
    const total = s.schedule.length;
    const pct = total === 0 ? 0 : (played / total) * 100;
    const done = played === total;
    const next = this._nextGame();
    const grouped = this._groupedStandings();

    return html`
      <h2>${s.name}</h2>
      <div class="season-info">${played} / ${total} games · ${this.teams.length} teams · ${s.gamesPerMatchup} games/matchup</div>

      <div class="progress-bar">
        <div class="progress-fill" style="width:${pct}%"></div>
        <div class="progress-text">${played}/${total} (${pct.toFixed(0)}%)</div>
      </div>

      <div class="toolbar">
        ${!done && !this.simming ? html`
          <button class="btn-run" @click=${this._simOneGame} ?disabled=${!next}>▶ Sim Next Game</button>
          <button class="btn-sim10" @click=${() => this._simBatch(10)} ?disabled=${!next}>⏩ Sim 10</button>
          <button class="btn-sim10" @click=${() => this._simBatch(50)} ?disabled=${!next}>⏩ Sim 50</button>
          <button class="btn-simall" @click=${this._simAll} ?disabled=${!next}>⏭ Sim All</button>
        ` : ''}
        ${this.simming ? html`<span style="color:#4cf;font-size:0.9rem">Simulating...</span>` : ''}
        <button class="btn-danger" @click=${this._deleteSeason}>Delete Season</button>
      </div>

      ${this.lastResult ? html`
        <div class="last-result">
          Last: ${this.lastResult.away} <span class="score">${this.lastResult.awayRuns}</span>
          @ ${this.lastResult.home} <span class="score">${this.lastResult.homeRuns}</span>
        </div>
      ` : ''}

      ${next ? html`
        <div class="next-game">
          <h3>Next Game</h3>
          <div class="matchup">${this._teamLabel(next.awayTeamId)} @ ${this._teamLabel(next.homeTeamId)}</div>
          <div class="game-num">Game ${next.gameIndex + 1} of ${total}</div>
        </div>
      ` : done && !s.playoffs ? html`
        <div class="next-game" style="background:#1a3a1a;border-color:#353">
          <h3 style="color:#4c6">Regular Season Complete!</h3>
          <p style="color:#ccc;margin:4px 0">All ${total} games have been played.</p>
          <button class="btn-playoff" style="margin-top:10px;padding:8px 20px;border-radius:6px;cursor:pointer" @click=${this._startPlayoffs}>🏆 Start Playoffs</button>
        </div>
      ` : ''}

      ${s.playoffs ? this._renderPlayoffs() : ''}

      <h3 style="margin:20px 0 8px;font-size:0.95rem;color:#aaa">Standings</h3>
      ${played === 0
        ? html`<p style="color:#666;font-size:0.85rem">No games played yet — sim a game to see standings.</p>`
        : html`${Array.from(grouped.entries()).map(([label, teams]) => html`
            <div class="division-header">${label}</div>
            <table>
              <thead><tr><th>Team</th><th>W</th><th>L</th><th>PCT</th></tr></thead>
              <tbody>
                ${teams.map((t, i) => html`
                  <tr class=${i === 0 && (t.W + t.L) > 0 ? 'leader' : ''}>
                    <td>${t.city} ${t.name}</td>
                    <td>${t.W}</td><td>${t.L}</td>
                    <td>${t.W + t.L === 0 ? '.000' : (t.W / (t.W + t.L)).toFixed(3).replace(/^0/, '')}</td>
                  </tr>
                `)}
              </tbody>
            </table>
          `)}`
      }
    `;
  }

  _renderPlayoffs() {
    const p = this.season!.playoffs!;
    const nextGame = this._nextPlayoffGame();
    const champion = p.championId;

    return html`
      <div class="playoff-section">
        <h3>🏆 Playoffs</h3>

        ${champion ? html`
          <div class="champion-banner">
            <h3>🎉 World Series Champion</h3>
            <div class="team-name">${this._teamLabel(champion)}</div>
          </div>
        ` : ''}

        ${nextGame && !champion ? html`
          <div class="toolbar">
            <button class="btn-playoff" @click=${this._simNextPlayoffGame}>▶ Sim Next Playoff Game</button>
            <button class="btn-simall" @click=${this._simAllPlayoffs}>⏭ Sim All Playoffs</button>
          </div>
          <div class="last-result" style="background:#1a1a2a;border-color:#336">
            Next: <strong>${this._teamLabel(nextGame.series.lowerSeedId)}</strong>
            @ <strong>${this._teamLabel(nextGame.series.higherSeedId)}</strong>
            <span style="color:#888;margin-left:8px">(${nextGame.stakes === 'worldseries' ? 'World Series' : 'Playoff'})</span>
          </div>
        ` : ''}

        ${this.lastResult && this.season!.playoffs ? html`
          <div class="last-result">
            Last: ${this.lastResult.away} <span class="score">${this.lastResult.awayRuns}</span>
            @ ${this.lastResult.home} <span class="score">${this.lastResult.homeRuns}</span>
          </div>
        ` : ''}

        <div class="round-label">Division Series (Best of 5)</div>
        <div class="series-grid">
          ${p.divisionSeries.map(s => this._renderSeries(s))}
        </div>

        ${p.conferenceSeries.length > 0 ? html`
          <div class="round-label">Conference Championship (Best of 7)</div>
          <div class="series-grid">
            ${p.conferenceSeries.map(s => this._renderSeries(s))}
          </div>
        ` : ''}

        ${p.worldSeries ? html`
          <div class="round-label">World Series (Best of 7)</div>
          ${this._renderSeries(p.worldSeries, true)}
        ` : ''}
      </div>
    `;
  }

  _renderSeries(series: PlayoffSeries, isWS = false) {
    const higherLabel = this._teamLabel(series.higherSeedId);
    const lowerLabel = this._teamLabel(series.lowerSeedId);
    const done = !!series.winnerId;
    const higherWon = series.winnerId === series.higherSeedId;
    const lowerWon = series.winnerId === series.lowerSeedId;

    return html`
      <div class="series-card ${done ? 'complete' : ''} ${isWS ? 'ws' : ''}">
        <div class="series-teams">
          <span class="series-team ${done ? (higherWon ? 'winner' : 'loser') : ''}">${higherLabel}</span>
          <span class="series-vs">vs</span>
          <span class="series-team ${done ? (lowerWon ? 'winner' : 'loser') : ''}">${lowerLabel}</span>
        </div>
        <div class="series-score">${series.higherSeedWins} – ${series.lowerSeedWins}</div>
        <div class="series-games">
          ${series.games.filter(g => g.played || series.games.indexOf(g) < series.gamesNeeded * 2 - 1).map(g => {
            if (!g.played) return html`<span class="game-pip unplayed">–</span>`;
            // Determine who won this game
            const higherIsHome = series.games.indexOf(g) % 2 === 0 || [4, 6].includes(series.games.indexOf(g));
            const homeWon = g.homeRuns! > g.awayRuns!;
            const higherWonGame = higherIsHome ? homeWon : !homeWon;
            return html`<span class="game-pip ${higherWonGame ? 'higher' : 'lower'}" title="${g.awayRuns}–${g.homeRuns}">${higherWonGame ? 'W' : 'L'}</span>`;
          })}
        </div>
      </div>
    `;
  }
}

if (!customElements.get('season-page')) customElements.define('season-page', SeasonPage as any);
