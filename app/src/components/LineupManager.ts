import { LitElement, html, css } from 'lit';
import { listLineups, saveNamedLineup, loadNamedLineup, deleteLineup } from '../services/Persistence';

export class LineupManager extends LitElement {
  static styles = css` :host{display:block} .list{max-height:240px;overflow:auto;border:1px solid #eee;padding:6px} button{margin-left:6px} .row{display:flex;align-items:center;justify-content:space-between;padding:6px;border-bottom:1px solid rgba(255,255,255,0.03)} input.name{width:200px}
    :host([open]){position:fixed;right:16px;top:72px;width:360px;z-index:1000;background:#fff;color:#000;border-radius:8px;box-shadow:0 8px 30px rgba(0,0,0,0.4);padding:12px}
    .backdrop{position:fixed;left:0;top:0;right:0;bottom:0;background:rgba(0,0,0,0.4);z-index:900}
    .close{float:right;border:none;background:transparent;font-size:1.2rem}
  `;
  static properties = { items: { type: Array }, name: { type: String }, offline: { type: Boolean } } as any;
  items:any[] = [];
  name = '';
  offline = false;

  connectedCallback(){
    super.connectedCallback();
    this.refresh();
    // listen for toggle events
    window.addEventListener('toggle-lineup', this._onToggle as EventListener);
  }

  async refresh(){
    try{ this.items = await listLineups(); this.offline = !(await (await import('../services/Persistence')).getPouchDB()); }catch(e){ this.items = []; this.offline = true }
    this.requestUpdate();
  }

  async saveCurrent(){
    // dispatch an event and wait for the parent to respond with the current lineup via the respond callback
    try{
      const payload = await new Promise((resolve)=>{
          // dispatch on window so sibling components can listen
          window.dispatchEvent(new CustomEvent('request-current-lineup', { detail: { respond: resolve } }));
        // if nobody responds, resolve undefined after a short timeout
        setTimeout(()=>resolve(undefined), 250);
      });
      if(!payload) return alert('No lineup data available');
      await saveNamedLineup(this.name || `Lineup ${new Date().toLocaleString()}`, payload);
      this.name = '';
      await this.refresh();
    }catch(e){ console.warn(e); alert('Save failed') }
  }

  async load(id:string){
    const doc = await loadNamedLineup(id);
  if(!doc) return alert('Could not load');
  // dispatch event with loaded data on window so GameRunner hears it
  window.dispatchEvent(new CustomEvent('lineup-load', { detail: doc.data }));
  window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Lineup loaded' } }));
  }

  async deleteLineupItem(id:string){
    if(!confirm('Delete this lineup?')) return;
    await deleteLineup(id);
  await this.refresh();
  window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Deleted' } }));
  }

  async rename(id:string,newName:string){
    // load doc, update name and save via saveNamedLineup fallback
    try{
      const doc = await loadNamedLineup(id);
      if(!doc) return;
      // delete old and save new with same data but new name and same id (simple approach for demo)
      await deleteLineup(id);
      const payload = doc.data;
      // reuse saveNamedLineup but force id by writing to localStorage map directly if PouchDB unavailable
      const db = await (await import('../services/Persistence')).getPouchDB();
      if(db){
        await db.put({ _id: id, name: newName, createdAt: new Date().toISOString(), data: payload });
      }else{
        const raw = localStorage.getItem('dice-baseball:lineups-map');
        const map = raw ? JSON.parse(raw) : {};
        map[id] = { _id: id, name: newName, createdAt: new Date().toISOString(), data: payload };
        localStorage.setItem('dice-baseball:lineups-map', JSON.stringify(map));
      }
  await this.refresh();
  window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Renamed' } }));
    }catch(e){ console.warn(e); alert('Rename failed') }
  }

  disconnectedCallback(){
    try{ window.removeEventListener('toggle-lineup', this._onToggle as EventListener); }catch(e){}
    super.disconnectedCallback();
  }

  _onToggle = (e:Event) => {
    try{ this.toggle(); }catch(err){}
  }

  toggle(){
    const isOpen = this.hasAttribute('open');
    if(isOpen) {
      this._close();
    } else {
      this._open();
    }
  }

  _open(){
    // store prior focus to return later
    try{ (this as any)._priorFocus = (document && (document.activeElement as HTMLElement)) || null; }catch(e){}
    this.setAttribute('open','');
    // small timeout so DOM is updated
    setTimeout(()=>{
      const first = this.renderRoot.querySelector('.name') as HTMLElement || this.querySelector('.name') as HTMLElement;
      if(first && typeof first.focus === 'function') first.focus();
    }, 50);
    // announce open for header button
    window.dispatchEvent(new CustomEvent('lineup-opened'));
    // set aria-hidden on main content to hide background from screen readers
    try{ const main = document.querySelector('app-shell main') as HTMLElement | null; if(main) main.setAttribute('aria-hidden','true'); }catch(e){}
    // mark dialog as modal
    try{ const panel = this.renderRoot.querySelector('.panel') as HTMLElement | null; if(panel) panel.setAttribute('aria-modal','true'); }catch(e){}
    // listen for Escape key to close and trap focus
    window.addEventListener('keydown', this._onKeydown as EventListener);
    window.addEventListener('keydown', this._onTrapTab as EventListener);
  }

  _close(){
    this.removeAttribute('open');
    // return focus to the toggle button if available
    try{
      const prior = (this as any)._priorFocus as HTMLElement | null;
      if(prior && typeof prior.focus === 'function') prior.focus();
    }catch(e){}
    window.dispatchEvent(new CustomEvent('lineup-closed'));
    // restore aria-hidden on main
    try{ const main = document.querySelector('app-shell main') as HTMLElement | null; if(main) main.removeAttribute('aria-hidden'); }catch(e){}
    // remove modal and focus handlers
    try{ const panel = this.renderRoot.querySelector('.panel') as HTMLElement | null; if(panel) panel.removeAttribute('aria-modal'); }catch(e){}
    window.removeEventListener('keydown', this._onKeydown as EventListener);
    window.removeEventListener('keydown', this._onTrapTab as EventListener);
  }

  _onKeydown = (e: KeyboardEvent) => {
    if(e.key === 'Escape' || e.key === 'Esc'){
      this._close();
    }
  }

  _onTrapTab = (e: KeyboardEvent) => {
    if(e.key !== 'Tab') return;
    const panel = this.renderRoot.querySelector('.panel') as HTMLElement | null;
    if(!panel) return;
    const focusable = panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])");
    if(!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if(e.shiftKey){
      if(document.activeElement === first){
        e.preventDefault();
        last.focus();
      }
    }else{
      if(document.activeElement === last){
        e.preventDefault();
        first.focus();
      }
    }
  }

  render(){
    const content = html`<div class="card"><label class="muted">Save name: <input class="name" .value=${this.name} @input=${(e:any)=>this.name=e.target.value}></label> <button @click=${this.saveCurrent}>Save Current</button> ${this.offline ? html`<span class="muted"> (offline)</span>` : ''}</div>
      <div class="list card">${this.items.map(i=>html`<div class="row"><div><input class="name" .value=${i.name} @change=${(e:any)=>this.rename(i.id,e.target.value)} aria-label="Rename ${i.name}"><div class="muted">${i.createdAt}</div></div><div><button @click=${()=>this.load(i.id)}>Load</button><button @click=${()=>this.deleteLineupItem(i.id)}>Delete</button></div></div>` )}</div>`;

    if(this.hasAttribute('open')){
      return html`<div><div class="backdrop" @click=${()=>this.toggle()}></div><div class="panel" role="dialog" aria-label="Lineup Manager" tabindex="-1"> <button class="close" @click=${()=>this.toggle()}>✕</button>${content}</div></div>`;
    }

    return content;
  }
}

if(!customElements.get('lineup-manager')) customElements.define('lineup-manager', LineupManager as any);
