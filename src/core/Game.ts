import { Ball } from '../entities/Ball';
import { Paddle, type Side } from '../entities/Paddle';
import { Ai, type Difficulty } from '../entities/Ai';
import { bounceWalls, collidePaddle, detectGoal } from '../systems/physics';
import { FIELD, MATCH } from '../config';
import type { InputState } from './input';

export type GameState = 'menu' | 'countdown' | 'playing' | 'gameover';
export type Mode = 'ai' | 'two-player';

export interface MatchEvents {
  onWall?: () => void;
  onPaddle?: (power: boolean, x: number, y: number) => void;
  onGoal?: (scorer: Side, x: number, y: number) => void;
  onSupersonic?: () => void;
}

export class Game {
  state: GameState = 'menu';
  mode: Mode = 'ai';
  difficulty: Difficulty = 'normal';
  scoreLeft = 0;
  scoreRight = 0;
  winner: Side | null = null;
  countdown = 0;
  elapsed = 0;
  paused = false;

  readonly ball = new Ball();
  readonly left = new Paddle('left');
  readonly right = new Paddle('right');
  events: MatchEvents = {};

  private ai: Ai;
  private serveDir = 1;
  private wasSupersonic = false;

  constructor() {
    this.ai = new Ai(this.difficulty, this.right);
  }

  start(mode: Mode, difficulty: Difficulty = 'normal'): void {
    this.mode = mode;
    this.difficulty = difficulty;
    this.ai.setDifficulty(difficulty);
    this.scoreLeft = 0;
    this.scoreRight = 0;
    this.winner = null;
    this.elapsed = 0;
    this.paused = false;
    this.serveDir = 1;
    this.resetPositions();
    this.beginCountdown();
  }

  togglePause(): void {
    if (this.state === 'playing') this.paused = !this.paused;
  }

  /** Abandon the current match and return to the main menu (resets the state machine). */
  returnToMenu(): void {
    this.state = 'menu';
    this.paused = false;
    this.winner = null;
    this.resetPositions();
  }

  private resetPositions(): void {
    this.left.recenter();
    this.right.recenter();
  }

  private beginCountdown(): void {
    this.state = 'countdown';
    this.countdown = MATCH.countdownSeconds;
    this.ball.serve(this.serveDir);
  }

  update(dt: number, p1: InputState, p2: InputState): void {
    if (this.state === 'countdown') {
      this.countdown -= dt;
      if (this.countdown <= 0) this.state = 'playing';
      return;
    }
    if (this.state !== 'playing' || this.paused) return;

    this.elapsed += dt;
    const rightInput = this.mode === 'ai' ? this.ai.update(dt, this.ball, this.right) : p2;
    this.left.update(dt, p1);
    this.right.update(dt, rightInput);
    this.ball.update(dt);

    if (bounceWalls(this.ball)) this.events.onWall?.();

    for (const paddle of [this.left, this.right]) {
      const hit = collidePaddle(this.ball, paddle);
      if (hit.hit) this.events.onPaddle?.(hit.power, this.ball.x, this.ball.y);
    }

    if (this.ball.isSupersonic && !this.wasSupersonic) this.events.onSupersonic?.();
    this.wasSupersonic = this.ball.isSupersonic;

    const scorer = detectGoal(this.ball);
    if (scorer) this.handleGoal(scorer);
  }

  private handleGoal(scorer: Side): void {
    const goalX = scorer === 'left' ? FIELD.width : 0;
    if (scorer === 'left') this.scoreLeft++;
    else this.scoreRight++;
    this.events.onGoal?.(scorer, goalX, this.ball.y);
    // serve toward the side that conceded
    this.serveDir = scorer === 'left' ? 1 : -1;

    if (this.scoreLeft >= MATCH.winScore || this.scoreRight >= MATCH.winScore) {
      this.winner = this.scoreLeft > this.scoreRight ? 'left' : 'right';
      this.state = 'gameover';
    } else {
      this.resetPositions();
      this.beginCountdown();
    }
  }
}
