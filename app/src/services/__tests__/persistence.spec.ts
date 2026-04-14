import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as Persistence from '../Persistence';

describe('Persistence localStorage fallback', () => {
  beforeEach(() => {
    // clear keys used by Persistence
    window.localStorage.removeItem('dice-baseball:lineups-map');
    window.localStorage.removeItem('dice-baseball:lineups');
  });

  it('saveLineupsLocal / loadLineupsLocal roundtrip', () => {
    const payload = { a: 1 };
    const ok = Persistence.saveLineupsLocal(payload);
    expect(ok).toBe(true);
    const loaded = Persistence.loadLineupsLocal();
    expect(loaded).toEqual(payload);
  });

  it('saveNamedLineup, listLineups, loadNamedLineup, deleteLineup (local fallback)', async () => {
    // force getPouchDB to return null to exercise localStorage fallback
    const spy = vi.spyOn(Persistence, 'getPouchDB').mockResolvedValue(null as any);

    const payload = { lineupA: [{ id: 'A1' }], lineupH: [{ id: 'H1' }] };
    const rec = await Persistence.saveNamedLineup('Team X', payload);
    expect(rec).toHaveProperty('id');
    expect(rec.name).toBe('Team X');

    const list = await Persistence.listLineups();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBe(1);
    expect(list[0].name).toBe('Team X');

    const loaded = await Persistence.loadNamedLineup(rec.id);
    expect(loaded).not.toBeNull();
    expect(loaded!.data).toEqual(payload);

    const del = await Persistence.deleteLineup(rec.id);
    expect(del).toBeTruthy();

    const list2 = await Persistence.listLineups();
    expect(list2.length).toBe(0);

    spy.mockRestore();
  });
});
