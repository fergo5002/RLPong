export type UpdateFn = (dt: number) => void;
export type RenderFn = (alpha: number) => void;

/**
 * Fixed-timestep loop. update() runs in fixed `step` increments for deterministic
 * physics; render() runs once per frame with an interpolation alpha. Frame time is
 * clamped to avoid a spiral of death after the tab is backgrounded.
 * Returns a stop() function.
 */
export function startLoop(update: UpdateFn, render: RenderFn, step = 1 / 120): () => void {
  let last = performance.now();
  let acc = 0;
  let raf = 0;

  const frame = (now: number) => {
    let frameTime = (now - last) / 1000;
    last = now;
    if (frameTime > 0.25) frameTime = 0.25;
    acc += frameTime;
    while (acc >= step) {
      update(step);
      acc -= step;
    }
    render(acc / step);
    raf = requestAnimationFrame(frame);
  };

  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}
