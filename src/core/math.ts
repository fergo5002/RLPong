export const clamp = (v: number, min: number, max: number): number =>
  v < min ? min : v > max ? max : v;

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const sign = (v: number): number => (v < 0 ? -1 : v > 0 ? 1 : 0);
