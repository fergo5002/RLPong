import { describe, it, expect } from 'vitest';
import { Particles } from '../src/systems/particles';

describe('Particles', () => {
  it('emits the requested number of particles', () => {
    const ps = new Particles();
    ps.emitBurst(100, 100, '#fff', 20, 200);
    expect(ps.active.length).toBe(20);
  });

  it('removes particles once their life expires', () => {
    const ps = new Particles();
    ps.emitBurst(100, 100, '#fff', 10, 200);
    ps.update(10); // far longer than any particle's max life
    expect(ps.active.length).toBe(0);
  });

  it('advances particle positions', () => {
    const ps = new Particles();
    ps.emitBurst(100, 100, '#fff', 1, 200);
    const p = ps.active[0];
    const x0 = p.x;
    ps.update(0.05);
    expect(p.x).not.toBe(x0);
  });
});
