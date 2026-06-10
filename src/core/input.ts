export interface InputState {
  up: boolean;
  down: boolean;
  boost: boolean;
}

export const EMPTY_INPUT: InputState = { up: false, down: false, boost: false };

/** True when a focusable control (button/input) currently has focus. */
function isInteractiveFocused(target: Window): boolean {
  const el = target.document?.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'BUTTON' || tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || tag === 'A';
}

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
      // Don't steal keys (Space/arrows scroll suppression, Enter/Esc shortcuts) while a
      // form control has focus — that would break native button activation in the menu.
      if (isInteractiveFocused(target)) {
        this.keys.add(e.code);
        return;
      }
      if (['ArrowUp', 'ArrowDown', ' ', 'Spacebar'].includes(e.key)) e.preventDefault();
      if (!this.keys.has(e.code)) {
        if (e.code === 'Enter') this.onConfirm?.();
        if (e.code === 'Escape') this.onPause?.();
      }
      this.keys.add(e.code);
    });
    target.addEventListener('keyup', (e) => this.keys.delete(e.code));
    // Releasing keys is never delivered after focus loss; clear so paddles don't stick.
    target.addEventListener('blur', () => this.keys.clear());
    target.document?.addEventListener('visibilitychange', () => {
      if (target.document.hidden) this.keys.clear();
    });
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
