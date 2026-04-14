import { LitElement, html, css } from 'lit';

export class PlayByPlay extends LitElement {
  static styles = css`
    :host { display:block }
    .header { display:flex; align-items:center; justify-content:space-between; margin:12px 0 6px }
    .title { font-weight:700 }
    .actions button { font-size:0.75rem; padding:3px 8px; border-radius:4px; border:1px solid #444; background:transparent; color:#aaa; cursor:pointer }
    .actions button:hover { background:#333; color:#eee }
    ul { padding:0; margin:0; list-style:none; max-height:400px; overflow-y:auto }
    li { padding:8px; border-bottom:1px solid #222 }
    li:last-child { border-bottom:none }
    .meta { color:#888; font-size:0.8em; margin-bottom:2px }
    .result { font-size:0.95rem }
    .fc { color:#c93; font-style:italic }
  `;
  static properties = { plays: { type: Array }, title: { type: String } } as any;
  plays: any[] = [];
  title = '';

  private _batterLabel(p: any): string {
    if (p._label) return p._label;
    return `Batter #${(p.batterIndex ?? 0) + 1}`;
  }

  private _downloadJSON() {
    const blob = new Blob([JSON.stringify(this.plays, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${this.title || 'play-by-play'}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  private _copyCSV() {
    const header = 'Batter,Result,Runs,Outs,FC';
    const lines = this.plays.map((p: any) => {
      const fc = p.appliedScenario?.isFielderChoice ? 'Y' : '';
      const runs = p.runsScored ?? p.appliedScenario?.runs ?? 0;
      const outs = p.appliedScenario?.outsAdded ?? 0;
      return `${this._batterLabel(p)},${p.result},${runs},${outs},${fc}`;
    });
    const csv = [header, ...lines].join('\n');
    navigator.clipboard?.writeText(csv).then(() => {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Play-by-play CSV copied' } }));
    }).catch(() => {});
  }

  render() {
    if (!this.plays || this.plays.length === 0) return html`<p class="muted">No plays</p>`;
    return html`
      <div class="header">
        <span class="title">${this.title || 'Play-by-Play'}</span>
        <div class="actions">
          <button @click=${this._copyCSV} title="Copy as CSV">CSV</button>
          <button @click=${this._downloadJSON} title="Download JSON">JSON</button>
        </div>
      </div>
      <ul>
        ${this.plays.map((p: any) => html`
          <li>
            <div class="meta">${this._batterLabel(p)}</div>
            <div class="result">
              ${p.result}${p.appliedScenario?.isFielderChoice ? html` <span class="fc">(FC)</span>` : ''}
            </div>
          </li>
        `)}
      </ul>
    `;
  }
}

if (!customElements.get('play-by-play')) customElements.define('play-by-play', PlayByPlay as any);
