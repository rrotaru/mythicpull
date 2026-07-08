import type { CardData } from '../data/types';

/**
 * Builds a 3D card: front (Scryfall image + holo layers) and back. The holo
 * effect is pure CSS driven by custom properties that the tilt loop updates:
 *
 *   --mx / --my   pointer position over the card, in %
 *   --posx/--posy background offset for the rainbow bands, in %
 *   --holo        overall foil intensity 0..1
 */

export interface CardEl {
  root: HTMLDivElement;
  data: CardData;
  /** Feed tilt (deg) + normalized pointer (0..1) into the holo layers. */
  setShine(rx: number, ry: number, px: number, py: number): void;
}

export function buildCard(data: CardData, backUrl: string): CardEl {
  const root = document.createElement('div');
  root.className = `card3d rarity-${data.rarity}${data.foil ? ' is-foil' : ''}`;

  // Inner flipper so the face-down→face-up rotation composes with the
  // wobble transform applied to the root.
  const flip = document.createElement('div');
  flip.className = 'card-flip';

  const front = document.createElement('div');
  front.className = 'card-face card-front';

  const img = document.createElement('img');
  img.className = 'card-img';
  img.alt = data.name;
  img.draggable = false;
  img.decoding = 'async';
  img.src = data.imageLarge;
  img.onerror = () => {
    // Last-resort placeholder so a dead URL never shows a broken image icon.
    front.classList.add('card-img-failed');
    img.remove();
    const ph = document.createElement('div');
    ph.className = 'card-placeholder';
    ph.textContent = data.name;
    front.prepend(ph);
  };
  front.appendChild(img);

  const shine = document.createElement('div');
  shine.className = 'holo-shine';
  const glare = document.createElement('div');
  glare.className = 'holo-glare';
  front.append(shine, glare);

  const back = document.createElement('div');
  back.className = 'card-face card-back';
  const backImg = document.createElement('img');
  backImg.className = 'card-img';
  backImg.alt = 'Card back';
  backImg.draggable = false;
  backImg.src = backUrl;
  back.appendChild(backImg);

  flip.append(back, front);
  root.appendChild(flip);

  function setShine(rx: number, ry: number, px: number, py: number) {
    const intensity = Math.min(1, (Math.abs(rx) + Math.abs(ry)) / 18);
    root.style.setProperty('--mx', `${(px * 100).toFixed(2)}%`);
    root.style.setProperty('--my', `${(py * 100).toFixed(2)}%`);
    root.style.setProperty('--posx', `${(50 + (px - 0.5) * 90).toFixed(2)}%`);
    root.style.setProperty('--posy', `${(50 + (py - 0.5) * 90).toFixed(2)}%`);
    root.style.setProperty('--holo', (0.25 + intensity * 0.75).toFixed(3));
  }
  setShine(0, 0, 0.5, 0.5);

  return { root, data, setShine };
}
