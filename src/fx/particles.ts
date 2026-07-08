import { onTick } from './spring';

/**
 * One full-screen particle canvas shared by the whole app: foil sparks while
 * tearing, glitter bursts on rare reveals, ambient shimmer on the open flash.
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
  sat: number;
  light: number;
  gravity: number;
  drag: number;
  twinkle: boolean;
}

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
const particles: Particle[] = [];
let stopTick: (() => void) | null = null;

function ensureCanvas() {
  if (canvas) return;
  canvas = document.createElement('canvas');
  canvas.id = 'fx-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d')!;
  const resize = () => {
    canvas!.width = innerWidth * devicePixelRatio;
    canvas!.height = innerHeight * devicePixelRatio;
  };
  resize();
  addEventListener('resize', resize);
}

function startLoop() {
  if (stopTick) return;
  stopTick = onTick((dt) => {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const dpr = devicePixelRatio;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      p.vy += p.gravity * dt;
      p.vx *= 1 - p.drag * dt;
      p.vy *= 1 - p.drag * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const t = p.life / p.maxLife;
      const flick = p.twinkle ? 0.55 + 0.45 * Math.sin(p.life * 40 + p.x) : 1;
      ctx.globalAlpha = Math.min(1, t * 1.6) * flick;
      ctx.fillStyle = `hsl(${p.hue} ${p.sat}% ${p.light}%)`;
      const s = p.size * (0.4 + t * 0.6) * dpr;
      ctx.beginPath();
      // 4-point star sparkle
      const x = p.x * dpr;
      const y = p.y * dpr;
      ctx.moveTo(x, y - s);
      ctx.quadraticCurveTo(x, y, x + s, y);
      ctx.quadraticCurveTo(x, y, x, y + s);
      ctx.quadraticCurveTo(x, y, x - s, y);
      ctx.quadraticCurveTo(x, y, x, y - s);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (particles.length === 0 && stopTick) {
      stopTick();
      stopTick = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  });
}

export interface BurstOptions {
  count?: number;
  speed?: number;
  spread?: number;
  /** Base direction in radians; default: all directions. */
  angle?: number;
  hue?: number | (() => number);
  gravity?: number;
  size?: number;
  life?: number;
}

export function burst(x: number, y: number, opts: BurstOptions = {}) {
  ensureCanvas();
  const {
    count = 24,
    speed = 260,
    spread = Math.PI * 2,
    angle = -Math.PI / 2,
    hue = () => 40 + Math.random() * 20,
    gravity = 420,
    size = 5,
    life = 0.9,
  } = opts;
  for (let i = 0; i < count; i++) {
    const a = angle + (Math.random() - 0.5) * spread;
    const sp = speed * (0.35 + Math.random() * 0.65);
    particles.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      life: life * (0.5 + Math.random() * 0.5),
      maxLife: life,
      size: size * (0.5 + Math.random()),
      hue: typeof hue === 'function' ? hue() : hue,
      sat: 90,
      light: 55 + Math.random() * 35,
      gravity,
      drag: 1.6,
      twinkle: Math.random() < 0.6,
    });
  }
  startLoop();
}

/** Rainbow glitter — used on the holo/mythic reveal. */
export function rainbowBurst(x: number, y: number, count = 90) {
  burst(x, y, {
    count,
    speed: 420,
    spread: Math.PI * 2,
    hue: () => Math.random() * 360,
    gravity: 240,
    size: 6,
    life: 1.4,
  });
}

/** Tight golden spark trail — follows the finger while tearing. */
export function tearSparks(x: number, y: number, dir: number) {
  burst(x, y, {
    count: 4,
    speed: 150,
    spread: 1.2,
    angle: dir,
    hue: () => 38 + Math.random() * 18,
    gravity: 500,
    size: 3.5,
    life: 0.5,
  });
}
