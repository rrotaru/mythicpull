import type { PackDefinition } from '../data/types';
import { bakeWrapperTextures, TEX_W, TEX_H, type WrapperArt } from './packTexture';

/**
 * Procedural 3D booster wrapper with real pillow-pack geometry.
 *
 * The front and back are built from horizontal slices: a flat middle panel
 * plus rotateX'd slices at each end, so the pack softly tapers from full
 * thickness down to the thin crimped seams — no more rectangular box. The
 * sides are lens-shaped planes matching that taper profile.
 *
 * All wrapper artwork (key art, gradients, crimps, text, barcode) is baked
 * into canvas textures (see packTexture.ts) and cropped per slice, so the
 * lettering lives on the wrapper surface itself.
 *
 * Everything above the perforation line — front slices, back slices, side
 * tips — lives in one `.pack-cap` group. During a tear the cap's front
 * layers split into an attached part and a lifted part at the tear frontier
 * (driven by --tear/--tear-dir); when the tear completes the whole cap rips
 * off in 3D.
 */

export interface PackEl {
  root: HTMLDivElement;
  /** Full-pack-sized plane, for hit-testing rects from the scene. */
  front: HTMLDivElement;
  tearGuide: HTMLDivElement;
  /** Update the foil sheen from the current Y rotation (deg). */
  setSpin(rotY: number): void;
}

const ASPECT = 0.62; // width / height
const DEPTH = 0.045; // half-depth at the pillow's fattest, fraction of width
const CAP_Y = 0.185; // cap sliver reaches past the 18% tear line to hide the jagged remnant
const OVERLAP = 0.004; // slices extend up slightly to hide rotation gaps

/** Taper profile rows: [y fraction of height, z fraction of width]. */
const PROFILE: [number, number][] = [
  [0, 0.0035],
  [0.055, 0.024],
  [0.105, 0.038],
  [0.16, DEPTH],
];

interface SliceSpec {
  y0: number;
  y1: number;
  z0: number; // fraction of pack width
  angleDeg: number;
  extendUp?: boolean;
  extraZpx?: number;
  bevel?: 'top' | 'bottom';
}

interface PaintJob {
  canvases: HTMLCanvasElement[];
  y0: number;
  y1: number;
  face: 'front' | 'back';
}

export function buildPack(pack: PackDefinition, keyArtUrl: string): PackEl {
  const root = div('pack3d');
  root.style.setProperty('--accent', pack.accent);
  root.style.setProperty('--accent2', pack.accentSecondary);

  const jobs: PaintJob[] = [];

  function slicePlane(spec: SliceSpec, cls: string, face: 'front' | 'back', peel: boolean): HTMLDivElement {
    const y0 = spec.extendUp ? spec.y0 - OVERLAP : spec.y0;
    const el = div(`pslice ${cls}`);
    el.style.top = `${(y0 * 100).toFixed(3)}%`;
    el.style.height = `${((spec.y1 - y0) * 100).toFixed(3)}%`;
    const z = `calc(var(--pack-w) * ${spec.z0}${spec.extraZpx ? ` + ${spec.extraZpx}px` : ''})`;
    el.style.transform = `translateZ(${z}) rotateX(${spec.angleDeg.toFixed(2)}deg)`;
    if (spec.bevel === 'top') el.style.clipPath = 'polygon(2.5% 0, 97.5% 0, 100% 100%, 0 100%)';
    if (spec.bevel === 'bottom') el.style.clipPath = 'polygon(0 0, 100% 0, 97.5% 100%, 2.5% 100%)';

    const canvases: HTMLCanvasElement[] = [];
    if (peel) {
      const keep = div('peel peel-keep');
      const lift = div('peel peel-lift');
      const jag = div('peel-jag');
      const c1 = document.createElement('canvas');
      const c2 = document.createElement('canvas');
      keep.appendChild(c1);
      jag.appendChild(c2);
      lift.appendChild(jag);
      el.append(keep, lift);
      canvases.push(c1, c2);
    } else {
      const c = document.createElement('canvas');
      el.appendChild(c);
      canvases.push(c);
    }
    jobs.push({ canvases, y0, y1: spec.y1, face });
    return el;
  }

  const top = topSlices();
  const bottom = bottomSlices();
  const bodySpec: SliceSpec = { y0: 0.16, y1: 0.84, z0: DEPTH, angleDeg: 0 };
  const sliverSpec: SliceSpec = { y0: 0.16, y1: CAP_Y, z0: DEPTH, angleDeg: 0, extendUp: true, extraZpx: 0.5 };

  // ---- back (rotated 180°) ----
  const backFlip = div('pack-flip');
  backFlip.appendChild(slicePlane(bodySpec, 'back-body', 'back', false));
  for (const s of bottom) backFlip.appendChild(slicePlane(s, 'back-slice', 'back', false));

  // ---- front body + bottom taper ----
  const frontBody = slicePlane(bodySpec, 'front-body', 'front', false);
  const sheen = div('pack-sheen');
  frontBody.appendChild(sheen);
  const frontBottom = bottom.map((s) => slicePlane(s, 'front-slice', 'front', false));

  // ---- sides: lens-shaped taper profile, split at the tear line ----
  const sideBodyL = div('pack-side side-lower side-left');
  const sideBodyR = div('pack-side side-lower side-right');

  // ---- dark interior visible when the strip lifts / rips away ----
  const liner = div('pack-liner');

  // ---- the cap: everything above the perforation ----
  const cap = div('pack-cap');
  for (const s of top) cap.appendChild(slicePlane(s, 'cap-front', 'front', true));
  cap.appendChild(slicePlane(sliverSpec, 'cap-front cap-sliver', 'front', true));
  const capBack = div('pack-flip');
  for (const s of top) capBack.appendChild(slicePlane(s, 'cap-back', 'back', false));
  capBack.appendChild(slicePlane(sliverSpec, 'cap-back', 'back', false));
  const sideTopL = div('pack-side side-upper side-left');
  const sideTopR = div('pack-side side-upper side-right');
  cap.append(capBack, sideTopL, sideTopR);

  // ---- tear guide (perforation dashes + chevron + frontier glow) ----
  const tearGuide = div('tear-guide');
  tearGuide.innerHTML = `
    <div class="tear-dashes"></div>
    <div class="tear-chevron">➤</div>
    <div class="tear-frontier"></div>
  `;

  const bounds = div('pack-bounds');

  root.append(backFlip, sideBodyL, sideBodyR, liner, frontBody, ...frontBottom, cap, tearGuide, bounds);

  /* ---- texture painting ---- */
  const art: WrapperArt = { keyArt: null, wrapper: null };

  function paintAll() {
    const tex = bakeWrapperTextures(pack, art);
    for (const job of jobs) {
      const src = job.face === 'front' ? tex.front : tex.back;
      const sy = Math.round(job.y0 * TEX_H);
      const sh = Math.max(1, Math.round((job.y1 - job.y0) * TEX_H));
      for (const canvas of job.canvases) {
        canvas.width = TEX_W;
        canvas.height = sh;
        canvas.getContext('2d')!.drawImage(src, 0, sy, TEX_W, sh, 0, 0, TEX_W, sh);
      }
    }
  }

  paintAll();
  void loadImage(keyArtUrl).then((img) => {
    if (!img) return;
    art.keyArt = img;
    paintAll();
  });
  if (pack.wrapperImage) {
    void loadImage(pack.wrapperImage).then((img) => {
      if (!img) return;
      art.wrapper = img;
      paintAll();
    });
  }

  function setSpin(rotY: number) {
    // Specular highlight sweeps across the wrapper as it turns.
    const norm = ((rotY % 360) + 360) % 360;
    const rad = (norm * Math.PI) / 180;
    const x = 50 - Math.sin(rad) * 60;
    root.style.setProperty('--sheen-x', `${x.toFixed(2)}%`);
  }
  setSpin(0);

  return { root, front: bounds, tearGuide, setSpin };
}

/* ------------------------------------------------------------------ */

function topSlices(): SliceSpec[] {
  const out: SliceSpec[] = [];
  for (let i = 0; i < PROFILE.length - 1; i++) {
    const [y0, z0] = PROFILE[i];
    const [y1, z1] = PROFILE[i + 1];
    out.push({
      y0,
      y1,
      z0,
      angleDeg: sliceAngle(y1 - y0, z1 - z0),
      extendUp: i > 0,
      bevel: i === 0 ? 'top' : undefined,
    });
  }
  return out;
}

function bottomSlices(): SliceSpec[] {
  const out: SliceSpec[] = [];
  for (let i = PROFILE.length - 1; i > 0; i--) {
    const [yA, zA] = PROFILE[i];
    const [yB, zB] = PROFILE[i - 1];
    // mirror the profile row down to the bottom half
    const y0 = 1 - yA;
    const y1 = 1 - yB;
    out.push({
      y0,
      y1,
      z0: zA,
      angleDeg: sliceAngle(y1 - y0, zB - zA),
      extendUp: i < PROFILE.length - 1,
      bevel: i === 1 ? 'bottom' : undefined,
    });
  }
  return out;
}

/** Tilt (deg) that carries a slice of height dy (H units) across dz (W units). */
function sliceAngle(dy: number, dz: number): number {
  const h = dy / ASPECT; // slice height in width units
  return (Math.asin(Math.max(-1, Math.min(1, dz / h))) * 180) / Math.PI;
}

function div(cls: string): HTMLDivElement {
  const el = document.createElement('div');
  el.className = cls;
  return el;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}
