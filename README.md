# RLPong

**Rocket League × Pong** — classic Pong wrapped in a Rocket League arena: neon pitch,
blue-vs-orange teams, boost-dash power hits, a supersonic ball, goal explosions, and
screen shake. "Just Pong" at the core, RL on the surface.

Built with TypeScript + Vite + HTML5 Canvas. No game engine.

## Play

```bash
npm install
npm run dev
```

Then open **http://localhost:5173**.

## Controls

|                         | Move        | Boost                    |
| ----------------------- | ----------- | ------------------------ |
| **P1 (blue, left)**     | `W` / `S`   | `Space` or `Left Shift`  |
| **P2 (orange, right)**  | `↑` / `↓`   | `Right Shift`            |

`Esc` pause · `Enter` start / rematch. First to **7** goals wins.

## Modes

- **vs AI** — Easy / Normal / Hard (tunable reaction time and aim error).
- **Local 2-player** — two players on one keyboard.

## Develop

```bash
npm test       # run the unit test suite (Vitest)
npm run build  # typecheck + production build
```

## Architecture

Pure game logic (`src/core`, `src/entities`, `src/systems/physics`) is engine-agnostic
and unit-tested. A fixed-timestep loop drives deterministic updates; rendering, audio,
input, and menus are thin glue over the canvas/DOM.

```
src/
  config.ts        tunable constants
  core/            math, input, fixed-timestep loop, Game state machine
  entities/        Ball, Paddle (boost-dash), Ai
  systems/         physics, particles, procedural WebAudio
  render/          theme tokens, canvas renderer, HUD
  ui/              DOM menu / pause / game-over overlay
  main.ts          wiring
```

Motion (screen shake, heavy particles) respects `prefers-reduced-motion`.
