import { LitElement, html, css } from 'lit';

/**
 * <line-score> — Traditional baseball linescore showing runs per inning plus R/H/E totals.
 *
 * Usage:
 *   <line-score
 *     .awayInnings=${result.away.innings}
 *     .homeInnings=${result.home.innings}
 *     awayLabel="New York Bombers"
 *     homeLabel="Boston Whales">
 *   </line-score>
 */
export class Linescore extends LitElement {
  static styles = css`
    :host { display:block; overflow-x:auto; margin-bottom:16px }
    table { border-collapse:collapse; width:100%; min-width:500px; font-size:0.85rem; font-variant-numeric:tabular-nums }
    th, td { padding:6px 8px; text-align:center; border:1px solid #333 }
    th { background:#1a1a1a; color:#999; font-weight:600; white-space:nowrap }
    td { background:#141414; color:#ddd }
    .team-name { text-align:left; min-width:140px; font-weight:600; color:#eee; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px }
    .inning-col { min-width:28px }
    .summary { background:#1a1a1a; font-weight:700; color:#fff; min-width:32px }
    .summary-header { background:#222; color:#aaa }
    .active { background:#1c2a1c }
    .zero { color:#555 }
    .dash { color:#444 }
    tr:first-child td { border-top:2px solid #444 }
    tr:last-child td { border-bottom:2px solid #444 }
    @media (max-width:600px) {
      table { font-size:0.75rem }
      th, td { padding:4px 5px }
      .team-name { max-width:100px; min-width:80px }
    }
  `;

  static properties = {
    awayInnings: { type: Array },
    homeInnings: { type: Array },
    awayLabel: { type: String },
    homeLabel: { type: String },
  } as any;

  awayInnings: any[] = [];
  homeInnings: any[] = [];
  awayLabel = 'Away';
  homeLabel = 'Home';

  private _inningStats(innings: any[]): { runs: number; hits: number; errors: number }[] {
    return innings.map(inn => {
      let hits = 0;
      let errors = 0;
      for (const pa of inn.plateAppearances ?? []) {
        if (['single', 'double', 'triple', 'hr'].includes(pa.result)) hits++;
        if (pa.result === 'error') errors++;
      }
      return { runs: Math.round(inn.runs ?? 0), hits, errors };
    });
  }

  render() {
    const awayStats = this._inningStats(this.awayInnings);
    const homeStats = this._inningStats(this.homeInnings);
    const maxInnings = Math.max(awayStats.length, homeStats.length, 9);

    // Totals
    const totals = (stats: { runs: number; hits: number; errors: number }[]) => stats.reduce(
      (t, s) => ({ R: t.R + s.runs, H: t.H + s.hits, E: t.E + s.errors }),
      { R: 0, H: 0, E: 0 }
    );
    const awayTotals = totals(awayStats);
    const homeTotals = totals(homeStats);

    // Column headers: 1–N
    const inningCols = Array.from({ length: maxInnings }, (_, i) => i + 1);

    const renderRunCell = (stats: { runs: number; hits: number; errors: number }[], idx: number, isHome: boolean) => {
      if (idx >= stats.length) {
        // Home might not bat in bottom of last inning
        if (isHome && idx === awayStats.length - 1 && idx >= 8) {
          return html`<td class="inning-col dash">X</td>`;
        }
        return html`<td class="inning-col dash">–</td>`;
      }
      const r = stats[idx].runs;
      return html`<td class="inning-col ${r > 0 ? 'active' : ''} ${r === 0 ? 'zero' : ''}">${r}</td>`;
    };

    return html`
      <table>
        <thead>
          <tr>
            <th class="team-name"></th>
            ${inningCols.map(n => html`<th class="inning-col">${n}</th>`)}
            <th class="summary-header">R</th>
            <th class="summary-header">H</th>
            <th class="summary-header">E</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="team-name" title=${this.awayLabel}>${this.awayLabel}</td>
            ${inningCols.map((_, i) => renderRunCell(awayStats, i, false))}
            <td class="summary">${awayTotals.R}</td>
            <td class="summary">${awayTotals.H}</td>
            <td class="summary">${awayTotals.E}</td>
          </tr>
          <tr>
            <td class="team-name" title=${this.homeLabel}>${this.homeLabel}</td>
            ${inningCols.map((_, i) => renderRunCell(homeStats, i, true))}
            <td class="summary">${homeTotals.R}</td>
            <td class="summary">${homeTotals.H}</td>
            <td class="summary">${homeTotals.E}</td>
          </tr>
        </tbody>
      </table>
    `;
  }
}

if (!customElements.get('line-score')) customElements.define('line-score', Linescore as any);
