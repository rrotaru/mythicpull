import type { PackDefinition } from '../data/types';

/**
 * Bakes the booster wrapper artwork onto offscreen canvases — key art,
 * foil-gradient background, crimped seals, brand/title/subtitle text and the
 * back barcode are all rendered into the texture itself (nothing is a DOM
 * overlay). The 3D wrapper then crops these masters into per-slice canvases.
 *
 * Never read back from these canvases (toDataURL/getImageData): key art may
 * be cross-origin without CORS headers, which taints them. drawImage from a
 * tainted canvas is still allowed, so crop-by-drawImage keeps working.
 */

export const TEX_W = 640;
export const TEX_H = 1032; // TEX_W / 0.62 pack aspect

export interface WrapperArt {
  keyArt: HTMLImageElement | null;
  /** Optional official flat booster scan; replaces the procedural front. */
  wrapper: HTMLImageElement | null;
}

const CRIMP = 0.052; // crimp band height, fraction of texture height

export function bakeWrapperTextures(
  pack: PackDefinition,
  art: WrapperArt,
): { front: HTMLCanvasElement; back: HTMLCanvasElement } {
  return {
    front: bakeFace(pack, art, true),
    back: bakeFace(pack, art, false),
  };
}

function bakeFace(pack: PackDefinition, art: WrapperArt, isFront: boolean): HTMLCanvasElement {
  const W = TEX_W;
  const H = TEX_H;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;
  const rand = mulberry(hash(pack.id + (isFront ? ':front' : ':back')));

  if (isFront && art.wrapper) {
    drawCover(ctx, art.wrapper, 0, 0, W, H, 0.5);
    curvatureShading(ctx, W, H);
    return c;
  }

  // foil-gradient base
  const bg = ctx.createLinearGradient(0, 0, W * 0.55, H);
  bg.addColorStop(0, mix(pack.accentSecondary, '#16102c', 0.5));
  bg.addColorStop(0.34, '#171030');
  bg.addColorStop(0.68, mix(pack.accent, '#120d24', 0.3));
  bg.addColorStop(1, '#0d0920');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // key art window between the crimps, fading into the wrapper
  if (art.keyArt) {
    drawCover(ctx, art.keyArt, 0, H * CRIMP, W, H * (1 - 2 * CRIMP), 0.3);
    ctx.filter = 'none';
    const topFade = ctx.createLinearGradient(0, H * CRIMP, 0, H * 0.32);
    topFade.addColorStop(0, 'rgba(13,9,32,0.92)');
    topFade.addColorStop(1, 'rgba(13,9,32,0)');
    ctx.fillStyle = topFade;
    ctx.fillRect(0, H * CRIMP, W, H * (0.32 - CRIMP));
    const botFade = ctx.createLinearGradient(0, H * 0.5, 0, H * 0.85);
    botFade.addColorStop(0, 'rgba(13,9,32,0)');
    botFade.addColorStop(1, 'rgba(13,9,32,0.96)');
    ctx.fillStyle = botFade;
    ctx.fillRect(0, H * 0.5, W, H * 0.5);
  }

  // brand line
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  const brandSize = 0.036 * W;
  ctx.font = `600 ${brandSize.toFixed(1)}px 'Segoe UI', system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = 'rgba(255,240,210,0.92)';
  withShadow(ctx, 'rgba(0,0,0,0.85)', 8, 2, () => {
    drawTracked(ctx, 'MYTHICPULL', W / 2, H * 0.095, brandSize * 0.42);
  });

  // title, auto-shrunk to fit, gradient-filled like foil stamping
  const title = pack.name.toUpperCase();
  let titleSize = 0.088 * W;
  const titleFont = (s: number) => `700 ${s.toFixed(1)}px Georgia, 'Times New Roman', serif`;
  ctx.font = titleFont(titleSize);
  while (trackedWidth(ctx, title, titleSize * 0.12) > W * 0.92 && titleSize > 0.04 * W) {
    titleSize *= 0.95;
    ctx.font = titleFont(titleSize);
  }
  const titleY = H * (isFront ? 0.862 : 0.83);
  const tg = ctx.createLinearGradient(0, titleY - titleSize, 0, titleY + titleSize * 0.2);
  tg.addColorStop(0.25, '#fff6d8');
  tg.addColorStop(1, pack.accent);
  ctx.fillStyle = tg;
  withShadow(ctx, 'rgba(0,0,0,0.9)', 10, 3, () => {
    drawTracked(ctx, title, W / 2, titleY, titleSize * 0.12);
  });

  // subtitle
  const count = pack.cards.length || 14;
  const subSize = 0.03 * W;
  ctx.font = `500 ${subSize.toFixed(1)}px 'Segoe UI', system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = 'rgba(232,228,240,0.78)';
  withShadow(ctx, 'rgba(0,0,0,0.9)', 6, 1.5, () => {
    drawTracked(
      ctx,
      isFront ? `PLAY BOOSTER · ${count} CARDS` : `${count} GAME CARDS`,
      W / 2,
      H * (isFront ? 0.895 : 0.862),
      subSize * 0.3,
    );
  });

  if (!isFront) barcode(ctx, W, H, rand);

  crimpBand(ctx, W, 0, H * CRIMP, pack.accent, rand, true);
  crimpBand(ctx, W, H * (1 - CRIMP), H * CRIMP, pack.accent, rand, false);

  curvatureShading(ctx, W, H);
  return c;
}

/* ------------------------------------------------------------------ */

/** Crimped foil seal: crinkle stripes, weld line, fold shadow, teeth. */
function crimpBand(
  ctx: CanvasRenderingContext2D,
  W: number,
  y: number,
  h: number,
  accent: string,
  rand: () => number,
  isTop: boolean,
): void {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  const outer = mix(accent, '#241a3e', 0.42);
  if (isTop) {
    g.addColorStop(0, outer);
    g.addColorStop(1, '#151026');
  } else {
    g.addColorStop(0, '#151026');
    g.addColorStop(1, outer);
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, y, W, h);

  // vertical crinkle stripes with jittered widths
  let x = 0;
  while (x < W) {
    const w = 2 + rand() * 3;
    const a = 0.05 + rand() * 0.15;
    ctx.fillStyle = rand() < 0.5 ? `rgba(255,255,255,${a.toFixed(3)})` : `rgba(0,0,0,${(a + 0.1).toFixed(3)})`;
    ctx.fillRect(x, y, w, h);
    x += w + 1 + rand() * 2.5;
  }

  // bright weld line on the outer edge, dark fold line where the seal meets the body
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.fillRect(0, isTop ? y : y + h - 2, W, 2);
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, isTop ? y + h - 1.5 : y, W, 1.5);

  // serrated shadow teeth where the crimp folds over the body
  const toothW = W * 0.04;
  const amp = h * 0.16;
  const edge = isTop ? y + h : y;
  const dir = isTop ? 1 : -1;
  ctx.beginPath();
  ctx.moveTo(0, edge);
  for (let tx = 0; tx < W; tx += toothW) {
    ctx.lineTo(tx + toothW / 2, edge + dir * amp);
    ctx.lineTo(tx + toothW, edge);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(0,0,0,0.32)';
  ctx.fill();
}

function barcode(ctx: CanvasRenderingContext2D, W: number, H: number, rand: () => number): void {
  const bw = W * 0.42;
  const bh = H * 0.042;
  const bx = (W - bw) / 2;
  const by = H * 0.888;
  ctx.fillStyle = '#e2e2e2';
  ctx.fillRect(bx - 8, by - 6, bw + 16, bh + 12);
  ctx.fillStyle = '#101010';
  let x = bx;
  while (x < bx + bw - 3) {
    const w = 1.5 + rand() * 3.5;
    ctx.fillRect(x, by, w, bh);
    x += w + 1.5 + rand() * 3;
  }
}

/** Baked ambient shading: side wrap-around darkening, a soft vertical
 *  highlight, and top/bottom falloff matching the 3D taper. */
function curvatureShading(ctx: CanvasRenderingContext2D, W: number, H: number): void {
  const left = ctx.createLinearGradient(0, 0, W * 0.1, 0);
  left.addColorStop(0, 'rgba(0,0,0,0.38)');
  left.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = left;
  ctx.fillRect(0, 0, W * 0.1, H);

  const right = ctx.createLinearGradient(W, 0, W * 0.9, 0);
  right.addColorStop(0, 'rgba(0,0,0,0.38)');
  right.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = right;
  ctx.fillRect(W * 0.9, 0, W * 0.1, H);

  const mid = ctx.createLinearGradient(0, 0, W, 0);
  mid.addColorStop(0.3, 'rgba(255,255,255,0)');
  mid.addColorStop(0.5, 'rgba(255,255,255,0.055)');
  mid.addColorStop(0.7, 'rgba(255,255,255,0)');
  ctx.fillStyle = mid;
  ctx.fillRect(0, 0, W, H);

  const top = ctx.createLinearGradient(0, 0, 0, H * 0.16);
  top.addColorStop(0, 'rgba(0,0,0,0.42)');
  top.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, W, H * 0.16);

  const bot = ctx.createLinearGradient(0, H, 0, H * 0.84);
  bot.addColorStop(0, 'rgba(0,0,0,0.42)');
  bot.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = bot;
  ctx.fillRect(0, H * 0.84, W, H * 0.16);
}

/* ------------------------------------------------------------------ */

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  focusY: number,
): void {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const s = Math.max(w / iw, h / ih);
  const dw = iw * s;
  const dh = ih * s;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.filter = 'saturate(1.15) contrast(1.05)';
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) * focusY, dw, dh);
  ctx.filter = 'none';
  ctx.restore();
}

/** Letter-spaced centered text (canvas has no reliable letter-spacing). */
function drawTracked(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, ls: number): void {
  const chars = [...text];
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + ls * Math.max(0, chars.length - 1);
  let x = cx - total / 2;
  chars.forEach((ch, i) => {
    ctx.fillText(ch, x, y);
    x += widths[i] + ls;
  });
}

function trackedWidth(ctx: CanvasRenderingContext2D, text: string, ls: number): number {
  const chars = [...text];
  return chars.reduce((a, ch) => a + ctx.measureText(ch).width, 0) + ls * Math.max(0, chars.length - 1);
}

function withShadow(
  ctx: CanvasRenderingContext2D,
  color: string,
  blur: number,
  dy: number,
  draw: () => void,
): void {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetY = dy;
  draw();
  ctx.restore();
}

function mix(a: string, b: string, t: number): string {
  const ca = parseHex(a);
  const cb = parseHex(b);
  const m = ca.map((v, i) => Math.round(v * t + cb[i] * (1 - t)));
  return `rgb(${m[0]},${m[1]},${m[2]})`;
}

function parseHex(s: string): [number, number, number] {
  let h = s.trim().replace('#', '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  const n = parseInt(h, 16);
  if (h.length !== 6 || Number.isNaN(n)) return [128, 128, 128];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function hash(s: string): number {
  let v = 0;
  for (const ch of s) v = (v * 31 + ch.charCodeAt(0)) | 0;
  return v >>> 0;
}

function mulberry(seed: number): () => number {
  let a = seed || 1;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
