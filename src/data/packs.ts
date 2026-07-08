import type { PackDefinition } from './types';

/**
 * Pack registry. Adding a pack = adding an entry here.
 *
 * Card contents are placeholder samples for now — 15 iconic cards per pack,
 * resolved at runtime through Scryfall. Accurate set/rarity/slot logic can be
 * layered on later without touching the scenes.
 *
 * Wrapper art: packs render a procedural 3D foil wrapper built around
 * `keyArt` (a Scryfall art_crop). For pixel-accurate official packaging, set
 * `wrapperImage` to a high-res booster scan — the MTG Wiki hosts these at
 * https://mtg.fandom.com/wiki/Category:Magic_booster_images (e.g.
 * "MKM Play Booster.png", 900x1637).
 */
export const PACKS: PackDefinition[] = [
  {
    id: 'fdn',
    name: 'Foundations',
    setCode: 'fdn',
    tagline: 'Play Booster · 15 cards',
    accent: '#d4a843',
    accentSecondary: '#7b4dd8',
    // Shivan Dragon (FDN) art crop — resolved at runtime; see scryfall.ts.
    keyArt: 'scryfall-art:Shivan Dragon:fdn',
    cards: [
      { name: 'Llanowar Elves' },
      { name: 'Giant Growth' },
      { name: 'Doom Blade' },
      { name: 'Shock' },
      { name: 'Divination' },
      { name: 'Pacifism' },
      { name: 'Hero of Bladehold' },
      { name: 'Serra Angel' },
      { name: 'Counterspell' },
      { name: 'Lightning Bolt' },
      { name: 'Birds of Paradise' },
      { name: 'Shivan Dragon' },
      { name: 'Wrath of God' },
      { name: 'Sol Ring' },
      // The money card — always last, always foil, demos the holo effect.
      { name: 'Atraxa, Grand Unifier', foil: true },
    ],
  },
  {
    id: 'blb',
    name: 'Bloomburrow',
    setCode: 'blb',
    tagline: 'Play Booster · Coming soon',
    accent: '#7fc24f',
    accentSecondary: '#e8b34a',
    keyArt: 'scryfall-art:Mabel, Heir to Cragflame:blb',
    cards: [],
    comingSoon: true,
  },
  {
    id: 'dsk',
    name: 'Duskmourn',
    setCode: 'dsk',
    tagline: 'Play Booster · Coming soon',
    accent: '#b34fd8',
    accentSecondary: '#3fd8c2',
    keyArt: 'scryfall-art:Valgavoth, Terror Eater:dsk',
    cards: [],
    comingSoon: true,
  },
];

export function getPack(id: string): PackDefinition | undefined {
  return PACKS.find((p) => p.id === id);
}
