import { LitElement, html, css } from 'lit';

export class ToastElem extends LitElement {
  static styles = css`:host{position:fixed;right:16px;bottom:16px;z-index:9999} .toast{background:#222;color:#fff;padding:8px 12px;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,0.2);}`;
  static properties = { message: { type: String }, visible: { type: Boolean } } as any;
  message = '';
  visible = false;

  show(msg:string, ms=2500){ this.message = msg; this.visible = true; this.requestUpdate(); setTimeout(()=>{ this.visible=false; this.requestUpdate() }, ms); }

  render(){ return html`${this.visible ? html`<div class="toast">${this.message}</div>` : ''}` }
}

if(!customElements.get('app-toast')) customElements.define('app-toast', ToastElem as any);
