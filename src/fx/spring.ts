/** Critically-tunable damped spring — the backbone of every wobble in the app. */
export class Spring {
  value: number;
  velocity = 0;
  target: number;

  constructor(
    initial = 0,
    public stiffness = 170,
    public damping = 14,
  ) {
    this.value = initial;
    this.target = initial;
  }

  /** Advance by dt seconds (clamped for tab-switch spikes). */
  step(dt: number): number {
    dt = Math.min(dt, 1 / 30);
    const accel = -this.stiffness * (this.value - this.target) - this.damping * this.velocity;
    this.velocity += accel * dt;
    this.value += this.velocity * dt;
    return this.value;
  }

  /** Give it a shove — used for release wobbles. */
  impulse(v: number) {
    this.velocity += v;
  }

  snap(v: number) {
    this.value = v;
    this.target = v;
    this.velocity = 0;
  }

  get settled(): boolean {
    return Math.abs(this.value - this.target) < 0.01 && Math.abs(this.velocity) < 0.01;
  }
}

/** Shared rAF ticker so every animated system steps off one clock. */
type TickFn = (dt: number, now: number) => void;
const ticks = new Set<TickFn>();
let last = performance.now();
let running = false;

function loop(now: number) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  for (const fn of ticks) fn(dt, now);
  if (ticks.size > 0) {
    requestAnimationFrame(loop);
  } else {
    running = false;
  }
}

export function onTick(fn: TickFn): () => void {
  ticks.add(fn);
  if (!running) {
    running = true;
    last = performance.now();
    requestAnimationFrame(loop);
  }
  return () => ticks.delete(fn);
}
