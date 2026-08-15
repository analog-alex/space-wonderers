import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  LineBasicMaterial,
  LineSegments,
  Points,
  PointsMaterial,
  type Vector3,
} from "three";
import { STAR_COUNT, STAR_FIELD } from "../config/constants";
import { glowTexture } from "./textures";

const TINTS = [0xffffff, 0xcfe4ff, 0xa9c7ff, 0xffe3c2, 0xffc9e6];

const wrap = (value: number): number => {
  const span = STAR_FIELD * 2;
  let wrapped = value;
  while (wrapped > STAR_FIELD) wrapped -= span;
  while (wrapped < -STAR_FIELD) wrapped += span;
  return wrapped;
};

/** A cube of stars that wraps around the ship, plus the warp streaks drawn
 * from the same points once the core is spinning. */
export class Starfield {
  readonly root = new Group();
  private readonly positions: Float32Array;
  private readonly streakPositions: Float32Array;
  private readonly points: Points;
  private readonly streaks: LineSegments;

  constructor() {
    this.positions = new Float32Array(STAR_COUNT * 3);
    this.streakPositions = new Float32Array(STAR_COUNT * 6);
    const colors = new Float32Array(STAR_COUNT * 3);
    const streakColors = new Float32Array(STAR_COUNT * 6);
    const tint = new Color();

    for (let i = 0; i < STAR_COUNT; i += 1) {
      for (let axis = 0; axis < 3; axis += 1) {
        this.positions[i * 3 + axis] = (Math.random() * 2 - 1) * STAR_FIELD;
      }
      tint.setHex(TINTS[Math.floor(Math.random() * TINTS.length)]);
      tint.multiplyScalar(0.55 + Math.random() * 0.45);
      tint.toArray(colors, i * 3);
      tint.toArray(streakColors, i * 6);
      tint.multiplyScalar(0.15).toArray(streakColors, i * 6 + 3);
    }

    const starGeometry = new BufferGeometry();
    starGeometry.setAttribute(
      "position",
      new BufferAttribute(this.positions, 3)
    );
    starGeometry.setAttribute("color", new BufferAttribute(colors, 3));
    this.points = new Points(
      starGeometry,
      new PointsMaterial({
        size: 3.2,
        map: glowTexture(0xbcd8ff, 64),
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      })
    );

    const streakGeometry = new BufferGeometry();
    streakGeometry.setAttribute(
      "position",
      new BufferAttribute(this.streakPositions, 3)
    );
    streakGeometry.setAttribute("color", new BufferAttribute(streakColors, 3));
    this.streaks = new LineSegments(
      streakGeometry,
      new LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: AdditiveBlending,
      })
    );
    this.streaks.visible = false;

    this.root.add(this.points, this.streaks);
  }

  /**
   * @param scroll how far the field moves this frame (the ship's velocity, negated)
   * @param streak length of the warp trails in world units, 0 when cruising
   */
  update(scroll: Vector3, streak: number): void {
    const { x: dx, y: dy, z: dz } = scroll;
    for (let i = 0; i < STAR_COUNT; i += 1) {
      const o = i * 3;
      this.positions[o] = wrap(this.positions[o] + dx);
      this.positions[o + 1] = wrap(this.positions[o + 1] + dy);
      this.positions[o + 2] = wrap(this.positions[o + 2] + dz);
    }
    this.points.geometry.attributes.position.needsUpdate = true;

    const material = this.streaks.material as LineBasicMaterial;
    material.opacity = Math.min(1, streak / 40);
    this.streaks.visible = streak > 0.5;
    if (!this.streaks.visible) return;

    const length = scroll.length() || 1;
    const sx = (dx / length) * streak;
    const sy = (dy / length) * streak;
    const sz = (dz / length) * streak;
    for (let i = 0; i < STAR_COUNT; i += 1) {
      const o = i * 3;
      const s = i * 6;
      const x = this.positions[o];
      const y = this.positions[o + 1];
      const z = this.positions[o + 2];
      this.streakPositions[s] = x;
      this.streakPositions[s + 1] = y;
      this.streakPositions[s + 2] = z;
      this.streakPositions[s + 3] = x - sx;
      this.streakPositions[s + 4] = y - sy;
      this.streakPositions[s + 5] = z - sz;
    }
    this.streaks.geometry.attributes.position.needsUpdate = true;
  }
}
