import {
  AdditiveBlending,
  Box3,
  Group,
  Mesh,
  type MeshStandardMaterial,
  Sprite,
  SpriteMaterial,
  type Texture,
  Vector3,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { glowTexture } from "./textures";

const MODEL_URL = `${import.meta.env.BASE_URL}models/viper.glb`;
/** Hull length in world units once the model is normalized. */
const TARGET_LENGTH = 5;
/** Nozzle placement, as a fraction of hull length, so the exhaust stays put
 * whenever TARGET_LENGTH changes. */
const NOZZLE = { x: 0.073, y: 0.008, z: 0.484 };
/** Plume geometry, likewise proportional: idle length, throttle gain, width,
 * and how far back the sprite's centre sits as it stretches. */
const PLUME = {
  idle: 0.177,
  gain: 0.806,
  width: 0.097,
  flare: 0.048,
  reach: 0.42,
};

/** The player ship. It sits at the origin and only ever rotates — the universe
 * moves instead. */
export class Ship {
  readonly root = new Group();
  private readonly flares: Sprite[] = [];
  private readonly glow: Texture = glowTexture(0x9fd4ff);

  constructor() {
    for (const side of [-1, 1]) {
      const flare = new Sprite(
        new SpriteMaterial({
          map: this.glow,
          blending: AdditiveBlending,
          depthWrite: false,
          transparent: true,
        })
      );
      flare.position.set(
        side * NOZZLE.x * TARGET_LENGTH,
        NOZZLE.y * TARGET_LENGTH,
        NOZZLE.z * TARGET_LENGTH
      );
      this.root.add(flare);
      this.flares.push(flare);
    }
  }

  /** Loads the hull and normalizes it: centred on its own bounds, nose down
   * -Z, and scaled to TARGET_LENGTH whatever units it was authored in. */
  async load(): Promise<void> {
    const gltf = await new GLTFLoader().loadAsync(MODEL_URL);
    const hull = gltf.scene;

    // The model is authored nose-along--X; swing it round to the -Z the flight
    // model treats as forward.
    hull.rotation.y = -Math.PI / 2;
    hull.updateMatrixWorld(true);

    const bounds = new Box3().setFromObject(hull);
    const size = bounds.getSize(new Vector3());
    const centre = bounds.getCenter(new Vector3());
    const scale = TARGET_LENGTH / size.z;

    hull.position.sub(centre).multiplyScalar(scale);
    hull.scale.setScalar(scale);

    hull.traverse((node) => {
      if (!(node instanceof Mesh)) return;
      const material = node.material as MeshStandardMaterial;
      // Meshy bakes a little ambient occlusion into the albedo; nudge the
      // response so the hull still reads against a black sky.
      material.envMapIntensity = 1.4;
      material.roughness = Math.min(material.roughness, 0.65);
    });

    this.root.add(hull);
  }

  /** `intensity` runs 0..1 for throttle and beyond 1 while warping. */
  setThrust(intensity: number, elapsed: number): void {
    const flicker = 0.92 + Math.sin(elapsed * 34) * 0.08;
    for (const flare of this.flares) {
      const length =
        (PLUME.idle + intensity * PLUME.gain) * TARGET_LENGTH * flicker;
      flare.scale.set(
        (PLUME.width + intensity * PLUME.flare) * TARGET_LENGTH,
        length,
        1
      );
      flare.position.z = NOZZLE.z * TARGET_LENGTH + length * PLUME.reach;
      flare.material.opacity = Math.min(0.9, 0.3 + intensity * 0.55);
    }
  }
}
