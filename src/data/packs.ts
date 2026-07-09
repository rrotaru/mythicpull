import type { PackDefinition } from './types';

/**
 * Pack registry. Adding a pack = adding an entry here — see
 * docs/adding-packs.md for the full walkthrough.
 *
 * The five newest packs mirror the five most recent Magic sets. Each card
 * list is real cards from that set, pinned to the set's printing so Scryfall
 * returns the correct image and rarity, and ordered like cracking a real
 * Play Booster: commons up front, uncommons next, then the rare slots, with
 * the marquee mythic (always foil) last. `rarity`/`color` are offline hints
 * only — online, Scryfall's actual rarity always wins (see scryfall.ts).
 *
 * Wrapper art: packs render a procedural 3D foil wrapper built around
 * `keyArt` (a Scryfall art_crop). For pixel-accurate official packaging, set
 * `wrapperImage` to a high-res booster scan — the MTG Wiki hosts these at
 * https://mtg.fandom.com/wiki/Category:Magic_booster_images (e.g.
 * "MKM Play Booster.png", 900x1637).
 */
export const PACKS: PackDefinition[] = [
  {
    id: 'msh',
    name: 'Marvel Super Heroes',
    setCode: 'msh',
    tagline: 'Play Booster · 14 cards',
    accent: '#e23636',
    accentSecondary: '#f0b323',
    keyArt: 'scryfall-art:Captain America, Super-Soldier:msh',
    cards: [
      { name: 'Hero in Training', set: 'msh', rarity: 'common', color: 'W' },
      { name: 'Helicarrier Strike', set: 'msh', rarity: 'common', color: 'U' },
      { name: 'Cruel Alliance', set: 'msh', rarity: 'common', color: 'B' },
      { name: 'Dark Deed', set: 'msh', rarity: 'common', color: 'B' },
      { name: 'Justice, Vance Astrovik', set: 'msh', rarity: 'common', color: 'U' },
      { name: 'Ka-Zar of the Savage Land', set: 'msh', rarity: 'uncommon', color: 'G' },
      { name: 'Madame Masque', set: 'msh', rarity: 'uncommon', color: 'B' },
      { name: 'Death to Our Enemies', set: 'msh', rarity: 'uncommon', color: 'R' },
      { name: 'Shuri, Wakandan Inventor', set: 'msh', rarity: 'uncommon', color: 'G' },
      { name: 'Thor, God of Thunder', set: 'msh', rarity: 'rare', color: 'R' },
      { name: 'Mjolnir, Hammer of Thor', set: 'msh', rarity: 'mythic', color: 'A' },
      { name: 'Thanos, the Mad Titan', set: 'msh', rarity: 'mythic', color: 'M' },
      { name: 'Captain America, Super-Soldier', set: 'msh', rarity: 'mythic', color: 'W' },
      { name: 'King T\'Challa', set: 'msh', rarity: 'mythic', color: 'M', foil: true },
    ],
  },
  {
    id: 'sos',
    name: 'Secrets of Strixhaven',
    setCode: 'sos',
    tagline: 'Play Booster · 14 cards',
    accent: '#c8a24a',
    accentSecondary: '#7b4dd8',
    keyArt: 'scryfall-art:Lorehold, the Historian:sos',
    cards: [
      { name: 'Ajani\'s Response', set: 'sos', rarity: 'common', color: 'W' },
      { name: 'Last Gasp', set: 'sos', rarity: 'common', color: 'B' },
      { name: 'Goblin Glasswright', set: 'sos', rarity: 'common', color: 'R' },
      { name: 'Unsubtle Mockery', set: 'sos', rarity: 'common', color: 'R' },
      { name: 'Grapple with Death', set: 'sos', rarity: 'common', color: 'M' },
      { name: 'Arcane Omens', set: 'sos', rarity: 'uncommon', color: 'U' },
      { name: 'Snarl Song', set: 'sos', rarity: 'uncommon', color: 'G' },
      { name: 'Sundering Archaic', set: 'sos', rarity: 'uncommon', color: 'A' },
      { name: 'Strixhaven Skycoach', set: 'sos', rarity: 'uncommon', color: 'A' },
      { name: 'Erode', set: 'sos', rarity: 'rare', color: 'W' },
      { name: 'Flashback', set: 'sos', rarity: 'rare', color: 'R' },
      { name: 'Ral Zarek, Guest Lecturer', set: 'sos', rarity: 'mythic', color: 'B' },
      { name: 'Emeritus of Ideation', set: 'sos', rarity: 'mythic', color: 'U' },
      { name: 'Lorehold, the Historian', set: 'sos', rarity: 'mythic', color: 'M', foil: true },
    ],
  },
  {
    id: 'tmt',
    name: 'Teenage Mutant Ninja Turtles',
    setCode: 'tmt',
    tagline: 'Play Booster · 14 cards',
    accent: '#5bbf4a',
    accentSecondary: '#e0812f',
    keyArt: 'scryfall-art:Leonardo, Leader in Blue:tmt',
    cards: [
      { name: 'Cowabunga!', set: 'tmt', rarity: 'common', color: 'G' },
      { name: 'Mouser Attack!', set: 'tmt', rarity: 'common', color: 'R' },
      { name: 'Pain 101', set: 'tmt', rarity: 'common', color: 'B' },
      { name: 'Stomped by the Foot', set: 'tmt', rarity: 'common', color: 'B' },
      { name: 'Squirrelanoids', set: 'tmt', rarity: 'common', color: 'B' },
      { name: 'Uneasy Alliance', set: 'tmt', rarity: 'common', color: 'W' },
      { name: 'Sewer-veillance Cam', set: 'tmt', rarity: 'common', color: 'A' },
      { name: 'Dimensional Exile', set: 'tmt', rarity: 'uncommon', color: 'W' },
      { name: 'Saved by the Shell', set: 'tmt', rarity: 'uncommon', color: 'G' },
      { name: 'Shredder\'s Technique', set: 'tmt', rarity: 'uncommon', color: 'B' },
      { name: 'Splinter, the Mentor', set: 'tmt', rarity: 'rare', color: 'B' },
      { name: 'Krang, Utrom Warlord', set: 'tmt', rarity: 'mythic', color: 'M' },
      { name: 'Super Shredder', set: 'tmt', rarity: 'mythic', color: 'B' },
      { name: 'Leonardo, Leader in Blue', set: 'tmt', rarity: 'mythic', color: 'U', foil: true },
    ],
  },
  {
    id: 'ecl',
    name: 'Lorwyn Eclipsed',
    setCode: 'ecl',
    tagline: 'Play Booster · 14 cards',
    accent: '#8a5ce0',
    accentSecondary: '#e8b34a',
    keyArt: 'scryfall-art:Oko, Lorwyn Liege:ecl',
    cards: [
      { name: 'Changeling Wayfinder', set: 'ecl', rarity: 'common', color: 'A' },
      { name: 'Sun-Dappled Celebrant', set: 'ecl', rarity: 'common', color: 'W' },
      { name: 'Wanderbrine Trapper', set: 'ecl', rarity: 'common', color: 'U' },
      { name: 'Explosive Prodigy', set: 'ecl', rarity: 'common', color: 'R' },
      { name: 'Nameless Inversion', set: 'ecl', rarity: 'common', color: 'B' },
      { name: 'Blossoming Defense', set: 'ecl', rarity: 'common', color: 'G' },
      { name: 'Kithkeeper', set: 'ecl', rarity: 'uncommon', color: 'W' },
      { name: 'Spiral into Solitude', set: 'ecl', rarity: 'uncommon', color: 'W' },
      { name: 'Silvergill Mentor', set: 'ecl', rarity: 'uncommon', color: 'U' },
      { name: 'Flamebraider', set: 'ecl', rarity: 'uncommon', color: 'R' },
      { name: 'Hexing Squelcher', set: 'ecl', rarity: 'rare', color: 'G' },
      { name: 'Bloom Tender', set: 'ecl', rarity: 'mythic', color: 'G' },
      { name: 'Moonshadow', set: 'ecl', rarity: 'mythic', color: 'B' },
      { name: 'Oko, Lorwyn Liege', set: 'ecl', rarity: 'mythic', color: 'M', foil: true },
    ],
  },
  {
    id: 'tla',
    name: 'Avatar: The Last Airbender',
    setCode: 'tla',
    tagline: 'Play Booster · 14 cards',
    accent: '#3fa8d8',
    accentSecondary: '#e0812f',
    keyArt: 'scryfall-art:Aang, Airbending Master:tla',
    cards: [
      { name: 'Invasion Submersible', set: 'tla', rarity: 'common', color: 'U' },
      { name: 'Serpent of the Pass', set: 'tla', rarity: 'common', color: 'U' },
      { name: 'Callous Inspector', set: 'tla', rarity: 'common', color: 'B' },
      { name: 'Swampsnare Trap', set: 'tla', rarity: 'common', color: 'B' },
      { name: 'Rowdy Snowballers', set: 'tla', rarity: 'common', color: 'R' },
      { name: 'Azula Always Lies', set: 'tla', rarity: 'common', color: 'R' },
      { name: 'Foggy Swamp Spirit Keeper', set: 'tla', rarity: 'uncommon', color: 'M' },
      { name: 'Iroh\'s Demonstration', set: 'tla', rarity: 'uncommon', color: 'R' },
      { name: 'Epic Downfall', set: 'tla', rarity: 'uncommon', color: 'B' },
      { name: 'Aang, the Last Airbender', set: 'tla', rarity: 'rare', color: 'U' },
      { name: 'Koh, the Face Stealer', set: 'tla', rarity: 'mythic', color: 'B' },
      { name: 'Wan Shi Tong, Librarian', set: 'tla', rarity: 'mythic', color: 'U' },
      { name: 'Zuko, Firebending Master', set: 'tla', rarity: 'mythic', color: 'R' },
      { name: 'Aang, Airbending Master', set: 'tla', rarity: 'mythic', color: 'W', foil: true },
    ],
  },
  {
    id: 'fdn',
    name: 'Foundations',
    setCode: 'fdn',
    tagline: 'Classics sampler · 15 cards',
    accent: '#d4a843',
    accentSecondary: '#7b4dd8',
    // Shivan Dragon (FDN) art crop — resolved at runtime; see scryfall.ts.
    keyArt: 'scryfall-art:Shivan Dragon:fdn',
    // Iconic-card sampler (default printings, not all from FDN) — kept as the
    // offline demo pack: every name has hand-drawn MOCK_META art in mock.ts.
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
];

export function getPack(id: string): PackDefinition | undefined {
  return PACKS.find((p) => p.id === id);
}
