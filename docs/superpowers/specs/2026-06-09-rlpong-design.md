# RLPong — Design Spec

**Date:** 2026-06-09
**Status:** Approved
**Author:** Fergus (with Claude Code)

## Concept

Classic Pong rules and feel, dressed as a Rocket League arena. "Just Pong" at the
core — two paddles, one ball, bounce-and-score — wrapped in an RL surface: glowing
pitch, blue-vs-orange teams, boost meters, goal explosions, a supersonic ball, and
screen shake. One genuine gameplay mechanic is layered on top: **boost-dash power
hits**. Everything else is cosmetic.

## Goals & Non-Goals

**Goals**
- Faithful Pong core (vertical paddles, wall bounce, angle-by-hit-position control).
- Rocket League visual identity: neon synthwave arena, team colors, juicy game feel.
- Two modes: single-player vs a tunable AI, and local 2-player on one keyboard.
- Boots on `http://localhost:5173` via `npm run dev`.
- Pure game logic is unit-tested (TDD).
- Shipped as the public GitHub repo `fergo5002/RLPong`.

**Non-Goals (YAGNI)**
- No online multiplayer / networking.
- No accounts, persistence, or backend.
- No deep RL physics (spin, curve shots, aerials). Speed ramp + boost-dash only.
- No asset pipeline — sound is procedural (WebAudio), visuals are canvas-drawn.

## Tech Stack

- **Language:** TypeScript.
- **Bundler/dev server:** Vite (vanilla-ts template).
- **Rendering:** HTML5 Canvas 2D, hand-rolled game loop. No game engine.
- **Tests:** Vitest (pairs natively with Vite).
- **Menus/overlays:** DOM elements over the canvas (crisp text, real keyboard nav,
  accessibility) — canvas is reserved for gameplay only.

## Architecture

```
RLPong/
├─ index.html              canvas + DOM menu overlay + font links
├─ src/
│  ├─ main.ts              entry: canvas setup, instantiate Game, start loop
│  ├─ config.ts            all tunables (speeds, boost cost/regen, win score, dims)
│  ├─ core/
│  │  ├─ Game.ts           state machine + orchestrator (owns entities, score)
│  │  ├─ loop.ts           fixed-timestep loop (deterministic physics)
│  │  ├─ input.ts          keyboard → per-player InputState
│  │  └─ math.ts           clamp, lerp, vec helpers
│  ├─ entities/
│  │  ├─ Paddle.ts         move + boost meter + dash state
│  │  ├─ Ball.ts           velocity, speed ramp, trail history
│  │  └─ Ai.ts             produces InputState for a paddle (difficulty)
│  ├─ systems/
│  │  ├─ physics.ts        ball↔wall + ball↔paddle (angle by hit pos), boost impulse
│  │  ├─ particles.ts      pooled particles: trail, sparks, goal explosion
│  │  └─ audio.ts          WebAudio procedural SFX (no asset files)
│  ├─ render/
│  │  ├─ renderer.ts       arena, entities, particles, neon glow (shadowBlur)
│  │  ├─ hud.ts            score, boost meters, timer, supersonic indicator
│  │  └─ theme.ts          color tokens + fonts
│  └─ ui/menu.ts           DOM overlay: mode/difficulty select, pause, game-over
└─ tests/                  Vitest unit tests for all pure logic
```

**Why fixed-timestep:** deterministic physics → testable and stable regardless of
frame rate. The loop accumulates real elapsed time and steps the simulation in fixed
increments (e.g. 1/120 s), rendering with interpolation between steps.

## Components (units & responsibilities)

- **`config.ts`** — single source of truth for tunables. No logic. Imported everywhere.
- **`core/math.ts`** — `clamp`, `lerp`, vector helpers. Pure, fully unit-tested.
- **`core/input.ts`** — listens to keydown/keyup, exposes an immutable `InputState`
  per player (`up`, `down`, `boost`, plus menu keys). Prevents default on Space/arrows.
- **`core/loop.ts`** — `start(update, render)` running a fixed-timestep accumulator on
  `requestAnimationFrame`. Knows nothing about game specifics.
- **`entities/Paddle.ts`** — owns `y`, velocity, boost meter (0–100), dash state +
  timer. `update(dt, input)` moves within bounds, consumes/regenerates boost, triggers
  a dash. Exposes whether it is mid-dash (for power-hit detection).
- **`entities/Ball.ts`** — owns position, velocity, current speed, and a short trail
  history. `update(dt)` integrates motion. Exposes `isSupersonic`.
- **`entities/Ai.ts`** — given ball + paddle state, returns an `InputState` for the AI
  paddle. Difficulty = reaction lag + target error + max tracking speed.
- **`systems/physics.ts`** — pure functions: reflect ball off top/bottom walls; resolve
  ball↔paddle collision computing rebound angle from hit offset; apply speed ramp (cap);
  apply boost-dash impulse on a power hit; detect goals (ball past a goal line).
- **`systems/particles.ts`** — fixed-size pooled particle system: ball trail, wall
  sparks, goal explosion bursts. `emit(...)`, `update(dt)`, exposes particles to render.
- **`systems/audio.ts`** — procedural WebAudio SFX (hit, wall, boost, goal, supersonic).
  Lazily initialized on first user gesture (autoplay policy). No-op if unavailable.
- **`render/theme.ts`** — color tokens + font constants (see Visual Identity).
- **`render/renderer.ts`** — draws arena (field lines, center circle, goals), paddles,
  ball + trail, particles; applies neon glow via `shadowBlur`; applies screen shake +
  CRT/vignette overlays (gated on reduced-motion).
- **`render/hud.ts`** — score (Orbitron), per-side boost meters, match timer, supersonic
  indicator (JetBrains Mono, tabular figures).
- **`core/Game.ts`** — the state machine and orchestrator. Owns entities, score, mode,
  difficulty. `update(dt)` advances the active state; dispatches to physics/particles;
  handles scoring, re-serve, win. Exposes state to renderer/hud.
- **`ui/menu.ts`** — DOM overlay for mode select (vs AI / 2P), difficulty, pause, and
  game-over/rematch. Drives `Game` state transitions; keyboard-navigable.

## Mechanics

- Paddles move vertically, clamped to the field. Ball reflects off top/bottom walls.
- **Hit angle:** rebound angle is a function of where the ball strikes the paddle —
  center = near-flat, edges = sharp. This is the primary control, classic Pong.
- **Speed ramp:** ball speed increases a fixed step per paddle hit, capped at a max.
  Above a threshold the ball is **supersonic** (hot glow, intensified trail, speed lines).
- **Boost-dash:** each side has a boost meter that regenerates over time. Pressing boost
  triggers a short lunge toward center. If the paddle strikes the ball while dashing, it
  is a **power hit** — extra ball speed, large particle burst, screen shake. The dash
  consumes boost and has a cooldown via the meter, so it cannot be spammed.
- **Goal:** when the ball passes a goal line — goal explosion at that goal, flash, screen
  shake, score increment, then a 3-2-1 countdown re-serve from center toward the side
  that was scored on.
- **Win:** first side to `WIN_SCORE` (default **7**, in `config.ts`) → game-over screen
  with the winner and a rematch option.

## Modes & Controls

- **vs AI:** P2 paddle is driven by `Ai.ts`. Difficulty (Easy/Normal/Hard) adjusts
  reaction lag, aim error, and tracking speed.
- **Local 2-player:** both paddles human-controlled on one keyboard.
- **Controls:**
  - P1 (blue, left): `W` / `S` move, `Left Shift` or `Space` boost.
  - P2 (orange, right): `↑` / `↓` move, `Right Shift` boost.
  - `Esc` pause/resume, `Enter` confirm in menus.
  - Default-scroll on `Space`/arrows is prevented.

## Visual Identity (Retro-Futurism / synthwave-neon)

Grounded in the ui-ux-pro-max design database (style: Retro-Futurism; arcade/gaming).

- **Colors (theme tokens):**
  - Team blue (P1): `#2563EB` / glow `#3B82F6`.
  - Team orange (P2): `#F97316` / glow `#FB923C`.
  - Arena background: deep navy (~`#0A0E1A`), glowing field lines a desaturated blue-grey.
  - Ball: white `#F8FAFC`, neon glow; supersonic shifts toward cyan-hot.
  - Accent/score-positive: green.
- **Fonts:** Orbitron (700/900) for score + menu headings; JetBrains Mono (400/500) for
  HUD readouts (boost %, timer) — tabular figures prevent layout jitter.
- **Effects:** neon glow via `shadowBlur` on paddles/ball/lines; team-colored goal
  explosions; ball trail; subtle CRT scanlines + vignette overlay.
- **Motion safety:** screen shake, scanlines, and heavy particle bursts respect
  `prefers-reduced-motion` (reduced or disabled when requested).

## Data Flow & State Machine

```
Input (keyboard) ─┐
                  ├─► InputState[P1]   ─┐
AI (vs-AI mode) ──┴─► InputState[P2]   ─┤
                                        ▼
            Game.update(dt):  paddles.update → ball.update →
            physics.resolve (walls, paddle collisions, goals) →
            particles.update → score/winners/re-serve
                                        ▼
            renderer.draw(state) + hud.draw(state)  (every frame, interpolated)
```

**States:** `MENU → COUNTDOWN → PLAYING → GOAL (brief) → COUNTDOWN → … → GAMEOVER → MENU`.
Pause overlays PLAYING without leaving it.

## Error Handling

- **WebAudio unavailable / blocked:** `audio.ts` degrades to a silent no-op; gameplay
  unaffected.
- **Fonts not yet loaded:** canvas text falls back to a system monospace; no crash.
- **Tab backgrounded / huge frame gap:** the loop clamps max accumulated time per frame
  to avoid a "spiral of death"; simulation skips ahead safely.
- **Reduced-motion preference:** detected once and honored throughout.

## Testing Strategy (TDD)

Write a failing test before each piece of production logic. Vitest covers the pure layer:

- **math:** `clamp`, `lerp` edge cases.
- **physics:** wall reflection flips the correct velocity component; paddle reflection
  angle scales with hit offset (center flat, edges steep); speed ramp increments and
  caps; boost impulse adds the expected extra speed; goal detection fires past goal line.
- **Paddle:** movement clamps to field bounds; boost consume on dash + regen over time;
  dash window opens then closes; cannot dash on empty boost.
- **Ball:** integrates position from velocity; `isSupersonic` flips at threshold; trail
  history bounded.
- **Ai:** output moves the paddle toward the ball's y within bounds; converges over time;
  harder difficulty tracks faster / with less error.
- **Game:** scoring increments the correct side; win fires at `WIN_SCORE`; entities reset
  to serve positions after a goal.

Canvas/DOM rendering is not unit-tested; it is verified by booting the app, plus a smoke
test that `Game` constructs and steps N fixed updates without throwing.

## Repo & Deployment

1. Project at `C:\Dev\RLPong`, `git init` (done).
2. Scaffold Vite vanilla-ts, add Vitest, implement per the plan.
3. `README.md` with controls, modes, and run instructions.
4. Create public GitHub repo `fergo5002/RLPong` via `gh repo create`; push `main`.
5. `npm run dev` → open `http://localhost:5173` to verify the game boots and plays.
