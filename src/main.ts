import { Game, type Mode } from './core/Game';
import { startLoop } from './core/loop';
import { InputManager } from './core/input';
import { Particles } from './systems/particles';
import { Audio } from './systems/audio';
import { render } from './render/renderer';
import { drawHud } from './render/hud';
import { Menu } from './ui/menu';
import { COLORS } from './render/theme';
import { FIELD } from './config';
import type { Difficulty } from './entities/Ai';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const app = document.getElementById('app')!;
const live = document.getElementById('sr')!;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const game = new Game();
const particles = new Particles();
const audio = new Audio();
const input = new InputManager();

// Scale the canvas backing store to the displayed size × devicePixelRatio so the
// glow-heavy arena stays crisp on any monitor; gameplay stays in logical 960×540 coords.
let scaleX = 1;
let scaleY = 1;
function resize(): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cssW = canvas.clientWidth || FIELD.width;
  const cssH = canvas.clientHeight || FIELD.height;
  canvas.width = Math.max(1, Math.round(cssW * dpr));
  canvas.height = Math.max(1, Math.round(cssH * dpr));
  scaleX = canvas.width / FIELD.width;
  scaleY = canvas.height / FIELD.height;
}
window.addEventListener('resize', resize);

let shake = 0;
function addShake(amount: number): void {
  if (reducedMotion) return;
  shake = Math.min(shake + amount, 18);
}

// Particle counts: trimmed hard when the user prefers reduced motion.
const pcount = (n: number): number => (reducedMotion ? Math.ceil(n * 0.2) : n);

game.events = {
  onWall: () => audio.wall(),
  onPaddle: (power, x, y) => {
    audio.hit(power);
    const color = x < FIELD.width / 2 ? COLORS.blueGlow : COLORS.orangeGlow;
    particles.emitBurst(x, y, color, pcount(power ? 26 : 10), power ? 360 : 180);
    if (power) addShake(10);
  },
  onGoal: (scorer, x, y) => {
    audio.goal();
    const color = scorer === 'left' ? COLORS.blueGlow : COLORS.orangeGlow;
    particles.emitBurst(x, y, color, pcount(80), 480);
    addShake(16);
    live.textContent = `${scorer === 'left' ? 'Blue' : 'Orange'} scores. Blue ${game.scoreLeft}, Orange ${game.scoreRight}.`;
  },
  onSupersonic: () => audio.supersonic(),
};

function startMatch(mode: Mode, difficulty: Difficulty): void {
  audio.init();
  particles.clear();
  game.start(mode, difficulty);
  menu.hide();
  canvas.focus();
}

const menu = new Menu(app, game, {
  onStart: (mode, difficulty) => startMatch(mode, difficulty),
  onResume: () => {
    game.togglePause();
    menu.hide();
    canvas.focus();
  },
  onMenu: () => {
    game.returnToMenu();
    particles.clear();
    menu.renderMain();
  },
});

input.onConfirm = () => {
  if (game.state === 'menu' || game.state === 'gameover') startMatch(game.mode, game.difficulty);
};
input.onPause = () => {
  if (game.state !== 'playing') return;
  game.togglePause();
  if (game.paused) menu.renderPause();
  else {
    menu.hide();
    canvas.focus();
  }
};

// Auto-pause when the tab is backgrounded so a player never loses a rally while away.
document.addEventListener('visibilitychange', () => {
  if (document.hidden && game.state === 'playing' && !game.paused) {
    game.togglePause();
    menu.renderPause();
  }
});

let lastState = game.state;
function syncMenu(): void {
  if (game.state === lastState) return;
  lastState = game.state;
  if (game.state === 'gameover') {
    const w = game.winner === 'left' ? 'Blue' : 'Orange';
    live.textContent = `${w} wins, ${game.scoreLeft} to ${game.scoreRight}.`;
    menu.renderGameOver();
  } else if (game.state === 'menu') {
    menu.renderMain();
  }
}

function tick(dt: number): void {
  game.update(dt, input.player1(), input.player2());
  if ((game.state === 'playing' || game.state === 'countdown') && !game.paused) {
    particles.update(dt);
  }
  shake *= 0.86;
  syncMenu();
}

function draw(alpha: number): void {
  const shx = shake > 0.3 ? (Math.random() * 2 - 1) * shake : 0;
  const shy = shake > 0.3 ? (Math.random() * 2 - 1) * shake : 0;
  ctx.setTransform(scaleX, 0, 0, scaleY, shx * scaleX, shy * scaleY);
  render(ctx, game, particles, alpha, reducedMotion);
  drawHud(ctx, game);
}

// Wait for web fonts (with a timeout) so the HUD never pops from a fallback font,
// then start the loop.
async function boot(): Promise<void> {
  try {
    if (document.fonts?.ready) {
      await Promise.race([
        document.fonts.ready,
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ]);
    }
  } catch {
    /* fonts API unavailable — proceed with system fallback */
  }
  resize();
  startLoop(tick, draw);
}

void boot();
