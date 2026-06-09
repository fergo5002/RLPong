import { Game } from './core/Game';
import { startLoop } from './core/loop';
import { InputManager } from './core/input';
import { Particles } from './systems/particles';
import { Audio } from './systems/audio';
import { render } from './render/renderer';
import { drawHud } from './render/hud';
import { Menu } from './ui/menu';
import { COLORS } from './render/theme';
import { FIELD } from './config';

const canvas = document.getElementById('game') as HTMLCanvasElement;
canvas.width = FIELD.width;
canvas.height = FIELD.height;
const ctx = canvas.getContext('2d')!;

const app = document.getElementById('app')!;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const game = new Game();
const particles = new Particles();
const audio = new Audio();
const input = new InputManager();

let shake = 0;
function addShake(amount: number): void {
  if (reducedMotion) return;
  shake = Math.min(shake + amount, 18);
}

game.events = {
  onWall: () => audio.wall(),
  onPaddle: (power, x, y) => {
    audio.hit(power);
    const color = x < FIELD.width / 2 ? COLORS.blueGlow : COLORS.orangeGlow;
    particles.emitBurst(x, y, color, power ? 26 : 10, power ? 360 : 180);
    if (power) addShake(10);
  },
  onGoal: (scorer, x, y) => {
    audio.goal();
    const color = scorer === 'left' ? COLORS.blueGlow : COLORS.orangeGlow;
    particles.emitBurst(x, y, color, 80, 480);
    addShake(16);
  },
  onSupersonic: () => audio.supersonic(),
};

const menu = new Menu(app, game, {
  onStart: (mode, difficulty) => {
    audio.init();
    particles.clear();
    game.start(mode, difficulty);
    menu.hide();
  },
  onResume: () => {
    game.togglePause();
    menu.hide();
  },
});

input.onConfirm = () => {
  if (game.state === 'menu' || game.state === 'gameover') {
    game.start(game.mode, game.difficulty);
    menu.hide();
  }
};
input.onPause = () => {
  if (game.state === 'playing') {
    game.togglePause();
    if (game.paused) menu.renderPause();
    else menu.hide();
  }
};

let lastState = game.state;
function syncMenu(): void {
  if (game.state === lastState) return;
  lastState = game.state;
  if (game.state === 'gameover') menu.renderGameOver();
  else if (game.state === 'menu') menu.renderMain();
}

startLoop(
  (dt) => {
    const p2 = input.player2();
    game.update(dt, input.player1(), p2);
    if (!game.paused) particles.update(dt);
    shake *= 0.86;
    syncMenu();
  },
  () => {
    ctx.save();
    if (shake > 0.3) {
      ctx.translate((Math.random() * 2 - 1) * shake, (Math.random() * 2 - 1) * shake);
    }
    render(ctx, game, particles);
    drawHud(ctx, game);
    ctx.restore();
  },
);
