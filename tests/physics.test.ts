import { describe, it, expect } from 'vitest';
import { bounceWalls, collidePaddle, detectGoal } from '../src/systems/physics';
import { Ball } from '../src/entities/Ball';
import { Paddle } from '../src/entities/Paddle';
import { BALL, FIELD, PADDLE } from '../src/config';

describe('bounceWalls', () => {
  it('reflects off the top wall', () => {
    const b = new Ball();
    b.y = BALL.radius - 1;
    b.vy = -100;
    expect(bounceWalls(b)).toBe(true);
    expect(b.vy).toBeGreaterThan(0);
    expect(b.y).toBe(BALL.radius);
  });
  it('reflects off the bottom wall', () => {
    const b = new Ball();
    b.y = FIELD.height - BALL.radius + 1;
    b.vy = 100;
    expect(bounceWalls(b)).toBe(true);
    expect(b.vy).toBeLessThan(0);
  });
  it('does nothing in open space', () => {
    const b = new Ball();
    b.y = FIELD.height / 2;
    b.vy = 100;
    expect(bounceWalls(b)).toBe(false);
    expect(b.vy).toBe(100);
  });
});

describe('collidePaddle', () => {
  function ballAt(paddle: Paddle): Ball {
    const b = new Ball();
    b.x = paddle.x; // overlapping the face
    b.y = paddle.y; // dead center
    b.vx = paddle.side === 'left' ? -200 : 200; // moving toward the paddle
    b.vy = 0;
    return b;
  }

  it('reflects the ball outward and adds speed', () => {
    const p = new Paddle('left');
    const b = ballAt(p);
    const before = b.speed;
    const hit = collidePaddle(b, p);
    expect(hit.hit).toBe(true);
    expect(b.vx).toBeGreaterThan(0); // now moving right, away from left paddle
    expect(b.speed).toBeCloseTo(before + BALL.speedStep, 1);
  });

  it('angles up when struck above center', () => {
    const p = new Paddle('left');
    const b = ballAt(p);
    b.y = p.y - PADDLE.height / 2; // top edge
    collidePaddle(b, p);
    expect(b.vy).toBeLessThan(0);
  });

  it('ignores a ball moving away from the paddle', () => {
    const p = new Paddle('left');
    const b = ballAt(p);
    b.vx = 200; // moving right, away from left paddle
    expect(collidePaddle(b, p).hit).toBe(false);
  });

  it('marks a power hit while dashing and adds the bonus', () => {
    const p = new Paddle('left');
    p.dashTimer = PADDLE.dashDuration; // dashing
    const b = ballAt(p);
    const before = b.speed;
    const hit = collidePaddle(b, p);
    expect(hit.power).toBe(true);
    expect(b.speed).toBeCloseTo(before + BALL.speedStep + BALL.powerHitBonus, 1);
  });
});

describe('detectGoal', () => {
  it('right scores when ball passes the left goal', () => {
    const b = new Ball();
    b.x = -BALL.radius - 1;
    expect(detectGoal(b)).toBe('right');
  });
  it('left scores when ball passes the right goal', () => {
    const b = new Ball();
    b.x = FIELD.width + BALL.radius + 1;
    expect(detectGoal(b)).toBe('left');
  });
  it('returns null while ball is in play', () => {
    const b = new Ball();
    expect(detectGoal(b)).toBeNull();
  });
});
