export const FIELD = {
  width: 960,
  height: 540,
} as const;

export const PADDLE = {
  width: 16,
  height: 96,
  margin: 36, // distance of paddle face from the wall
  speed: 480, // px/s vertical
  boostMax: 100,
  boostRegen: 18, // per second
  boostDashCost: 40,
  dashDuration: 0.18, // seconds
  dashReach: 90, // max px the paddle face lunges toward center
} as const;

export const BALL = {
  radius: 10,
  startSpeed: 360, // px/s
  speedStep: 28, // added per paddle hit
  maxSpeed: 900,
  supersonicSpeed: 720,
  maxBounceAngle: Math.PI / 3, // 60° max rebound
  trailLength: 14,
  serveSpread: Math.PI / 6, // ± vertical spread on serve (30°)
  powerHitBonus: 140, // extra speed on a boosted power hit
} as const;

export const MATCH = {
  winScore: 7,
  countdownSeconds: 3,
} as const;

// `error` is the ± vertical aiming error in px. The ball contact tolerance is
// paddle_half + ball_radius = 58px, so `error` must exceed ~58 for a well-placed
// shot to ever beat the AI. `boosts` gates whether the tier uses the dash power-hit.
export const AI_DIFFICULTY = {
  easy: { reaction: 0.28, error: 160, boosts: false },
  normal: { reaction: 0.18, error: 110, boosts: true },
  hard: { reaction: 0.1, error: 78, boosts: true },
} as const;
