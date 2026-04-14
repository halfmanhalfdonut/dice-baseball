import { LitElement, html, css } from 'lit';

export class BoxScore extends LitElement {
  static styles = css`
    :host { display:block }
    table { width:100%; border-collapse:collapse; font-size:0.9rem }
    td, th { border:1px solid #333; padding:6px 8px; text-align:right }
    th { background:#1a1a1a; color:#aaa; font-weight:600 }
    th:first-child, td:first-child { text-align:left }
    tr:hover td { background:#1c1c1c }
    .header { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px }
    .title { font-weight:700 }
    .actions { display:flex; gap:4px }
    .actions button { font-size:0.75rem; padding:3px 8px; border-radius:4px; border:1px solid #444; background:transparent; color:#aaa; cursor:pointer }
    .actions button:hover { background:#333; color:#eee }
    .total td { font-weight:700; border-top:2px solid #555 }
  `;
  static properties = { rows: { type: Array }, title: { type: String } } as any;
  rows: any[] = [];
  title = '';

  private _toCSV(): string {
    const header = 'Player,AB,H,R,RBI,PA';
    const lines = this.rows.map((r: any) => `${r.id},${r.AB},${r.H},${r.R},${r.RBI},${r.PA}`);
    const totals = this.rows.reduce((t: any, r: any) => ({ AB: t.AB + r.AB, H: t.H + r.H, R: t.R + r.R, RBI: t.RBI + r.RBI, PA: t.PA + r.PA }), { AB:0, H:0, R:0, RBI:0, PA:0 });
    lines.push(`Total,${totals.AB},${totals.H},${totals.R},${totals.RBI},${totals.PA}`);
    return [header, ...lines].join('\n');
  }

  private _downloadJSON() {
    const blob = new Blob([JSON.stringify(this.rows, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${this.title || 'box-score'}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  private _copyCSV() {
    const csv = this._toCSV();
    navigator.clipboard?.writeText(csv).then(() => {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'CSV copied to clipboard' } }));
    }).catch(() => {});
  }

  render() {
    if (!this.rows || this.rows.length === 0) return html`<p class="muted">No box data</p>`;
    const totals = this.rows.reduce((t: any, r: any) => ({ AB: t.AB + r.AB, H: t.H + r.H, R: t.R + r.R, RBI: t.RBI + r.RBI, PA: t.PA + r.PA }), { AB:0, H:0, R:0, RBI:0, PA:0 });
    return html`
      <div class="header">
        <span class="title">${this.title}</span>
        <div class="actions">
          <button @click=${this._copyCSV} title="Copy as CSV">CSV</button>
          <button @click=${this._downloadJSON} title="Download JSON">JSON</button>
        </div>
      </div>
      <table>
        <thead><tr><th>Player</th><th>AB</th><th>H</th><th>R</th><th>RBI</th><th>PA</th></tr></thead>
        <tbody>
          ${this.rows.map((r: any) => html`<tr><td>${r.id}</td><td>${r.AB}</td><td>${r.H}</td><td>${r.R}</td><td>${r.RBI}</td><td>${r.PA}</td></tr>`)}
          <tr class="total"><td>Total</td><td>${totals.AB}</td><td>${totals.H}</td><td>${totals.R}</td><td>${totals.RBI}</td><td>${totals.PA}</td></tr>
        </tbody>
      </table>
    `;
  }
}

if (!customElements.get('box-score')) customElements.define('box-score', BoxScore as any);
