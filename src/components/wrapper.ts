import type { PackDefinition } from '../data/types';

/**
 * Procedural 3D booster wrapper. A thin box: front, back, two side slivers,
 * crimped seals top and bottom. The front carries key art, foil sheen and the
 * tear strip; if `pack.wrapperImage` is set (e.g. an official booster scan),
 * it replaces the procedural front design.
 */

export interface PackEl {
  root: HTMLDivElement;
  front: HTMLDivElement;
  tearStrip: HTMLDivElement;
  tearGuide: HTMLDivElement;
  /** Update the foil sheen from the current Y rotation (deg). */
  setSpin(rotY: number): void;
}

export function buildPack(pack: PackDefinition, keyArtUrl: string): PackEl {
  const root = document.createElement('div');
  root.className = 'pack3d';
  root.style.setProperty('--accent', pack.accent);
  root.style.setProperty('--accent2', pack.accentSecondary);

  const front = face('front');
  const back = face('back');
  const left = face('side side-left');
  const right = face('side side-right');

  front.appendChild(wrapperDesign(pack, keyArtUrl, true));
  back.appendChild(wrapperDesign(pack, keyArtUrl, false));

  // Tear strip: the piece above the perforation line that rips off.
  const tearStrip = document.createElement('div');
  tearStrip.className = 'tear-strip';
  tearStrip.appendChild(wrapperDesign(pack, keyArtUrl, true));

  const tearGuide = document.createElement('div');
  tearGuide.className = 'tear-guide';
  tearGuide.innerHTML = `
    <div class="tear-dashes"></div>
    <div class="tear-chevron">➤</div>
    <div class="tear-frontier"></div>
  `;
  front.append(tearStrip, tearGuide);

  const sheen = document.createElement('div');
  sheen.className = 'pack-sheen';
  front.appendChild(sheen);

  root.append(back, left, right, front);

  function setSpin(rotY: number) {
    // Specular highlight sweeps across the wrapper as it turns.
    const norm = ((rotY % 360) + 360) % 360;
    const rad = (norm * Math.PI) / 180;
    const x = 50 - Math.sin(rad * 1.0) * 60;
    root.style.setProperty('--sheen-x', `${x.toFixed(2)}%`);
    root.style.setProperty('--facing', Math.cos(rad).toFixed(3));
  }
  setSpin(0);

  return { root, front, tearStrip, tearGuide, setSpin };
}

function face(cls: string): HTMLDivElement {
  const el = document.createElement('div');
  el.className = `pack-face ${cls}`;
  return el;
}

function wrapperDesign(pack: PackDefinition, keyArtUrl: string, isFront: boolean): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'wrapper-design';

  if (pack.wrapperImage && isFront) {
    const img = document.createElement('img');
    img.className = 'wrapper-flat-art';
    img.src = pack.wrapperImage;
    img.alt = `${pack.name} booster`;
    img.draggable = false;
    el.appendChild(img);
    return el;
  }

  el.innerHTML = `
    <div class="crimp crimp-top"></div>
    <div class="wrap-body">
      <div class="wrap-art" style="background-image:url('${keyArtUrl}')"></div>
      <div class="wrap-art-fade"></div>
      <div class="wrap-brand">MYTHICPULL</div>
      <div class="wrap-title">${escapeHtml(pack.name.toUpperCase())}</div>
      <div class="wrap-sub">${isFront ? `PLAY BOOSTER · ${cardCount(pack)} CARDS` : `${cardCount(pack)} GAME CARDS`}</div>
      ${isFront ? '' : '<div class="wrap-barcode"></div>'}
    </div>
    <div class="crimp crimp-bottom"></div>
  `;
  return el;
}

function cardCount(pack: PackDefinition): number {
  return pack.cards.length || 14;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
