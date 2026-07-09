# Adding a new pack / set

Everything a pack needs lives in **one entry** in
[`src/data/packs.ts`](../src/data/packs.ts). No scene, component, or style
code has to change — the menu rail, wrapper, reveal flow, and summary grid all
read from the registry.

This guide walks through adding a hypothetical pack for a future set, using
the five current packs (MSH, SOS, TMT, ECL, TLA) as reference implementations.

## 1. The registry entry

```ts
// src/data/packs.ts
{
  id: 'eoe',                        // unique key, used in scene routing
  name: 'Edge of Eternities',       // display name (menu chip + wrapper)
  setCode: 'eoe',                   // Scryfall set code, shown on the chip
  tagline: 'Play Booster · 14 cards',
  accent: '#4fd8c2',                // wrapper foil + ambient glow
  accentSecondary: '#7b4dd8',       // secondary glow / gradient stop
  keyArt: 'scryfall-art:Sothera, the Supervoid:eoe',
  cards: [ /* see step 3 */ ],
}
```

Field notes:

- **`id`** — any unique string; conventionally the set code.
- **`setCode`** — the official 3-letter code. Find it on
  [Scryfall's sets page](https://scryfall.com/sets) (e.g. `ecl` for Lorwyn
  Eclipsed, `tmt` for Teenage Mutant Ninja Turtles). This is what pins card
  printings and resolves key art.
- **`accent` / `accentSecondary`** — pick two colors from the set's branding
  or key art. They drive the procedural wrapper foil, the menu glow, and the
  chip highlight.
- **`comingSoon: true`** — optional; renders the pack as a locked chip in the
  menu (visible but not openable). Handy for announcing the next set before
  its card list is ready — give it `cards: []`.

## 2. Key art and wrapper art

Two options, in increasing order of effort:

1. **`keyArt` (default)** — a `scryfall-art:<Card Name>:<set>` spec. At
   runtime this resolves to that card's `art_crop` via Scryfall's
   `/cards/named` endpoint and gets composited into the procedural 3D foil
   wrapper. Pick the set's face card (the one on the real booster box):
   plain image URLs also work if you have your own art.
2. **`wrapperImage` (pixel-accurate)** — a URL to a full flat booster scan.
   When set, it replaces the procedural wrapper front entirely. High-res
   scans live on the MTG Wiki under
   [Category:Magic booster images](https://mtg.fandom.com/wiki/Category:Magic_booster_images)
   (e.g. `MKM Play Booster.png`, 900×1637).

## 3. The card list

Each entry in `cards` is one card in the pack, revealed **in array order** —
build the list like cracking a real Play Booster so the drama ramps up:

```
commons → uncommons → rare slot(s) → marquee mythic (foil, last)
```

A realistic 14-card Play Booster skeleton: **6–7 commons, 3–4 uncommons,
1–2 rares, 2–3 mythics**, with the set's face card as the final foil.

```ts
cards: [
  { name: 'Some Common',   set: 'eoe', rarity: 'common',   color: 'W' },
  // ... more commons, then uncommons, then:
  { name: 'Chase Rare',    set: 'eoe', rarity: 'rare',     color: 'R' },
  { name: 'Face Mythic',   set: 'eoe', rarity: 'mythic',   color: 'M', foil: true },
],
```

Per-card fields:

| Field | Required | What it does |
| --- | --- | --- |
| `name` | ✓ | **Exact** Scryfall card name (straight apostrophes, `!` and `,` included). Resolved via `POST /cards/collection`. |
| `set` | – | Pins the printing to a set code so the image *and rarity* come from that set's version. Always set this for real-set packs — rarities shift between printings (e.g. reprints). |
| `foil` | – | Forces the holo/foil treatment. Unset, mythics default to foil. |
| `rarity` | – | **Offline hint only.** Themes the mock card (rarity chip, ray-burst, foil default) when running with `?mock=1` or without network. Online, Scryfall's real rarity always wins. |
| `color` | – | **Offline hint only.** One of `W U B R G M A` (white/blue/black/red/green/multicolor/artifact); themes the mock card frame. Unhinted cards get a stable name-hashed color. |

### Getting names and rarities right

- Copy names verbatim from [Scryfall](https://scryfall.com/sets) — search
  `set:eoe` and sort by rarity. A misspelled name isn't fatal: the card is
  reported in the API's `not_found` list and silently skipped, so the pack
  just comes up one card short.
- For double-faced cards, the **front face name** works (e.g.
  `Oko, Lorwyn Liege` resolves `Oko, Lorwyn Liege // Oko, Shadowmoor Scion`).
- Rarity hints don't need to be perfect (they never override Scryfall), but
  accurate ones keep offline mode honest.

## 4. Test it

```bash
npm run dev
```

- **Online** — open the pack; every card should resolve to real imagery. A
  console warning `[scryfall] falling back to mock cards` means the whole
  fetch failed; individually skipped cards mean a name/set typo.
- **Offline** — append `?mock=1`. The pack should render procedural cards
  with your `rarity`/`color` hints reflected in the frames, rarity chips,
  and which cards get the holo treatment.

`npm run build` typechecks the registry — wrong rarity strings or color
letters fail compilation.

## 5. Beyond fixed lists: randomized pack contents

Card lists are currently fixed per pack (same 14 cards each opening). To
generate random contents with real slot odds, replace `fetchPackCards()` in
[`src/data/scryfall.ts`](../src/data/scryfall.ts): Scryfall's
`/cards/search?q=set:eoe+rarity:c` (etc.) can fetch the full rarity pools,
from which you draw per-slot. The scenes only consume the returned
`CardData[]`, so nothing else needs to change.
