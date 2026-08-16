import { element } from "./dom";

export type GameOverCause = "void" | "star";

const COPY: Record<
  GameOverCause,
  { eyebrow: string; title: string; subtitle: string }
> = {
  void: {
    eyebrow: "Anomaly encountered",
    title: "Consumed by the void",
    subtitle: "The Wonderer's telemetry ends at the event horizon.",
  },
  star: {
    eyebrow: "Flight terminated",
    title: "Hull breached",
    subtitle: "The Wonderer didn't survive contact with the star.",
  },
};

/** Shown once a run ends — sucked into the black hole or flown into the
 * star. Restart just reloads, there's no mid-run state worth preserving. */
export class GameOverScreen {
  private readonly screen = element("gameover-screen");
  private readonly panel = element("gameover-panel");
  private readonly eyebrow = element("gameover-eyebrow");
  private readonly title = element("gameover-title");
  private readonly subtitle = element("gameover-subtitle");
  private readonly restartButton = element<HTMLButtonElement>("restart-button");

  constructor() {
    this.restartButton.addEventListener("click", () => location.reload());
  }

  show(cause: GameOverCause): void {
    const copy = COPY[cause];
    this.eyebrow.textContent = copy.eyebrow;
    this.title.textContent = copy.title;
    this.subtitle.textContent = copy.subtitle;
    this.panel.classList.toggle("panel-void", cause === "void");
    this.screen.classList.add("visible");
    this.restartButton.focus();
  }
}
