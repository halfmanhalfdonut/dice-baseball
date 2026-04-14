import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('menu-page')
export class MenuPage extends LitElement {
  static styles = css`p{font-size:1.05rem}`;
  render() { return html`<h2>Menu</h2><p>Pick an option from the header to get started.</p>`; }
}
