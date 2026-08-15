import { element } from "./dom";

/** ESC (or the Resume button) suspends the flight. Stays inert until the game
 * is actually running so it can't cover the start screen. */
export class PauseMenu {
  private readonly screen = element("pause-screen");
  private readonly resumeButton = element<HTMLButtonElement>("resume-button");
  private enabled = false;
  private paused = false;

  constructor(private readonly onChange: (paused: boolean) => void) {
    this.resumeButton.addEventListener("click", () => this.set(false));
    globalThis.addEventListener("keydown", (event) => {
      if (event.code !== "Escape" || !this.enabled) return;
      event.preventDefault();
      this.set(!this.paused);
    });
  }

  enable(): void {
    this.enabled = true;
  }

  private set(paused: boolean): void {
    if (paused === this.paused) return;
    this.paused = paused;
    this.screen.classList.toggle("visible", paused);
    if (paused) this.resumeButton.focus();
    this.onChange(paused);
  }
}
