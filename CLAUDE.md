# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun install
bun run dev       # vite dev server on :5173
bun run build     # tsc --noEmit && vite build
bun run lint      # biome check (CI-style, fails on diff)
bun run lint:fix  # biome check --write
```

There is no test suite. `bun run build` is the type-check gate — run it plus
`bun run lint` after changes.

## Architecture

Space Wonderers is a browser flight toy: Bun + Vite + TypeScript + Three.js, no
framework, no state library.

**The ship never moves.** This is the one invariant everything else follows
from. `ShipController` accumulates an orientation quaternion and a scalar speed;
`Game.frame()` negates the resulting velocity into a `scroll` vector and moves
the *world* past a ship parked at the origin:

- `Starfield.update(scroll, streak)` translates every star and wraps it inside a
  cube of half-size `STAR_FIELD`. Warp streaks are the same point buffer drawn
  as `LineSegments`, second endpoint offset along the scroll direction.
- `Nebulae.update(scroll)` does the same at `NEBULA_PARALLAX` of the rate, so
  the clouds read as distant.

Coordinates therefore stay small however long a session runs, instead of
drifting into float32 imprecision. Anything new that lives in the world (props,
targets, pickups) has to scroll and wrap the same way — do not translate the
ship to "fix" it.

**Camera** (`Game.updateCamera`): a `CAMERA_OFFSET` in ship space, lerped with
exponential damping, looking at a point ahead along the flight path. The ship
is then pushed below frame centre by *tilting the lens* — `camera.rotateX` by
`atan(2 · SHIP_SCREEN_DROP · tan(fov/2))` — not by moving the look target in
world units. A world-space offset lands short, since the aim point is farther
away than the ship; the angular form is exact at any aim distance and any FOV,
which matters because FOV widens toward `WARP_FOV` under warp.

**Ship model** (`src/scene/Ship.ts`): `Ship.load()` fetches
`public/models/viper.glb` and normalizes it — centred on its own bounds, rotated
so the nose points down `-Z` (the direction the flight model treats as forward),
and scaled to `TARGET_LENGTH`. Engine-flare sprites are Three.js sprites, not
part of the GLB; their nozzle positions and plume sizes are expressed as
fractions of `TARGET_LENGTH` (`NOZZLE`, `PLUME`) so resizing the hull keeps the
exhaust attached. Swapping in a new model means dropping a GLB in
`public/models/` and re-checking the single `hull.rotation.y` line.

`Game.load()` must be awaited before `Game.start()`; `main.ts` does this behind
the Launch button and lazy-imports the whole `Game` chunk so Three.js is not in
the initial bundle.

**Tuning** lives in `src/config/constants.ts` — speeds, turn rates, warp
spin-up, camera offsets, field sizes. Prefer adding a constant there over
burying a number in a system.

**UI** is plain DOM in `index.html`, styled in `src/style.css`, driven by
`src/ui/`. The start screen and pause menu share `.screen` / `.panel` /
`.eyebrow` / `.action-button` classes — restyle the shared class, don't fork it.
`PauseMenu` stays inert until `enable()` so ESC can't cover the start screen.

### Gotchas

- **Frame delta**: the first rAF timestamp can land *behind* the
  `performance.now()` captured in `start()`. `dt` is clamped at both ends;
  a negative `dt` previously drove distance negative and blanked the HUD sector.
- **Pausing** keeps rendering but skips all updates, so the frozen scene shows
  through the overlay blur. `setPaused` clears held keys and resets `lastFrame`.

## Assets

The ship was generated through the Meshy API (`meshy-3d-generation` skill):
concept image → `image-to-image` clean-up → `image-to-3d` with Smart Topology.
Task records land in `meshy_output/` (gitignored, and excluded in `biome.json`
so the formatter leaves the generated JSON alone); the shipped copy is the one
under `public/models/`. Meshy deletes its own asset URLs after 3 days, so
download immediately. `MESHY_API_KEY` is read from `.env` (gitignored).

## Verifying visual changes

Screenshot the running game rather than trusting the code to look right. Chrome
headless `--virtual-time-budget` races the render loop and will capture a blank
canvas or a half-faded start screen; drive it over CDP instead — launch Chrome
with `--remote-debugging-port`, `PUT /json/new?<url>`, wait in real time, then
`Page.captureScreenshot`. Reaching the flight view without a click needs a
temporary hook in `main.ts` (`startButton.click()` behind a URL hash) — revert
it afterwards, it is not part of the app.

For framing or sizing changes, measure the screenshot (bright-pixel row spans)
and compare against a control capture with the change disabled. Eyeballing a
10% shift against a moving starfield is not reliable.
