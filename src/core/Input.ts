const BINDINGS: Record<string, string> = {
  KeyW: "pitchDown",
  ArrowUp: "pitchDown",
  KeyS: "pitchUp",
  ArrowDown: "pitchUp",
  KeyA: "yawLeft",
  ArrowLeft: "yawLeft",
  KeyD: "yawRight",
  ArrowRight: "yawRight",
  KeyQ: "rollLeft",
  KeyE: "rollRight",
  ShiftLeft: "accelerate",
  ShiftRight: "accelerate",
  ControlLeft: "decelerate",
  ControlRight: "decelerate",
  Space: "warp",
};

export type Action = (typeof BINDINGS)[string];

export class Input {
  private readonly active = new Set<string>();

  constructor() {
    globalThis.addEventListener("keydown", this.onKey);
    globalThis.addEventListener("keyup", this.onKey);
    globalThis.addEventListener("blur", () => this.active.clear());
  }

  /** Drops every held key — used when the flight is suspended, so the ship
   * isn't still turning when it resumes. */
  clear(): void {
    this.active.clear();
  }

  isDown(action: Action): boolean {
    return this.active.has(action);
  }

  /** -1, 0 or 1 from a pair of opposing actions. */
  axis(negative: Action, positive: Action): number {
    return (this.isDown(positive) ? 1 : 0) - (this.isDown(negative) ? 1 : 0);
  }

  private readonly onKey = (event: KeyboardEvent): void => {
    const action = BINDINGS[event.code];
    if (!action) return;
    event.preventDefault();
    if (event.type === "keydown") this.active.add(action);
    else this.active.delete(action);
  };
}
