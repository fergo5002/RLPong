import { BALL, FIELD } from '../config';

export interface TrailPoint {
  x: number;
  y: number;
}

export class Ball {
  x = FIELD.width / 2;
  y = FIELD.height / 2;
  vx = 0;
  vy = 0;
  speed: number = BALL.startSpeed;
  trail: TrailPoint[] = [];

  get isSupersonic(): boolean {
    return this.speed >= BALL.supersonicSpeed;
  }

  /** Reset to center and launch toward direction (-1 = left, +1 = right). */
  serve(direction: number): void {
    this.x = FIELD.width / 2;
    this.y = FIELD.height / 2;
    this.speed = BALL.startSpeed;
    const angle = (Math.random() * 2 - 1) * BALL.serveSpread;
    this.vx = Math.cos(angle) * this.speed * direction;
    this.vy = Math.sin(angle) * this.speed;
    this.trail = [];
  }

  update(dt: number): void {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > BALL.trailLength) this.trail.shift();
  }
}
