import { describe, it, expect } from 'vitest';
import { Ai } from '../src/entities/Ai';
import { Ball } from '../src/entities/Ball';
import { Paddle } from '../src/entities/Paddle';
import { EMPTY_INPUT } from '../src/core/input';
import { PADDLE } from '../src/config';

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

  it('does not boost with the ball at rest in midfield', () => {
    const p = new Paddle('right');
    const ai = new Ai('easy', p, noError);
    expect(ai.update(0.016, new Ball(), p).boost).toBe(false);
    expect(EMPTY_INPUT.boost).toBe(false);
  });

  function incomingBall(p: Paddle): Ball {
    const ball = new Ball();
    ball.x = p.x - 40; // close to the paddle face
    ball.y = p.y; // aligned
    ball.vx = 300; // moving toward the right paddle
    return ball;
  }

  it('hard AI boosts for a close, aligned, incoming ball when it has boost', () => {
    const p = new Paddle('right');
    p.boost = PADDLE.boostMax;
    const ai = new Ai('hard', p, noError);
    expect(ai.update(0.016, incomingBall(p), p).boost).toBe(true);
  });

  it('does not boost when the ball is moving away', () => {
    const p = new Paddle('right');
    p.boost = PADDLE.boostMax;
    const ai = new Ai('hard', p, noError);
    const ball = incomingBall(p);
    ball.vx = -300; // moving away
    expect(ai.update(0.016, ball, p).boost).toBe(false);
  });

  it('does not boost without enough boost in the meter', () => {
    const p = new Paddle('right');
    p.boost = PADDLE.boostDashCost - 1;
    const ai = new Ai('hard', p, noError);
    expect(ai.update(0.016, incomingBall(p), p).boost).toBe(false);
  });

  it('easy AI never boosts', () => {
    const p = new Paddle('right');
    p.boost = PADDLE.boostMax;
    const ai = new Ai('easy', p, noError);
    expect(ai.update(0.016, incomingBall(p), p).boost).toBe(false);
  });
});
