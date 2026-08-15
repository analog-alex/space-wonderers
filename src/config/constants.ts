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
