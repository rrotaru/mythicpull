/** Core data model. Deliberately small so new packs/sets bolt on easily. */

export type Rarity = 'common' | 'uncommon' | 'rare' | 'mythic';

/**
 * Coarse color identity used only by the offline mock renderer to theme
 * procedural card frames: the five colors, M(ulticolor), A(rtifact/colorless).
 */
export type ColorHint = 'W' | 'U' | 'B' | 'R' | 'G' | 'M' | 'A';

export interface CardData {
  /** Scryfall card id when known (mock cards use a synthetic id). */
  id: string;
  name: string;
  setCode: string;
  setName: string;
  rarity: Rarity;
  typeLine: string;
  /** Large-size front image (Scryfall `image_uris.large`, ~672x936). */
  imageLarge: string;
  /** Normal-size front image used while large loads. */
  imageNormal: string;
  /** Whether the reveal should render this card with the holo/foil treatment. */
  foil: boolean;
}

export interface PackDefinition {
  id: string;
  /** Display name of the pack, e.g. the set name. */
  name: string;
  setCode: string;
  tagline: string;
  /** Accent colors used for wrapper foil + ambient glow. */
  accent: string;
  accentSecondary: string;
  /**
   * Key art shown in the wrapper's art window. Any hotlinkable image works;
   * Scryfall `art_crop` URLs are ideal.
   */
  keyArt?: string;
  /**
   * Optional: full flat wrapper art (e.g. an official booster scan such as the
   * high-res pack images hosted on the MTG Wiki, mtg.fandom.com
   * "Category:Magic booster images"). When set, it replaces the procedural
   * wrapper front.
   */
  wrapperImage?: string;
  /**
   * Curated fallback contents, resolved by exact name (+ optional set)
   * against Scryfall `/cards/collection`. Online, opens are randomized from
   * the set's full pool instead (see booster.ts); this list is what you get
   * offline (`?mock=1`) or when Scryfall is unreachable. Build it like a real
   * booster: commons first, money card last.
   */
  cards: PackCardRef[];
  /** Future packs render in the menu but can't be opened yet. */
  comingSoon?: boolean;
}

export interface PackCardRef {
  name: string;
  /** Pin a specific printing; otherwise Scryfall returns the default one. */
  set?: string;
  /** Force the foil/holo treatment on this card. */
  foil?: boolean;
  /**
   * Rarity hint for offline mock mode (`?mock=1`). Online, Scryfall's real
   * rarity always wins — this only themes the procedurally drawn stand-in so
   * rarity chips, ray-bursts and foil defaults still make sense offline.
   */
  rarity?: Rarity;
  /** Color hint for offline mock mode; themes the drawn card frame. */
  color?: ColorHint;
}
