# Space Wonderers

A small browser flight toy: one ship, an endless star field, and a warp core.
Built with Bun, Vite, TypeScript and Three.js.

```bash
bun install
bun run dev      # http://localhost:5173
bun run build    # type-check + production bundle into dist/
bun run lint     # biome
```

## Controls

| Key            | Action              |
| -------------- | ------------------- |
| `W A S D`      | Pitch and yaw       |
| `Q` / `E`      | Roll                |
| `Shift` / `Ctrl` | Throttle up / down |
| `Space` (hold) | Warp                |
| `Esc`          | Pause / resume      |

## How it works

The ship never moves. It accumulates an orientation and a speed
(`src/core/ShipController.ts`), and the world is scrolled against the resulting
velocity — stars wrap inside a cube around the origin, nebulae drift at a
fraction of that for parallax. Nothing ever leaves the precision-friendly range
near the origin, however long you fly.

- `src/core/Game.ts` — scene, lighting, camera, frame loop
- `src/scene/` — ship, star field, nebulae, generated textures
- `src/ui/HUD.ts` — velocity, warp core, distance readouts
- `src/ui/PauseMenu.ts` — ESC overlay; the loop keeps rendering but stops
  updating, so the frozen scene still shows through the blur
- `src/config/constants.ts` — every number worth tuning

## The ship

`public/models/viper.glb` (7220 triangles, 2K PBR maps) was generated with the
Meshy API from a concept sheet: the hero view was cropped, cleaned up into a
plain-background studio render via `image-to-image`, then meshed with
`image-to-3d` using Smart Topology. Task records for that run live in
`meshy_output/` (gitignored — the shipped copy is the one under `public/`).

`Ship.load()` normalizes whatever comes out of Meshy: centred on its own bounds,
rotated nose-down `-Z`, and scaled to `TARGET_LENGTH`. Swapping in a different
model means dropping a new GLB in `public/models/` and checking the one
`hull.rotation.y` line still points the nose the right way.
