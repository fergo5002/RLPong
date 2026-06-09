import type { Game, Mode } from '../core/Game';
import type { Difficulty } from '../entities/Ai';

export interface MenuCallbacks {
  onStart: (mode: Mode, difficulty: Difficulty) => void;
  onResume: () => void;
}

/** DOM overlay for the main menu, pause, and game-over screens. */
export class Menu {
  private root: HTMLElement;
  private difficulty: Difficulty = 'normal';

  constructor(
    parent: HTMLElement,
    private game: Game,
    private cb: MenuCallbacks,
  ) {
    this.root = document.createElement('div');
    this.root.className = 'menu';
    parent.appendChild(this.root);
    this.renderMain();
  }

  private button(label: string, onClick: () => void, variant = 'primary'): HTMLButtonElement {
    const b = document.createElement('button');
    b.textContent = label;
    b.className = `btn btn-${variant}`;
    b.addEventListener('click', onClick);
    return b;
  }

  private clear(): void {
    this.root.innerHTML = '';
  }

  show(): void {
    this.root.style.display = 'flex';
  }
  hide(): void {
    this.root.style.display = 'none';
  }

  renderMain(): void {
    this.clear();
    const title = document.createElement('h1');
    title.className = 'title';
    title.textContent = 'RLPONG';
    const sub = document.createElement('p');
    sub.className = 'subtitle';
    sub.textContent = 'Rocket League × Pong';

    const diffLabel = document.createElement('p');
    diffLabel.className = 'label';
    diffLabel.textContent = 'AI DIFFICULTY';

    const diffRow = document.createElement('div');
    diffRow.className = 'row';
    (['easy', 'normal', 'hard'] as Difficulty[]).forEach((d) => {
      const b = this.button(
        d.toUpperCase(),
        () => {
          this.difficulty = d;
          this.renderMain();
        },
        this.difficulty === d ? 'active' : 'ghost',
      );
      diffRow.appendChild(b);
    });

    const startAi = this.button('PLAY vs AI', () => this.cb.onStart('ai', this.difficulty));
    const start2p = this.button(
      'LOCAL 2-PLAYER',
      () => this.cb.onStart('two-player', this.difficulty),
      'secondary',
    );

    const controls = document.createElement('p');
    controls.className = 'controls';
    controls.innerHTML =
      'P1: <b>W</b>/<b>S</b> move · <b>Space</b>/<b>L-Shift</b> boost<br>' +
      'P2: <b>↑</b>/<b>↓</b> move · <b>R-Shift</b> boost<br>' +
      '<b>Esc</b> pause';

    this.root.append(title, sub, diffLabel, diffRow, startAi, start2p, controls);
    this.show();
  }

  renderPause(): void {
    this.clear();
    const h = document.createElement('h2');
    h.className = 'title';
    h.textContent = 'PAUSED';
    const resume = this.button('RESUME', () => this.cb.onResume());
    const quit = this.button('MAIN MENU', () => this.renderMain(), 'secondary');
    this.root.append(h, resume, quit);
    this.show();
  }

  renderGameOver(): void {
    this.clear();
    const winner = this.game.winner === 'left' ? 'BLUE' : 'ORANGE';
    const h = document.createElement('h2');
    h.className = 'title';
    h.textContent = `${winner} WINS`;
    const score = document.createElement('p');
    score.className = 'subtitle';
    score.textContent = `${this.game.scoreLeft} — ${this.game.scoreRight}`;
    const again = this.button('REMATCH', () =>
      this.cb.onStart(this.game.mode, this.game.difficulty),
    );
    const menu = this.button('MAIN MENU', () => this.renderMain(), 'secondary');
    this.root.append(h, score, again, menu);
    this.show();
  }
}
