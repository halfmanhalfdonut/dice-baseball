// Lightweight persistence wrapper: prefer PouchDB if available in the monorepo, fall back to localStorage.
export async function getPouchDB(){
  try{
    // Try fetching the bundled PouchDB script from the host repo at runtime.
    try{
      const resp = await fetch('../../src/services/PouchDB/PouchDB.js');
      if(resp && resp.ok){
        const code = await resp.text();
        const blob = new Blob([code], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        try{
          // import the UMD bundle so it attaches to global scope
          await import(/* @vite-ignore */ url);
          // @ts-ignore
          const PouchDB = (window as any).PouchDB || (globalThis as any).PouchDB;
          if(!PouchDB) return null;
          const db = new PouchDB('dice-baseball-app');
          URL.revokeObjectURL(url);
          return db;
        }catch(e){
          URL.revokeObjectURL(url);
          return null;
        }
      }
    }catch(e){
      // fall through to return null
    }
    return null;
  }catch(e){
    return null;
  }
}

async function ensureDoc(db:any, id:string){
  try{
    const doc = await db.get(id);
    return doc;
  }catch(err:any){
    if(err && err.status === 404) return null;
    throw err;
  }
}

export async function saveLineupsPouch(payload:any){
  const db = await getPouchDB();
  if(!db) throw new Error('no-pouch');
  const id = 'lineups';
  const existing = await ensureDoc(db, id);
  if(existing){
    const out = Object.assign({}, existing, { data: payload });
    return db.put(out);
  }else{
    return db.put({ _id: id, data: payload });
  }
}

export async function loadLineupsPouch(){
  const db = await getPouchDB();
  if(!db) return null;
  try{
    const doc = await db.get('lineups');
    return doc.data;
  }catch(e){
    return null;
  }
}

// Named lineup CRUD (PouchDB or localStorage fallback)
export async function saveNamedLineup(name:string, payload:any){
  const db = await getPouchDB();
  const id = `lineup:${Date.now()}`;
  const record = { _id: id, name, createdAt: new Date().toISOString(), data: payload };
  if(db){
    return db.put(record).then(()=>({ id, ...record }));
  }
  // fallback: localStorage map
  try{
    const raw = localStorage.getItem('dice-baseball:lineups-map');
    const map = raw ? JSON.parse(raw) : {};
    map[id] = record;
    localStorage.setItem('dice-baseball:lineups-map', JSON.stringify(map));
    return { id, ...record };
  }catch(e){ throw e }
}

export async function listLineups(){
  const db = await getPouchDB();
  if(db){
    const res = await db.allDocs({ include_docs: true, startkey: 'lineup:', endkey: 'lineup:\ufff0' });
    return res.rows.map((r:any)=>({ id: r.id, name: r.doc.name, createdAt: r.doc.createdAt }));
  }
  try{
    const raw = localStorage.getItem('dice-baseball:lineups-map');
    const map = raw ? JSON.parse(raw) : {};
    return Object.keys(map).map(k=>({ id: k, name: map[k].name, createdAt: map[k].createdAt }));
  }catch(e){ return [] }
}

export async function loadNamedLineup(id:string){
  const db = await getPouchDB();
  if(db){
    try{
      const doc = await db.get(id);
      return { id: doc._id, name: doc.name, createdAt: doc.createdAt, data: doc.data };
    }catch(e){ return null }
  }
  try{
    const raw = localStorage.getItem('dice-baseball:lineups-map');
    const map = raw ? JSON.parse(raw) : {};
    const doc = map[id];
    return doc ? { id, name: doc.name, createdAt: doc.createdAt, data: doc.data } : null;
  }catch(e){ return null }
}

export async function deleteLineup(id:string){
  const db = await getPouchDB();
  if(db){
    try{
      const doc = await db.get(id);
      return db.remove(doc);
    }catch(e){ return null }
  }
  try{
    const raw = localStorage.getItem('dice-baseball:lineups-map');
    const map = raw ? JSON.parse(raw) : {};
    delete map[id];
    localStorage.setItem('dice-baseball:lineups-map', JSON.stringify(map));
    return true;
  }catch(e){ return null }
}

// LocalStorage fallback
export function saveLineupsLocal(payload:any){
  try{ localStorage.setItem('dice-baseball:lineups', JSON.stringify(payload)); return true }catch(e){ return false }
}

export function loadLineupsLocal(){
  try{ const raw = localStorage.getItem('dice-baseball:lineups'); return raw ? JSON.parse(raw) : null }catch(e){ return null }
}
