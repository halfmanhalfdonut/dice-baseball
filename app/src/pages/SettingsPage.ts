import { LitElement, html, css } from 'lit';

export class SettingsPage extends LitElement {
  static styles = css`
    :host { display:block }
    h2 { margin-top:0 }
    .row { display:flex; align-items:center; gap:12px; margin-bottom:12px }
    label { color:#ccc }
    .card { background:#191919; padding:16px; border-radius:8px }
    .muted { color:#888; font-size:0.85rem }
  `;
  render() {
    return html`
      <h2>Settings</h2>
      <div class="card">
        <div class="row"><label>Theme</label><span class="muted">Dark (only option for now)</span></div>
        <div class="row"><label>Default innings</label><span class="muted">Configurable per-game in the Game view</span></div>
        <div class="row"><label>Service worker</label><span class="muted">${'serviceWorker' in navigator ? 'Registered' : 'Not available'}</span></div>
      </div>
    `;
  }
}

if (!customElements.get('settings-page')) customElements.define('settings-page', SettingsPage);
