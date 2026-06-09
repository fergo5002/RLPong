import { describe, it, expect } from 'vitest';
import { Ai } from '../src/entities/Ai';
import { Ball } from '../src/entities/Ball';
import { Paddle } from '../src/entities/Paddle';
import { EMPTY_INPUT } from '../src/core/input';

const noError = () => 0.5; // (0.5*2-1)=0 → aims exactly at the ball

describe('Ai', () => {
  it('moves up when the ball is above the paddle', () => {
    const p = new Paddle('right');
    const ai = new Ai('normal', p, noError);
    const ball = new Ball();
    ball.y = p.y - 100;
    const input = ai.update(0.016, ball, p);
    expect(input.up).toBe(true);
    expect(input.down).toBe(false);
  });

  it('moves down when the ball is below the paddle', () => {
    const p = new Paddle('right');
    const ai = new Ai('normal', p, noError);
    const ball = new Ball();
    ball.y = p.y + 100;
    const input = ai.update(0.016, ball, p);
    expect(input.down).toBe(true);
    expect(input.up).toBe(false);
  });

  it('holds still when aligned with the ball', () => {
    const p = new Paddle('right');
    const ai = new Ai('normal', p, noError);
    const ball = new Ball();
    ball.y = p.y;
    const input = ai.update(0.016, ball, p);
    expect(input.up).toBe(false);
    expect(input.down).toBe(false);
  });

  it('converges the paddle toward the ball over time', () => {
    const p = new Paddle('right');
    const ai = new Ai('hard', p, noError);
    const ball = new Ball();
    ball.y = 100;
    const startGap = Math.abs(p.y - ball.y);
    for (let i = 0; i < 120; i++) p.update(0.016, ai.update(0.016, ball, p));
    expect(Math.abs(p.y - ball.y)).toBeLessThan(startGap);
  });

  it('never asks for boost', () => {
    const p = new Paddle('right');
    const ai = new Ai('easy', p, noError);
    expect(ai.update(0.016, new Ball(), p).boost).toBe(false);
    expect(EMPTY_INPUT.boost).toBe(false);
  });
});
