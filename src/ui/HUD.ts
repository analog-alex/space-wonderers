import { SECTORS, UNITS_PER_AU } from "../config/constants";
import { element } from "./dom";

export interface Telemetry {
  speed: number;
  warp: number;
  distance: number;
  /** 0..1, how deep into the boundary pushback zone the ship is. */
  boundaryWarning: number;
}

export class HUD {
  private readonly root = element("hud");
  private readonly speed = element("speed");
  private readonly warpBar = element("warp-bar");
  private readonly warpStatus = element("warp-status");
  private readonly warpBlock = document.querySelector(".hud-warp");
  private readonly sector = element("sector");
  private readonly distance = element("distance");
  private readonly boundaryWarning = element("boundary-warning");
  private lastSector = "";

  show(): void {
    this.root.classList.remove("hidden");
  }

  hide(): void {
    this.root.classList.add("hidden");
  }

  update({ speed, warp, distance, boundaryWarning }: Telemetry): void {
    this.speed.textContent = Math.round(speed).toLocaleString("en-US");
    this.warpBar.style.width = `${warp * 100}%`;

    const engaged = warp > 0.98;
    this.warpStatus.textContent = engaged
      ? "Warp engaged"
      : warp > 0.02
        ? "Spinning up"
        : "Hold SPACE";
    this.warpBlock?.classList.toggle("engaged", engaged);

    const au = distance / UNITS_PER_AU;
    this.distance.textContent = au.toFixed(2);

    const sector = SECTORS[Math.floor(au / 3) % SECTORS.length];
    if (sector !== this.lastSector) {
      this.sector.textContent = sector;
      this.lastSector = sector;
    }

    this.boundaryWarning.classList.toggle("visible", boundaryWarning > 0.02);
    this.boundaryWarning.style.setProperty(
      "--boundary-intensity",
      `${boundaryWarning}`
    );
  }
}
