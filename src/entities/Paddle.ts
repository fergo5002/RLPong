import { PADDLE, FIELD } from '../config';
import { clamp } from '../core/math';
import type { InputState } from '../core/input';

export type Side = 'left' | 'right';

export class Paddle {
  y = FIELD.height / 2;
  vy = 0;
  x: number;
  readonly homeX: number;
  readonly dir: number; // +1 = left paddle lunges right; -1 = right paddle lunges left
  boost: number = PADDLE.boostMax;
  dashTimer = 0;

  constructor(public readonly side: Side) {
    if (side === 'left') {
      this.homeX = PADDLE.margin;
      this.dir = 1;
    } else {
      this.homeX = FIELD.width - PADDLE.margin;
      this.dir = -1;
    }
    this.x = this.homeX;
  }

  get isDashing(): boolean {
    return this.dashTimer > 0;
  }
  get top(): number {
    return this.y - PADDLE.height / 2;
  }
  get bottom(): number {
    return this.y + PADDLE.height / 2;
  }

  private tryDash(): void {
    if (this.dashTimer <= 0 && this.boost >= PADDLE.boostDashCost) {
      this.dashTimer = PADDLE.dashDuration;
      this.boost -= PADDLE.boostDashCost;
    }
  }

  update(dt: number, input: InputState): void {
    const move = (input.down ? 1 : 0) - (input.up ? 1 : 0);
    this.vy = move * PADDLE.speed;
    const half = PADDLE.height / 2;
    this.y = clamp(this.y + this.vy * dt, half, FIELD.height - half);

    if (input.boost) this.tryDash();

    if (this.dashTimer > 0) {
      this.dashTimer = Math.max(0, this.dashTimer - dt);
      // triangle lunge profile: 0 → reach → 0 over the dash
      const t = this.dashTimer / PADDLE.dashDuration; // 1 → 0
      this.x = this.homeX + this.dir * PADDLE.dashReach * Math.sin(t * Math.PI);
    } else {
      this.x = this.homeX;
    }

    this.boost = clamp(this.boost + PADDLE.boostRegen * dt, 0, PADDLE.boostMax);
  }
}
