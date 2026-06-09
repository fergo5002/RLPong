export interface InputState {
  up: boolean;
  down: boolean;
  boost: boolean;
}

export const EMPTY_INPUT: InputState = { up: false, down: false, boost: false };

/**
 * Tracks held keys and exposes per-player InputState.
 * onConfirm/onPause fire once per physical key press (Enter / Escape).
 */
export class InputManager {
  private keys = new Set<string>();
  onConfirm?: () => void;
  onPause?: () => void;

  constructor(target: Window = window) {
    target.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', ' ', 'Spacebar'].includes(e.key)) e.preventDefault();
      if (!this.keys.has(e.code)) {
        if (e.code === 'Enter') this.onConfirm?.();
        if (e.code === 'Escape') this.onPause?.();
      }
      this.keys.add(e.code);
    });
    target.addEventListener('keyup', (e) => this.keys.delete(e.code));
  }

  player1(): InputState {
    return {
      up: this.keys.has('KeyW'),
      down: this.keys.has('KeyS'),
      boost: this.keys.has('ShiftLeft') || this.keys.has('Space'),
    };
  }

  player2(): InputState {
    return {
      up: this.keys.has('ArrowUp'),
      down: this.keys.has('ArrowDown'),
      boost: this.keys.has('ShiftRight'),
    };
  }
}
