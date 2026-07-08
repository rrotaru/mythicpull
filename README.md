# MythicPull

A polished, extensible web app for cracking Magic: The Gathering booster packs,
modeled on the pack-opening experience in **Pokémon TCG Pocket**.

## The experience

1. **Pick a set** — a minimal menu with a slowly turning 3D pack preview.
   Future sets appear as locked chips; adding one is a single registry entry.
2. **Spin the pack** — drag anywhere to rotate the booster a full 360° with
   inertia; it settles back facing you. The foil wrapper's specular sheen
   sweeps across as it turns.
3. **Tear it open** — pull across the perforation line at the top of the pack.
   Sparks trail your finger, the wrapper crackles, and past the threshold the
   strip rips off, the wrapper falls away, and the cards burst out.
4. **Reveal** — cards stack face-down (real card-back art). Tap to flip and
   advance through all 15. Rares and mythics get ray-bursts, glitter and a
   shimmer arpeggio. **Drag anywhere to wobble the current card** like you're
   holding real cardstock — springs, not tweens.
5. **Holo foils** — foil cards (the mythic demo card is always foil) carry a
   rainbow color-dodge holographic layer plus glare that tracks the tilt and
   pointer, in the style of the famous `pokemon-cards-css` effect.
6. **Your pull** — the full pack fans out into a grid with rarity chips; tap
   any card to inspect it in 3D with the full tilt + holo treatment.

All sound is synthesized with WebAudio at runtime (tear crackle, whooshes,
shimmers) — no audio assets. Mouse and touch are both first-class
(pointer events + springs everywhere).

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build
```

**Offline / demo mode:** append `?mock=1` (or just lose network) and the app
procedurally draws placeholder card faces, card back and pack art on canvases —
every interaction works with zero network access.

## Where the art comes from

- **Card fronts** — the [Scryfall API](https://scryfall.com/docs/api), fetched
  at runtime by exact card name via `POST /cards/collection`
  (`image_uris.large`, ~672×936 JPG; `png` at 745×1040 also available).
  No API key required; Scryfall permits hotlinking from its image CDN.
- **Card back** — Scryfall's backs CDN, default `card_back_id`:
  `https://backs.scryfall.io/large/0/a/0aeebaf5-8c7d-4636-9e82-8c27447861f7.jpg`
  (drawn fallback if unreachable).
- **Booster pack art** — the pack is a procedural 3D foil wrapper (front, back,
  crimped seals, side gussets) built around a set's key art
  (Scryfall `art_crop`). For pixel-accurate official packaging, high-res
  booster scans live on the MTG Wiki:
  [Category:Magic booster images](https://mtg.fandom.com/wiki/Category:Magic_booster_images)
  (e.g. `MKM Play Booster.png`, 900×1637) — set `wrapperImage` on a pack
  definition to use one. Wizards' official product shots are also published
  per-set on [magic.wizards.com](https://magic.wizards.com) media pages.

## Extending it

Everything a new set needs lives in `src/data/packs.ts`:

```ts
{
  id: 'blb',
  name: 'Bloomburrow',
  setCode: 'blb',
  accent: '#7fc24f',
  accentSecondary: '#e8b34a',
  keyArt: 'scryfall-art:Mabel, Heir to Cragflame:blb', // resolved via Scryfall
  wrapperImage: undefined, // optional: official booster scan URL
  cards: [ { name: 'Lightning Bolt' }, /* …15 refs, `foil: true` to force holo */ ],
}
```

Card contents are currently a fixed 15-card sample per pack — accurate
pack/slot/rarity generation can replace `fetchPackCards()` in
`src/data/scryfall.ts` without touching any scene code.

### Layout

```
src/
  data/       pack registry, Scryfall client, offline mock renderer
  components/ 3D card (front/back + holo layers), 3D booster wrapper
  scenes/     menu (pack select), opening (pack → tear → reveal → summary)
  fx/         spring physics + shared ticker, particle canvas, WebAudio sound
  styles/     base/menu/pack/card/reveal CSS (all 3D + holo is pure CSS vars)
```

## Disclaimer

Unofficial fan project. Magic: The Gathering is © Wizards of the Coast.
Card imagery courtesy of Scryfall. Not affiliated with or endorsed by WotC or
The Pokémon Company.
