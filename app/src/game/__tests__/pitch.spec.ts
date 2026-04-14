import { describe, it, expect } from 'vitest';
import PlayerAttributes from '../../models/PlayerAttributes';
import { computePitchOutcome, PitchContext } from '../Pitch';

function baseContext(attrs?: PlayerAttributes): PitchContext {
  return {
    pitcher: { attributes: attrs || new PlayerAttributes('R', 80, 70, 60, 70, 10, 85, 50, 45) },
    location: 'neutral',
    stakes: 'regular',
    weather: 'clear',
    pitchCount: 0,
  };
}

describe('computePitchOutcome - partials', () => {
  it('higher pitching stat increases pitchEffectiveness', () => {
    const low = baseContext(new PlayerAttributes('R', 50, 50, 50, 50, 10, 50, 40, 40));
    const high = baseContext(new PlayerAttributes('R', 80, 80, 80, 80, 10, 90, 60, 60));

    const oLow = computePitchOutcome(low);
    const oHigh = computePitchOutcome(high);

    expect(oHigh.pitchEffectiveness).toBeGreaterThan(oLow.pitchEffectiveness);
  });

  it('home location slightly increases effectiveness vs away', () => {
    const ctxHome = baseContext();
    ctxHome.location = 'home';
    const ctxAway = baseContext();
    ctxAway.location = 'away';

    const oHome = computePitchOutcome(ctxHome);
    const oAway = computePitchOutcome(ctxAway);
    expect(oHome.pitchEffectiveness).toBeGreaterThan(oAway.pitchEffectiveness);
  });

  it('higher stakes slightly reduce effectiveness', () => {
    const reg = baseContext();
    const ws = baseContext();
    ws.stakes = 'worldseries';
    const oReg = computePitchOutcome(reg);
    const oWS = computePitchOutcome(ws);
    expect(oReg.pitchEffectiveness).toBeGreaterThan(oWS.pitchEffectiveness);
  });

  it('bad weather reduces effectiveness', () => {
    const clear = baseContext();
    const rainy = baseContext();
    rainy.weather = 'rain';
    expect(computePitchOutcome(clear).pitchEffectiveness).toBeGreaterThan(computePitchOutcome(rainy).pitchEffectiveness);
  });

  it('stamina penalty reduces effectiveness after many pitches', () => {
    const fresh = baseContext();
    fresh.pitchCount = 20;
    const tired = baseContext();
    tired.pitchCount = 120;
    expect(computePitchOutcome(fresh).pitchEffectiveness).toBeGreaterThan(computePitchOutcome(tired).pitchEffectiveness);
  });
});

describe('computePitchOutcome - combined behaviours', () => {
  it('produces contactProbability in 0..1 and powerFactor in 0..1', () => {
    const ctx = baseContext();
    const out = computePitchOutcome(ctx);
    expect(out.contactProbability).toBeGreaterThanOrEqual(0);
    expect(out.contactProbability).toBeLessThanOrEqual(1);
    expect(out.powerFactor).toBeGreaterThanOrEqual(0);
    expect(out.powerFactor).toBeLessThanOrEqual(1);
    expect(out.pitchEffectiveness).toBeGreaterThanOrEqual(0);
    expect(out.pitchEffectiveness).toBeLessThanOrEqual(1);
  });

  it('contactProbability inversely correlates with pitchEffectiveness', () => {
    const ctxGood = baseContext(new PlayerAttributes('R', 70, 70, 60, 70, 10, 95, 50, 50));
    const ctxBad = baseContext(new PlayerAttributes('R', 70, 70, 60, 70, 10, 40, 50, 50));

    const oGood = computePitchOutcome(ctxGood);
    const oBad = computePitchOutcome(ctxBad);

    expect(oGood.pitchEffectiveness).toBeGreaterThan(oBad.pitchEffectiveness);
    expect(oGood.contactProbability).toBeLessThan(oBad.contactProbability);
  });
});
