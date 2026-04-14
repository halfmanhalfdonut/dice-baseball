import { LitElement, html, css } from 'lit';

export class AppShell extends LitElement {
  static styles = css`
    :host { display:block; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color: #eee; background:#111; min-height:100vh }
    header { background: #0b3d91; color: #fff; padding: 12px 16px; display:flex; align-items:center; justify-content:space-between }
    nav { display:flex; align-items:center }
    nav a { color: #fff; text-decoration: none; margin-left: 12px; font-size:0.95rem }
    nav a:hover { text-decoration:underline }
    main { padding: 16px; max-width:960px; margin:0 auto }
    .logo { font-weight: 700; font-size:1.1rem }
    button { cursor:pointer }
  `;

  static properties = {
    route: { type: String }
  } as any;

  route: string = 'splash';

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('hashchange', this.onHashChange);
    this.route = window.location.hash.replace('#', '') || 'splash';
    // listen for lineup manager open/close to update ARIA state
    window.addEventListener('lineup-opened', this._onLineupOpened as EventListener);
    window.addEventListener('lineup-closed', this._onLineupClosed as EventListener);
  }

  disconnectedCallback() {
    window.removeEventListener('hashchange', this.onHashChange);
    window.removeEventListener('lineup-opened', this._onLineupOpened as EventListener);
    window.removeEventListener('lineup-closed', this._onLineupClosed as EventListener);
    super.disconnectedCallback();
  }

  _onLineupOpened = () => {
    const btn = this.renderRoot?.querySelector('#lineup-toggle') as HTMLElement | null;
    if(btn) btn.setAttribute('aria-expanded','true');
  }

  _onLineupClosed = () => {
    const btn = this.renderRoot?.querySelector('#lineup-toggle') as HTMLElement | null;
    if(btn) btn.setAttribute('aria-expanded','false');
  }

  onHashChange = () => {
    this.route = window.location.hash.replace('#', '') || 'splash';
  };

  navigate(to: string) {
    window.location.hash = to;
  }

  render() {
    return html`
      <header>
        <div class="logo">Dice Baseball</div>
        <nav>
          <a href="#splash">Home</a>
          <a href="#game">Game</a>
          <a href="#season">Season</a>
          <a href="#teams">Teams</a>
          <a href="#standings">Standings</a>
          <a href="#log">Log</a>
          <a href="#stats">Stats</a>
          <a href="#settings">Settings</a>
          <button id="lineup-toggle" aria-expanded="false" @click=${()=>window.dispatchEvent(new CustomEvent('toggle-lineup'))} style="margin-left:12px;padding:6px 8px;border-radius:6px;border:none;background:#fff;color:#0b3d91">Lineups</button>
        </nav>
      </header>
      <main>
        ${this.renderRoute()}
      </main>
    `;
  }

  renderRoute() {
    switch (this.route) {
      case 'game': return html`<slot name="game"></slot>`;
      case 'season': return html`<slot name="season"></slot>`;
      case 'teams': return html`<slot name="teams"></slot>`;
      case 'standings': return html`<slot name="standings"></slot>`;
      case 'log': return html`<slot name="log"></slot>`;
      case 'stats': return html`<slot name="stats"></slot>`;
      case 'settings': return html`<slot name="settings"></slot>`;
      default: return html`<slot name="splash"></slot>`;
    }
  }
}

if (!customElements.get('app-shell')) {
  customElements.define('app-shell', AppShell as any);
}
