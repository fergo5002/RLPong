import { describe, it, expect } from 'vitest';
import { Game } from '../src/core/Game';
import { EMPTY_INPUT } from '../src/core/input';
import { FIELD, BALL, MATCH } from '../src/config';

function toPlaying(g: Game): void {
  g.start('two-player');
  g.update(MATCH.countdownSeconds + 0.01, EMPTY_INPUT, EMPTY_INPUT); // clear countdown
  expect(g.state).toBe('playing');
}

describe('Game', () => {
  it('starts in the menu', () => {
    expect(new Game().state).toBe('menu');
  });

  it('start() zeroes the score and enters countdown', () => {
    const g = new Game();
    g.start('ai', 'hard');
    expect(g.scoreLeft).toBe(0);
    expect(g.scoreRight).toBe(0);
    expect(g.state).toBe('countdown');
  });

  it('countdown transitions to playing', () => {
    const g = new Game();
    g.start('two-player');
    g.update(MATCH.countdownSeconds + 0.01, EMPTY_INPUT, EMPTY_INPUT);
    expect(g.state).toBe('playing');
  });

  it('does not advance the ball while paused', () => {
    const g = new Game();
    toPlaying(g);
    g.togglePause();
    const x = g.ball.x;
    g.update(0.1, EMPTY_INPUT, EMPTY_INPUT);
    expect(g.ball.x).toBe(x);
  });

  it('awards a point to the correct side and re-serves', () => {
    const g = new Game();
    toPlaying(g);
    g.ball.x = FIELD.width + BALL.radius + 5; // past the right goal
    g.ball.y = 5; // away from paddles
    g.ball.vx = 300;
    g.update(0.016, EMPTY_INPUT, EMPTY_INPUT);
    expect(g.scoreLeft).toBe(1);
    expect(g.scoreRight).toBe(0);
    expect(g.state).toBe('countdown'); // re-serving
  });

  it('ends the match at the win score', () => {
    const g = new Game();
    toPlaying(g);
    g.scoreLeft = MATCH.winScore - 1;
    g.ball.x = FIELD.width + BALL.radius + 5;
    g.ball.y = 5;
    g.update(0.016, EMPTY_INPUT, EMPTY_INPUT);
    expect(g.state).toBe('gameover');
    expect(g.winner).toBe('left');
  });

  it('returnToMenu resets the state machine', () => {
    const g = new Game();
    toPlaying(g);
    g.togglePause();
    g.scoreLeft = 4;
    g.returnToMenu();
    expect(g.state).toBe('menu');
    expect(g.paused).toBe(false);
    expect(g.winner).toBeNull();
  });
});
