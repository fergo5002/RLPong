import { AI_DIFFICULTY, PADDLE } from '../config';
import type { InputState } from '../core/input';
import type { Ball } from './Ball';
import type { Paddle } from './Paddle';

export type Difficulty = keyof typeof AI_DIFFICULTY;

const DEADZONE = 8; // px tolerance to avoid jitter

export class Ai {
  private timeSinceReact: number;
  private targetY: number;

  constructor(
    private difficulty: Difficulty,
    paddle: Paddle,
    private rng: () => number = Math.random,
  ) {
    this.targetY = paddle.y;
    this.timeSinceReact = AI_DIFFICULTY[difficulty].reaction; // react on first update
  }

  setDifficulty(d: Difficulty): void {
    this.difficulty = d;
  }

  /** Dash for a power hit when aligned with a close, incoming ball (difficulty-gated). */
  private wantsBoost(ball: Ball, paddle: Paddle): boolean {
    const cfg = AI_DIFFICULTY[this.difficulty];
    if (!cfg.boosts || paddle.boost < PADDLE.boostDashCost) return false;
    const approaching = paddle.side === 'right' ? ball.vx > 0 : ball.vx < 0;
    const aligned = Math.abs(ball.y - paddle.y) < PADDLE.height / 2;
    const near = Math.abs(ball.x - paddle.x) < PADDLE.dashReach + 60;
    return approaching && aligned && near;
  }

  update(dt: number, ball: Ball, paddle: Paddle): InputState {
    const cfg = AI_DIFFICULTY[this.difficulty];
    this.timeSinceReact += dt;
    if (this.timeSinceReact >= cfg.reaction) {
      this.timeSinceReact = 0;
      this.targetY = ball.y + (this.rng() * 2 - 1) * cfg.error;
    }
    return {
      up: paddle.y - this.targetY > DEADZONE,
      down: this.targetY - paddle.y > DEADZONE,
      boost: this.wantsBoost(ball, paddle),
    };
  }
}
