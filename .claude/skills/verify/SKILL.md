---
name: verify
description: Build, launch, and drive MythicPull in a headless browser to verify changes end-to-end.
---

# Verifying MythicPull

Vite + TypeScript SPA, no test suite — verification is driving the app in a
browser.

## Build & launch

```bash
npm install
npm run build                      # tsc --noEmit && vite build
npm run dev -- --port 5199 --strictPort   # dev server (background it)
```

Use the dev server for verification (source ESM, fast reload). Then drive it
with Playwright against the preinstalled Chromium
(`executablePath: '/opt/pw-browsers/chromium'`).

## URLs / modes

- `http://localhost:5199/?mock=1` — deterministic offline mode; procedural
  card art, no network. Use this for the main pass.
- `http://localhost:5199/` — live Scryfall mode. In sandboxes where
  api.scryfall.com is blocked, this exercises the graceful-fallback path
  (console warns `[scryfall] falling back to mock cards`) — worth a probe.

## Driving the flows

- **Menu**: wait for `.set-chip`; chips carry `.chip-code`/`.chip-name`.
  Selecting a chip remounts the 3D preview; `.wrap-sub` on the wrapper shows
  the card-count label. `.open-btn` enters the opening scene.
- **Tear open the pack**: wait for `.opening-scene.phase-pack` and
  `.pack-face.front`, let the arrive animation finish (~800ms), then drag
  with `page.mouse` across the top ~10% of the pack front (the tear zone is
  the top 20%; tear completes at 88% of width — sweep 95% in ~30 steps).
- **Reveal**: `.opening-scene.phase-reveal`; `.open-counter` shows `n / N`.
  Click `.pack-stage` to flip, click again to advance (rares lock input
  ~550ms — space clicks ≥650ms apart). `.skip-btn` ("Reveal all") jumps
  straight to the summary.
- **Summary**: `.opening-scene.phase-summary`; `.summary-rarities` has the
  rarity chips, `.summary-card` cells carry `rarity-*` / `is-foil` classes
  and the card name in the `<img alt>`.

## Validating card data against live Scryfall

`npm run validate:packs` resolves every registry card ref + keyArt through
the real Scryfall endpoints (hard-fails on bad names/imagery, warns on stale
rarity hints). In this sandbox, Node needs the proxy opt-in:

```bash
NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt npm run validate:packs
```

## Gotchas

- Headless Chromium cannot reach external hosts in this sandbox — every
  outbound TLS connection gets `ERR_CONNECTION_RESET` regardless of proxy
  configuration (env-inherited or explicit `proxy:` launch option). So the
  browser can only be driven against `?mock=1` and the Scryfall-fallback
  path; validate live card data with Node fetch (above) instead.
- Node's `fetch` ignores `HTTPS_PROXY` unless `NODE_USE_ENV_PROXY=1` is set,
  and needs `NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt` for the MITM CA.

- Pack registry lives in `src/data/packs.ts`; offline rarity/color hints on
  card refs only affect mock mode — online rarity comes from Scryfall.
- Both wrapper faces have `.wrap-sub`; the first match in the DOM is the
  back face (`N GAME CARDS`), the front reads `PLAY BOOSTER · N CARDS`.
