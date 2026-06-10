import { describe, it, expect } from 'vitest';
import { Paddle } from '../src/entities/Paddle';
import { PADDLE, FIELD } from '../src/config';
import { EMPTY_INPUT } from '../src/core/input';

describe('Paddle', () => {
  it('left paddle sits at its margin, right paddle mirrored', () => {
    expect(new Paddle('left').homeX).toBe(PADDLE.margin);
    expect(new Paddle('right').homeX).toBe(FIELD.width - PADDLE.margin);
  });

  it('moves down on down input', () => {
    const p = new Paddle('left');
    const y0 = p.y;
    p.update(0.1, { up: false, down: true, boost: false });
    expect(p.y).toBeGreaterThan(y0);
  });

  it('clamps to field bounds', () => {
    const p = new Paddle('left');
    for (let i = 0; i < 200; i++) p.update(0.1, { up: true, down: false, boost: false });
    expect(p.y).toBe(PADDLE.height / 2);
    for (let i = 0; i < 200; i++) p.update(0.1, { up: false, down: true, boost: false });
    expect(p.y).toBe(FIELD.height - PADDLE.height / 2);
  });

  it('dashes and consumes boost', () => {
    const p = new Paddle('left');
    p.boost = PADDLE.boostMax;
    p.update(0.016, { up: false, down: false, boost: true });
    expect(p.isDashing).toBe(true);
    expect(p.boost).toBeLessThan(PADDLE.boostMax);
  });

  it('cannot dash without enough boost', () => {
    const p = new Paddle('left');
    p.boost = PADDLE.boostDashCost - 1;
    p.update(0.016, { up: false, down: false, boost: true });
    expect(p.isDashing).toBe(false);
  });

  it('regenerates boost over time', () => {
    const p = new Paddle('left');
    p.boost = 0;
    p.update(1, EMPTY_INPUT);
    expect(p.boost).toBeCloseTo(PADDLE.boostRegen, 1);
  });

  it('ends the dash after its duration', () => {
    const p = new Paddle('left');
    p.boost = PADDLE.boostMax;
    p.update(0.016, { up: false, down: false, boost: true });
    for (let i = 0; i < 60; i++) p.update(0.016, EMPTY_INPUT);
    expect(p.isDashing).toBe(false);
    expect(p.x).toBe(p.homeX);
  });

  it('recenter resets position, boost, and dash', () => {
    const p = new Paddle('left');
    p.y = 10;
    p.boost = 0;
    p.dashTimer = 0.1;
    p.recenter();
    expect(p.y).toBe(FIELD.height / 2);
    expect(p.prevY).toBe(FIELD.height / 2);
    expect(p.x).toBe(p.homeX);
    expect(p.boost).toBe(PADDLE.boostMax);
    expect(p.isDashing).toBe(false);
  });
});
