import {
  AdditiveBlending,
  BufferGeometry,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  RingGeometry,
  SphereGeometry,
  Vector3,
} from "three";
import {
  BLACK_HOLE_CAPTURE_RADIUS,
  BLACK_HOLE_DISK_RADIUS,
  BLACK_HOLE_POSITION,
  BLACK_HOLE_PULL_ACCEL,
  BLACK_HOLE_PULL_RADIUS,
  BLACK_HOLE_RADIUS,
} from "../config/constants";
import { accretionDiskTexture } from "./textures";

const streak = (radius: number, turns: number, tilt: number): Line => {
  const points: Vector3[] = [];
  for (let i = 0; i <= 64; i += 1) {
    const t = i / 64;
    const angle = t * Math.PI * turns;
    const r = radius * (0.15 + t * 0.85);
    points.push(new Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r));
  }
  const line = new Line(
    new BufferGeometry().setFromPoints(points),
    new LineBasicMaterial({
      color: 0xffe3b0,
      transparent: true,
      opacity: 0.35,
    })
  );
  line.rotation.x = tilt;
  return line;
};

/** The easter egg: a dark sphere with a swirling accretion disk, tucked off
 * the ecliptic. `root` is repositioned each frame like `SolarSystem.root` —
 * slid by `-shipPosition` since its own position is fixed in system space. */
export class BlackHole {
  readonly root = new Group();
  readonly position = new Vector3(
    BLACK_HOLE_POSITION.x,
    BLACK_HOLE_POSITION.y,
    BLACK_HOLE_POSITION.z
  );
  private readonly disk: Mesh;

  constructor() {
    const horizon = new Mesh(
      new SphereGeometry(BLACK_HOLE_RADIUS, 32, 32),
      new MeshBasicMaterial({ color: 0x000000 })
    );
    this.root.add(horizon);

    this.disk = new Mesh(
      new RingGeometry(BLACK_HOLE_RADIUS * 1.3, BLACK_HOLE_DISK_RADIUS, 64),
      new MeshBasicMaterial({
        map: accretionDiskTexture(0xffb35c),
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
        side: 2,
      })
    );
    this.disk.rotation.x = Math.PI / 2.3;
    this.root.add(this.disk);

    this.root.add(streak(BLACK_HOLE_DISK_RADIUS * 1.1, 3.4, Math.PI / 2.3));
    this.root.add(
      streak(BLACK_HOLE_DISK_RADIUS * 0.9, -3.1, Math.PI / 2.3 + 0.3)
    );

    this.root.position.copy(this.position);
  }

  update(dt: number, shipPosition: Vector3): void {
    this.root.position.copy(this.position).sub(shipPosition);
    this.disk.rotation.z += dt * 0.6;
  }

  /** Inward acceleration toward the hole, zero outside the pull radius. */
  pullAcceleration(shipPosition: Vector3, out: Vector3): Vector3 {
    out.copy(this.position).sub(shipPosition);
    const distance = out.length();
    if (distance > BLACK_HOLE_PULL_RADIUS || distance < 1e-3) {
      return out.set(0, 0, 0);
    }
    const falloff = 1 - distance / BLACK_HOLE_PULL_RADIUS;
    const strength = BLACK_HOLE_PULL_ACCEL * falloff * falloff;
    return out.normalize().multiplyScalar(strength);
  }

  isCaptured(shipPosition: Vector3): boolean {
    return this.position.distanceTo(shipPosition) < BLACK_HOLE_CAPTURE_RADIUS;
  }
}
