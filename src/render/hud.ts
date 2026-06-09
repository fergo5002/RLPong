import { COLORS, FONTS } from './theme';
import { FIELD, PADDLE } from '../config';
import type { Game } from '../core/Game';

function formatTime(seconds: number): string {
  const s = Math.floor(seconds);
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function drawBoostBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  value: number,
  color: string,
): void {
  const w = 150;
  const h = 10;
  const y = FIELD.height - 26;
  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.globalAlpha = 1;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.fillRect(x, y, (w * value) / PADDLE.boostMax, h);
  ctx.restore();
}

export function drawHud(ctx: CanvasRenderingContext2D, game: Game): void {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // Score
  ctx.font = `900 60px ${FONTS.display}`;
  ctx.fillStyle = COLORS.blueGlow;
  ctx.fillText(String(game.scoreLeft), FIELD.width / 2 - 70, 74);
  ctx.fillStyle = COLORS.orangeGlow;
  ctx.fillText(String(game.scoreRight), FIELD.width / 2 + 70, 74);

  // Match timer
  ctx.font = `500 18px ${FONTS.mono}`;
  ctx.fillStyle = COLORS.textDim;
  ctx.fillText(formatTime(game.elapsed), FIELD.width / 2, 38);

  // Boost meters
  drawBoostBar(ctx, 24, game.left.boost, COLORS.blue);
  drawBoostBar(ctx, FIELD.width - 24 - 150, game.right.boost, COLORS.orange);

  // Countdown overlay
  if (game.state === 'countdown') {
    ctx.font = `900 120px ${FONTS.display}`;
    ctx.fillStyle = COLORS.text;
    ctx.shadowColor = COLORS.text;
    ctx.shadowBlur = 24;
    ctx.fillText(String(Math.ceil(game.countdown)), FIELD.width / 2, FIELD.height / 2 + 44);
  }

  ctx.restore();
}
