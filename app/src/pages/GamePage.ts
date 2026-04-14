import { LitElement, html, css } from 'lit';

export class GamePage extends LitElement {
  static styles = css`p{font-size:1.05rem}`;
  render() { return html`<h2>Game View</h2><game-runner></game-runner>`; }
}

if (!customElements.get('game-page')) customElements.define('game-page', GamePage);
