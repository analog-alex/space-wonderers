import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  EllipseCurve,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PointLight,
  RingGeometry,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  Vector3,
} from "three";
import {
  PLANET_ORBIT_SPEED,
  PLANETS,
  STAR_COLOR,
  STAR_LIGHT_INTENSITY,
  STAR_LIGHT_RANGE,
  STAR_RADIUS,
} from "../config/constants";
import { glowTexture, planetTexture } from "./textures";

interface Body {
  group: Group;
  mesh: Mesh;
  orbitRadius: number;
  orbitSpeed: number;
  tilt: number;
  phase: number;
  spin: number;
}

const orbitPosition = (body: Body, elapsed: number, out: Vector3): Vector3 => {
  const angle = body.phase + elapsed * body.orbitSpeed;
  out.set(
    Math.cos(angle) * body.orbitRadius,
    Math.sin(angle) * body.orbitRadius * Math.sin(body.tilt),
    Math.sin(angle) * body.orbitRadius * Math.cos(body.tilt)
  );
  return out;
};

/** The star and its three planets, fixed at the centre of the flyable cube.
 * `root` sits at system-space origin; `update` slides the whole group by
 * `-shipPosition` each frame (same trick as the ship-relative camera), so
 * everything inside — star, planets, orbit rings — stays correctly placed
 * relative to the ship without each child tracking the offset separately. */
export class SolarSystem {
  readonly root = new Group();
  private readonly star = new Group();
  private readonly bodies: Body[] = [];
  private readonly scratch = new Vector3();

  constructor() {
    const starMesh = new Mesh(
      new SphereGeometry(STAR_RADIUS, 32, 32),
      new MeshBasicMaterial({ color: STAR_COLOR })
    );
    this.star.add(starMesh);

    const corona = new Sprite(
      new SpriteMaterial({
        map: glowTexture(STAR_COLOR, 256),
        blending: AdditiveBlending,
        depthWrite: false,
        transparent: true,
      })
    );
    corona.scale.setScalar(STAR_RADIUS * 6);
    this.star.add(corona);

    // decay=0: a stylised, non-physical falloff so the star reads as a
    // light source across AU-scale distances without needing enormous
    // physically-correct intensity values.
    const light = new PointLight(
      STAR_COLOR,
      STAR_LIGHT_INTENSITY,
      STAR_LIGHT_RANGE,
      0
    );
    this.star.add(light);
    this.root.add(this.star);

    for (const config of PLANETS) {
      const group = new Group();
      const mesh = new Mesh(
        new SphereGeometry(config.radius, 28, 28),
        new MeshStandardMaterial({
          map: planetTexture(config.color, config.banded),
          roughness: 0.85,
          metalness: 0.05,
        })
      );
      group.add(mesh);

      if (config.ring) {
        const ring = new Mesh(
          new RingGeometry(config.radius * 1.5, config.radius * 2.3, 48),
          new MeshBasicMaterial({
            color: new Color(config.color).multiplyScalar(0.8),
            transparent: true,
            opacity: 0.5,
            side: 2,
          })
        );
        ring.rotation.x = Math.PI / 2.4;
        group.add(ring);
      }

      const orbitCurve = new EllipseCurve(
        0,
        0,
        config.orbitRadius,
        config.orbitRadius,
        0,
        Math.PI * 2
      );
      const orbitLine = new Line(
        new BufferGeometry().setFromPoints(orbitCurve.getPoints(128)),
        new LineBasicMaterial({
          color: 0x8fa6d8,
          transparent: true,
          opacity: 0.18,
        })
      );
      orbitLine.rotation.x = Math.PI / 2 + config.tilt;
      this.root.add(orbitLine);

      this.root.add(group);
      this.bodies.push({
        group,
        mesh,
        orbitRadius: config.orbitRadius,
        // Linear speed is shared across planets; angular speed falls off
        // with orbit radius so every planet actually moves at that speed.
        orbitSpeed: PLANET_ORBIT_SPEED / config.orbitRadius,
        tilt: config.tilt,
        phase: config.phase,
        spin: 0.15 + Math.random() * 0.25,
      });
    }
  }

  update(dt: number, elapsed: number, shipPosition: Vector3): void {
    this.root.position.copy(shipPosition).negate();

    for (const body of this.bodies) {
      orbitPosition(body, elapsed, this.scratch);
      body.group.position.copy(this.scratch);
      body.mesh.rotation.y += body.spin * dt;
    }
  }
}
