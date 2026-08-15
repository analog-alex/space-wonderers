import {
  AdditiveBlending,
  Group,
  Sprite,
  SpriteMaterial,
  type Vector3,
} from "three";
import {
  NEBULA_COUNT,
  NEBULA_FIELD,
  NEBULA_PARALLAX,
} from "../config/constants";
import { nebulaTexture } from "./textures";

const HUES = [0x7c5cff, 0xff6fae, 0x35d0ff, 0xffa257, 0x5affc4];

/** Distant clouds that scroll slowly for parallax and give each stretch of
 * space its own colour. */
export class Nebulae {
  readonly root = new Group();
  private readonly clouds: Sprite[] = [];

  constructor() {
    for (let i = 0; i < NEBULA_COUNT; i += 1) {
      const cloud = new Sprite(
        new SpriteMaterial({
          map: nebulaTexture(HUES[i % HUES.length]),
          blending: AdditiveBlending,
          depthWrite: false,
          transparent: true,
          opacity: 0.5 + Math.random() * 0.35,
        })
      );
      cloud.position.set(
        (Math.random() * 2 - 1) * NEBULA_FIELD,
        (Math.random() * 2 - 1) * NEBULA_FIELD * 0.6,
        (Math.random() * 2 - 1) * NEBULA_FIELD
      );
      const size = NEBULA_FIELD * (0.5 + Math.random() * 0.6);
      cloud.scale.set(size, size, 1);
      this.root.add(cloud);
      this.clouds.push(cloud);
    }
  }

  update(scroll: Vector3): void {
    for (const cloud of this.clouds) {
      cloud.position.addScaledVector(scroll, NEBULA_PARALLAX);
      for (const axis of ["x", "y", "z"] as const) {
        if (cloud.position[axis] > NEBULA_FIELD)
          cloud.position[axis] -= NEBULA_FIELD * 2;
        else if (cloud.position[axis] < -NEBULA_FIELD)
          cloud.position[axis] += NEBULA_FIELD * 2;
      }
    }
  }
}
