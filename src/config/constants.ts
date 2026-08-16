/** The world scrolls past a ship parked at the origin, so nothing drifts into
 * float imprecision no matter how long the sortie runs. */
export const STAR_COUNT = 4200;
/** Half-size of the cube stars are wrapped inside, in world units. */
export const STAR_FIELD = 620;
export const NEBULA_COUNT = 7;
export const NEBULA_FIELD = 2600;
/** Nebulae scroll slower than stars to read as far away. */
export const NEBULA_PARALLAX = 0.07;

export const CRUISE_SPEED = 90;
export const MIN_SPEED = 25;
export const MAX_SPEED = 190;
export const WARP_SPEED = 620;
export const THROTTLE_RATE = 70;
/** Seconds to spin the warp core up and down. */
export const WARP_SPIN_UP = 1.6;
export const WARP_SPIN_DOWN = 0.9;

export const PITCH_RATE = 1.15;
export const YAW_RATE = 0.9;
export const ROLL_RATE = 1.9;
/** Banking the ship into a turn, purely cosmetic. */
export const AUTO_ROLL = 0.75;
export const TURN_SMOOTHING = 4.2;

export const BASE_FOV = 62;
export const WARP_FOV = 96;
export const CAMERA_OFFSET = { back: 13, up: 3.4 };
export const CAMERA_LAG = 5.5;
/** How far below centre the ship sits, as a fraction of screen height. */
export const SHIP_SCREEN_DROP = 0.1;

/** World units travelled per astronomical unit shown on the HUD. */
export const UNITS_PER_AU = 6000;

export const SECTORS = [
  "Aurora",
  "Vela Drift",
  "Cygnus Shelf",
  "Halcyon Deep",
  "Perihelion",
];

/** Half the side of the flyable cube: a 5 AU box centred on the system. */
export const SYSTEM_HALF_EXTENT = 2.5 * UNITS_PER_AU;
/** Distance from the wall at which the soft pushback starts. */
export const BOUNDARY_MARGIN = 1400;
/** Inward acceleration applied at full boundary penetration. */
export const BOUNDARY_PUSH_ACCEL = 260;

/** Ship's starting absolute position: out near a wall, system ahead. */
export const SHIP_START_POSITION = { x: 0, y: 400, z: 12000 };

export const STAR_RADIUS = 900;
export const STAR_COLOR = 0xffd27a;
export const STAR_LIGHT_INTENSITY = 7;
export const STAR_LIGHT_RANGE = SYSTEM_HALF_EXTENT * 1.4;

/** Linear orbital speed shared by every planet, world units/second — same
 * units as ship speed (labelled km/s on the HUD). Each planet's angular
 * speed is derived from this and its own orbit radius. */
export const PLANET_ORBIT_SPEED = 100;

export interface PlanetConfig {
  name: string;
  color: number;
  radius: number;
  orbitRadius: number;
  /** Orbital plane tilt away from Y=0, radians. */
  tilt: number;
  /** Starting phase around the orbit, radians. */
  phase: number;
  banded?: boolean;
  ring?: boolean;
}

export const PLANETS: PlanetConfig[] = [
  {
    name: "Rocky Planet",
    color: 0xd97a6a,
    radius: 110,
    orbitRadius: 2400,
    tilt: 0.02,
    phase: 0.4,
  },
  {
    name: "Earth-like Planet",
    color: 0x5aa7e8,
    radius: 170,
    orbitRadius: 4600,
    tilt: -0.035,
    phase: 2.1,
  },
  {
    name: "Gaseous Planet",
    color: 0x8fe0b8,
    radius: 340,
    orbitRadius: 7600,
    tilt: 0.05,
    phase: 4.3,
    banded: true,
    ring: true,
  },
];

/** Tucked off the ecliptic, toward a corner of the cube. */
export const BLACK_HOLE_POSITION = {
  x: -11000,
  y: 4200,
  z: -9200,
};
export const BLACK_HOLE_RADIUS = 260;
export const BLACK_HOLE_DISK_RADIUS = 1500;
export const BLACK_HOLE_PULL_RADIUS = 3400;
export const BLACK_HOLE_CAPTURE_RADIUS = 420;
/** Peak inward acceleration at the capture radius, falling off with distance
 * squared out to BLACK_HOLE_PULL_RADIUS. */
export const BLACK_HOLE_PULL_ACCEL = 2200;

/** Seconds the capture cinematic runs before the Game Over screen appears. */
export const CAPTURE_DURATION = 2.6;
export const CAPTURE_SPIN_RATE = 5.5;
