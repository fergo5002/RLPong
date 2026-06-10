import { describe, it, expect } from 'vitest';
import { Ball } from '../src/entities/Ball';
import { BALL, FIELD } from '../src/config';

describe('Ball', () => {
  it('starts centered', () => {
    const b = new Ball();
    expect(b.x).toBe(FIELD.width / 2);
    expect(b.y).toBe(FIELD.height / 2);
  });

  it('integrates position from velocity', () => {
    const b = new Ball();
    b.x = 100;
    b.y = 100;
    b.vx = 50;
    b.vy = -20;
    b.update(0.5);
    expect(b.x).toBeCloseTo(125);
    expect(b.y).toBeCloseTo(90);
  });

  it('caps trail length', () => {
    const b = new Ball();
    b.vx = 10;
    for (let i = 0; i < BALL.trailLength + 10; i++) b.update(0.016);
    expect(b.trail.length).toBe(BALL.trailLength);
  });

  it('serve resets speed and aims in the given direction', () => {
    const b = new Ball();
    b.serve(1);
    expect(Math.hypot(b.vx, b.vy)).toBeCloseTo(BALL.startSpeed, 1);
    expect(b.vx).toBeGreaterThan(0);
    expect(b.x).toBe(FIELD.width / 2);
    b.serve(-1);
    expect(b.vx).toBeLessThan(0);
  });

  it('flags supersonic above threshold', () => {
    const b = new Ball();
    b.speed = BALL.supersonicSpeed - 1;
    expect(b.isSupersonic).toBe(false);
    b.speed = BALL.supersonicSpeed;
    expect(b.isSupersonic).toBe(true);
  });

  it('captures the previous position for interpolation', () => {
    const b = new Ball();
    b.x = 200;
    b.y = 150;
    b.vx = 40;
    b.vy = 10;
    b.update(0.5);
    expect(b.prevX).toBe(200);
    expect(b.prevY).toBe(150);
    expect(b.x).toBeCloseTo(220);
  });

  it('serve aligns prev position with current (no spurious streak)', () => {
    const b = new Ball();
    b.serve(1);
    expect(b.prevX).toBe(b.x);
    expect(b.prevY).toBe(b.y);
  });
});
