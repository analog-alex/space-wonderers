import { Euler, Quaternion, Vector3 } from "three";
import {
  AUTO_ROLL,
  CRUISE_SPEED,
  MAX_SPEED,
  MIN_SPEED,
  PITCH_RATE,
  ROLL_RATE,
  THROTTLE_RATE,
  TURN_SMOOTHING,
  WARP_SPEED,
  WARP_SPIN_DOWN,
  WARP_SPIN_UP,
  YAW_RATE,
} from "../config/constants";
import type { Input } from "./Input";

const damp = (current: number, target: number, rate: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-rate * dt));

/** Flight model. The ship never translates — it accumulates an orientation and
 * a speed, and the world is scrolled against the resulting velocity. */
export class ShipController {
  readonly orientation = new Quaternion();
  readonly velocity = new Vector3();
  /** 0 while cruising, 1 at full warp. */
  warp = 0;
  speed = CRUISE_SPEED;

  private throttle = CRUISE_SPEED;
  private pitch = 0;
  private yaw = 0;
  private roll = 0;
  private readonly step = new Euler(0, 0, 0, "YXZ");
  private readonly stepQuaternion = new Quaternion();
  private readonly forward = new Vector3();

  update(input: Input, dt: number): void {
    const pitchTarget = input.axis("pitchUp", "pitchDown");
    const yawTarget = input.axis("yawLeft", "yawRight");
    const rollTarget = input.axis("rollLeft", "rollRight");

    this.pitch = damp(this.pitch, pitchTarget, TURN_SMOOTHING, dt);
    this.yaw = damp(this.yaw, yawTarget, TURN_SMOOTHING, dt);
    this.roll = damp(this.roll, rollTarget, TURN_SMOOTHING, dt);

    // Turning slows down under warp, otherwise it feels twitchy at speed.
    const authority = 1 - this.warp * 0.55;
    this.step.set(
      -this.pitch * PITCH_RATE * authority * dt,
      -this.yaw * YAW_RATE * authority * dt,
      -(this.roll * ROLL_RATE + this.yaw * AUTO_ROLL) * dt
    );
    this.orientation.multiply(this.stepQuaternion.setFromEuler(this.step));
    this.orientation.normalize();

    this.throttle = Math.min(
      MAX_SPEED,
      Math.max(
        MIN_SPEED,
        this.throttle +
          input.axis("decelerate", "accelerate") * THROTTLE_RATE * dt
      )
    );

    const warping = input.isDown("warp");
    const spin = warping ? WARP_SPIN_UP : WARP_SPIN_DOWN;
    this.warp = Math.min(
      1,
      Math.max(0, this.warp + (warping ? dt : -dt) / spin)
    );

    const eased = this.warp * this.warp * (3 - 2 * this.warp);
    this.speed = this.throttle + (WARP_SPEED - this.throttle) * eased;

    this.forward.set(0, 0, -1).applyQuaternion(this.orientation);
    this.velocity.copy(this.forward).multiplyScalar(this.speed);
  }

  /** Throttle as 0..1 of the sublight range, ignoring warp. */
  get throttleRatio(): number {
    return (this.throttle - MIN_SPEED) / (MAX_SPEED - MIN_SPEED);
  }
}
