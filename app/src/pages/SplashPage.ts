import { LitElement, html, css } from 'lit';
import { getGameHistory } from '../services/GameHistoryService';
import type { GameRecord } from '../models/GameRecord';

export class SplashPage extends LitElement {
  static styles = css`
    :host { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:60vh; text-align:center }
    h1 { font-size:2.4rem; margin:0 0 8px }
    .sub { color:#aaa; font-size:1.1rem; margin-bottom:24px }
    .play-btn { font-size:1.2rem; padding:14px 36px; border-radius:8px; border:none; background:#2a7; color:#000; font-weight:700; cursor:pointer; transition:background 0.15s }
    .play-btn:hover { background:#3b8 }
    .play-btn:focus-visible { outline:2px solid #fff; outline-offset:2px }
    .recent { margin-top:32px; width:100%; max-width:420px; text-align:left }
    .recent h3 { font-size:0.9rem; color:#888; margin:0 0 8px; text-transform:uppercase; letter-spacing:0.05em }
    .game-row { display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid #222; font-size:0.85rem }
    .game-teams { color:#ccc }
    .game-score { font-family:monospace; color:#4cf; font-weight:600 }
    .more-link { display:inline-block; margin-top:8px; color:#4cf; font-size:0.82rem; text-decoration:none }
    .more-link:hover { text-decoration:underline }
  `;

  static properties = {
    recentGames: { type: Array },
  } as any;

  recentGames: GameRecord[] = [];

  connectedCallback() {
    super.connectedCallback();
    this._refresh();
    window.addEventListener('hashchange', this._onHash);
  }

  disconnectedCallback() {
    window.removeEventListener('hashchange', this._onHash);
    super.disconnectedCallback();
  }

  _onHash = () => {
    if (window.location.hash === '#splash' || window.location.hash === '') this._refresh();
  };

  _refresh() {
    this.recentGames = getGameHistory().slice(0, 5);
  }

  render() {
    return html`
      <h1>Dice Baseball</h1>
      <p class="sub">Deterministic turn-based baseball simulation</p>
      <button class="play-btn" @click=${() => { window.location.hash = 'game'; }}>Play Ball</button>
      ${this.recentGames.length > 0 ? html`
        <div class="recent">
          <h3>Recent Games</h3>
          ${this.recentGames.map(g => {
            const awayWon = g.awayRuns > g.homeRuns;
            return html`
              <div class="game-row">
                <span class="game-teams">${awayWon ? '★ ' : ''}${g.awayCity} ${g.awayName} @ ${g.homeCity} ${g.homeName}${!awayWon ? ' ★' : ''}</span>
                <span class="game-score">${g.awayRuns}–${g.homeRuns}</span>
              </div>
            `;
          })}
          <a class="more-link" href="#log">View full game log →</a>
        </div>
      ` : ''}
    `;
  }
}

if (!customElements.get('splash-page')) customElements.define('splash-page', SplashPage);
