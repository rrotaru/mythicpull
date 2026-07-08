import './styles/base.css';
import './styles/menu.css';
import './styles/pack.css';
import './styles/card.css';
import './styles/reveal.css';
import { menuScene } from './scenes/menu';
import { openingScene } from './scenes/opening';
import type { PackDefinition } from './data/types';

/**
 * MythicPull — a Pokémon-TCG-Pocket-style pack cracking experience for
 * Magic: The Gathering, powered by Scryfall imagery.
 *
 * Tiny scene router: menu ⇄ opening. Scenes return a root element and a
 * destroy hook; transitions crossfade.
 */

export interface Scene {
  el: HTMLElement;
  destroy?(): void;
}

const stage = document.getElementById('stage')!;
let current: Scene | null = null;

export function showScene(next: Scene) {
  const prev = current;
  current = next;
  next.el.classList.add('scene-enter');
  stage.appendChild(next.el);
  requestAnimationFrame(() => requestAnimationFrame(() => next.el.classList.remove('scene-enter')));
  if (prev) {
    prev.el.classList.add('scene-exit');
    setTimeout(() => {
      prev.destroy?.();
      prev.el.remove();
    }, 450);
  }
}

export function goToMenu() {
  showScene(menuScene({ onOpenPack: goToOpening }));
}

export function goToOpening(pack: PackDefinition) {
  showScene(openingScene({ pack, onExit: goToMenu, onAgain: () => goToOpening(pack) }));
}

goToMenu();
