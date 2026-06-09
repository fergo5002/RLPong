import { COLORS } from './theme';
import { FIELD, PADDLE, BALL } from '../config';
import type { Game } from '../core/Game';
import type { Paddle } from '../entities/Paddle';
import type { Ball } from '../entities/Ball';
import type { Particles } from '../systems/particles';

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawArena(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  ctx.save();
  ctx.strokeStyle = COLORS.fieldLine;
  ctx.lineWidth = 3;
  ctx.shadowColor = COLORS.fieldLine;
  ctx.shadowBlur = 12;
  ctx.strokeRect(8, 8, FIELD.width - 16, FIELD.height - 16);
  ctx.setLineDash([12, 16]);
  ctx.beginPath();
  ctx.moveTo(FIELD.width / 2, 8);
  ctx.lineTo(FIELD.width / 2, FIELD.height - 8);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(FIELD.width / 2, FIELD.height / 2, 70, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawGoals(ctx: CanvasRenderingContext2D): void {
  const goalH = PADDLE.height * 2.4;
  const y = (FIELD.height - goalH) / 2;
  ctx.save();
  ctx.lineWidth = 4;
  ctx.shadowBlur = 20;
  ctx.strokeStyle = COLORS.blueGlow;
  ctx.shadowColor = COLORS.blueGlow;
  ctx.strokeRect(2, y, 8, goalH);
  ctx.strokeStyle = COLORS.orangeGlow;
  ctx.shadowColor = COLORS.orangeGlow;
  ctx.strokeRect(FIELD.width - 10, y, 8, goalH);
  ctx.restore();
}

function drawPaddle(
  ctx: CanvasRenderingContext2D,
  p: Paddle,
  color: string,
  glow: string,
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = glow;
  ctx.shadowBlur = p.isDashing ? 40 : 22;
  roundRect(ctx, p.x - PADDLE.width / 2, p.y - PADDLE.height / 2, PADDLE.width, PADDLE.height, 6);
  ctx.fill();
  ctx.restore();
}

function drawBall(ctx: CanvasRenderingContext2D, ball: Ball): void {
  const color = ball.isSupersonic ? COLORS.ballSupersonic : COLORS.ball;
  ctx.save();
  for (let i = 0; i < ball.trail.length; i++) {
    const t = ball.trail[i];
    const a = (i + 1) / ball.trail.length;
    ctx.globalAlpha = a * 0.45;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(t.x, t.y, BALL.radius * a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = ball.isSupersonic ? 40 : 20;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particles): void {
  ctx.save();
  for (const p of particles.active) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function render(ctx: CanvasRenderingContext2D, game: Game, particles: Particles): void {
  drawArena(ctx);
  drawGoals(ctx);
  drawParticles(ctx, particles);
  drawPaddle(ctx, game.left, COLORS.blue, COLORS.blueGlow);
  drawPaddle(ctx, game.right, COLORS.orange, COLORS.orangeGlow);
  drawBall(ctx, game.ball);
}
