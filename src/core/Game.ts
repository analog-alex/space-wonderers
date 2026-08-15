import {
  AmbientLight,
  Color,
  DirectionalLight,
  Fog,
  MathUtils,
  PerspectiveCamera,
  PointLight,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import {
  BASE_FOV,
  CAMERA_LAG,
  CAMERA_OFFSET,
  MAX_SPEED,
  NEBULA_FIELD,
  SHIP_SCREEN_DROP,
  WARP_FOV,
} from "../config/constants";
import { Nebulae } from "../scene/Nebulae";
import { Ship } from "../scene/Ship";
import { Starfield } from "../scene/Starfield";
import { HUD } from "../ui/HUD";
import { PauseMenu } from "../ui/PauseMenu";
import { Input } from "./Input";
import { ShipController } from "./ShipController";

export class Game {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(
    BASE_FOV,
    1,
    0.5,
    NEBULA_FIELD * 4
  );
  private readonly input = new Input();
  private readonly controller = new ShipController();
  private readonly ship = new Ship();
  private readonly starfield = new Starfield();
  private readonly nebulae = new Nebulae();
  private readonly hud = new HUD();
  private readonly pauseMenu = new PauseMenu((paused) =>
    this.setPaused(paused)
  );

  private readonly scroll = new Vector3();
  private readonly cameraTarget = new Vector3();
  private readonly lookTarget = new Vector3();
  private distance = 0;
  private elapsed = 0;
  private lastFrame = 0;
  private running = false;
  private paused = false;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    this.scene.background = new Color(0x05060f);
    this.scene.fog = new Fog(0x05060f, NEBULA_FIELD, NEBULA_FIELD * 3);
    this.scene.add(this.nebulae.root, this.starfield.root, this.ship.root);

    this.scene.add(new AmbientLight(0x5c6ba8, 1.6));
    // Key over the shoulder so the hull reads from the chase camera, plus a
    // warm rim from below to keep the silhouette off the black.
    const key = new DirectionalLight(0xdbe9ff, 3.2);
    key.position.set(-3, 5, 9);
    this.scene.add(key);
    const rim = new PointLight(0xff8fc8, 70, 40);
    rim.position.set(6, -4, -4);
    this.scene.add(rim);

    this.camera.position.set(0, CAMERA_OFFSET.up, CAMERA_OFFSET.back);
    this.resize();
    globalThis.addEventListener("resize", this.resize);
  }

  /** Pulls in the ship model. Call before `start()`. */
  async load(): Promise<void> {
    await this.ship.load();
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.hud.show();
    this.pauseMenu.enable();
    this.lastFrame = performance.now();
    this.renderer.setAnimationLoop(this.frame);
  }

  private setPaused(paused: boolean): void {
    this.paused = paused;
    // Forget held keys, and start the clock fresh so resuming doesn't hand the
    // flight model one enormous frame.
    this.input.clear();
    this.lastFrame = performance.now();
  }

  private readonly frame = (now: number): void => {
    if (this.paused) {
      // Keep drawing the frozen scene so it still shows through the overlay.
      this.renderer.render(this.scene, this.camera);
      return;
    }

    // The first frame's timestamp can land behind the one taken in start(),
    // so clamp both ends rather than just the long-frame end.
    const dt = Math.max(0, Math.min(0.05, (now - this.lastFrame) / 1000));
    this.lastFrame = now;
    this.elapsed += dt;

    this.controller.update(this.input, dt);
    this.ship.root.quaternion.copy(this.controller.orientation);

    this.scroll.copy(this.controller.velocity).multiplyScalar(-dt);
    this.starfield.update(this.scroll, this.controller.warp * 85);
    this.nebulae.update(this.scroll);

    const thrust = this.controller.throttleRatio + this.controller.warp * 1.6;
    this.ship.setThrust(thrust, this.elapsed);

    this.updateCamera(dt);

    this.distance += this.controller.speed * dt;
    this.hud.update({
      speed: this.controller.speed,
      warp: this.controller.warp,
      distance: this.distance,
    });

    this.renderer.render(this.scene, this.camera);
  };

  private updateCamera(dt: number): void {
    const { warp, speed } = this.controller;

    this.cameraTarget
      .set(0, CAMERA_OFFSET.up, CAMERA_OFFSET.back + warp * 5)
      .applyQuaternion(this.controller.orientation);
    const follow = 1 - Math.exp(-CAMERA_LAG * dt);
    this.camera.position.lerp(this.cameraTarget, follow);

    // A touch of shake so warp feels like it costs the hull something.
    if (warp > 0.05) {
      const shake = warp * 0.16;
      this.camera.position.x += (Math.random() - 0.5) * shake;
      this.camera.position.y += (Math.random() - 0.5) * shake;
    }

    const sublight = Math.min(1, speed / MAX_SPEED);
    const fov = BASE_FOV + sublight * 4 + warp * (WARP_FOV - BASE_FOV);
    this.camera.fov += (fov - this.camera.fov) * follow;
    this.camera.updateProjectionMatrix();

    this.lookTarget
      .set(0, 0, -18 - warp * 30)
      .applyQuaternion(this.controller.orientation);
    this.camera.up.set(0, 1, 0).applyQuaternion(this.controller.orientation);
    this.camera.lookAt(this.lookTarget);

    // Then tilt the lens up, dropping the ship SHIP_SCREEN_DROP of the frame.
    // Working in angle rather than in world units makes the shift independent
    // of how far ahead we're aiming, and the live FOV keeps it steady as warp
    // widens the lens.
    this.camera.rotateX(
      Math.atan(
        2 *
          SHIP_SCREEN_DROP *
          Math.tan(this.camera.fov * 0.5 * MathUtils.DEG2RAD)
      )
    );
  }

  private readonly resize = (): void => {
    const width = globalThis.innerWidth;
    const height = globalThis.innerHeight;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  };
}
