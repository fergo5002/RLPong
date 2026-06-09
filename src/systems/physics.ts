import { BALL, FIELD, PADDLE } from '../config';
import { clamp } from '../core/math';
import type { Ball } from '../entities/Ball';
import type { Paddle, Side } from '../entities/Paddle';

/** Reflect the ball off the top/bottom walls. Returns true if it bounced. */
export function bounceWalls(ball: Ball): boolean {
  if (ball.y - BALL.radius <= 0) {
    ball.y = BALL.radius;
    ball.vy = Math.abs(ball.vy);
    return true;
  }
  if (ball.y + BALL.radius >= FIELD.height) {
    ball.y = FIELD.height - BALL.radius;
    ball.vy = -Math.abs(ball.vy);
    return true;
  }
  return false;
}

export interface PaddleHit {
  hit: boolean;
  power: boolean;
}

/** Resolve ball↔paddle collision; mutate the ball; report whether a (power) hit occurred. */
export function collidePaddle(ball: Ball, paddle: Paddle): PaddleHit {
  const left = paddle.x - PADDLE.width / 2;
  const right = paddle.x + PADDLE.width / 2;
  const withinX = ball.x + BALL.radius >= left && ball.x - BALL.radius <= right;
  const withinY = ball.y >= paddle.top - BALL.radius && ball.y <= paddle.bottom + BALL.radius;
  if (!withinX || !withinY) return { hit: false, power: false };

  const movingToward = paddle.side === 'left' ? ball.vx < 0 : ball.vx > 0;
  if (!movingToward) return { hit: false, power: false };

  const offset = clamp((ball.y - paddle.y) / (PADDLE.height / 2), -1, 1);
  const angle = offset * BALL.maxBounceAngle;
  const power = paddle.isDashing;

  ball.speed = clamp(
    ball.speed + BALL.speedStep + (power ? BALL.powerHitBonus : 0),
    BALL.startSpeed,
    BALL.maxSpeed,
  );

  const dir = paddle.side === 'left' ? 1 : -1;
  ball.vx = Math.cos(angle) * ball.speed * dir;
  ball.vy = Math.sin(angle) * ball.speed;
  // nudge the ball clear of the paddle to prevent a re-collision next frame
  ball.x = paddle.side === 'left' ? right + BALL.radius : left - BALL.radius;

  return { hit: true, power };
}

/** Which side SCORED if the ball crossed a goal line, else null. */
export function detectGoal(ball: Ball): Side | null {
  if (ball.x + BALL.radius < 0) return 'right';
  if (ball.x - BALL.radius > FIELD.width) return 'left';
  return null;
}
