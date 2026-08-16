import { CanvasTexture, Color, SRGBColorSpace, type Texture } from "three";

const draw = (
  size: number,
  paint: (context: CanvasRenderingContext2D) => void
): Texture => {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("2D canvas context unavailable");
  paint(context);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
};

const rgb = (hex: number): string => `#${new Color(hex).getHexString()}`;

/** Soft round falloff used for stars and engine flares. */
export const glowTexture = (hex: number, size = 128): Texture =>
  draw(size, (context) => {
    const half = size / 2;
    const gradient = context.createRadialGradient(
      half,
      half,
      0,
      half,
      half,
      half
    );
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.25, rgb(hex));
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  });

/** Mottled or banded sphere surface for planets. */
export const planetTexture = (hex: number, banded = false): Texture =>
  draw(256, (context) => {
    const base = new Color(hex);
    context.fillStyle = rgb(hex);
    context.fillRect(0, 0, 256, 256);

    if (banded) {
      const bandCount = 7;
      for (let i = 0; i < bandCount; i += 1) {
        const shade = base.clone().multiplyScalar(0.75 + Math.random() * 0.5);
        context.globalAlpha = 0.5;
        context.fillStyle = `#${shade.getHexString()}`;
        const y = (256 / bandCount) * i;
        context.fillRect(0, y, 256, 256 / bandCount + 2);
      }
      context.globalAlpha = 1;
      return;
    }

    context.globalCompositeOperation = "multiply";
    for (let i = 0; i < 90; i += 1) {
      const shade = base.clone().multiplyScalar(0.6 + Math.random() * 0.7);
      const radius = 6 + Math.random() * 22;
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `#${shade.getHexString()}`);
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      context.fillStyle = gradient;
      context.globalAlpha = 0.5;
      context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    context.globalAlpha = 1;
  });

/** Swirling gold spiral for the black hole's accretion disk. */
export const accretionDiskTexture = (hex: number, size = 512): Texture =>
  draw(size, (context) => {
    const half = size / 2;
    context.globalCompositeOperation = "lighter";
    const arms = 3;
    for (let arm = 0; arm < arms; arm += 1) {
      const offset = (arm / arms) * Math.PI * 2;
      context.beginPath();
      for (let t = 0; t <= 1; t += 0.01) {
        const angle = offset + t * Math.PI * 5;
        const radius = t * half * 0.96;
        const x = half + Math.cos(angle) * radius;
        const y = half + Math.sin(angle) * radius;
        if (t === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.strokeStyle = rgb(hex);
      context.lineWidth = size * 0.05;
      context.globalAlpha = 0.55;
      context.stroke();
    }

    const glow = context.createRadialGradient(
      half,
      half,
      half * 0.08,
      half,
      half,
      half
    );
    glow.addColorStop(0, "#fff7e6");
    glow.addColorStop(0.35, rgb(hex));
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.globalAlpha = 0.8;
    context.fillStyle = glow;
    context.fillRect(0, 0, size, size);
    context.globalAlpha = 1;
  });

/** Lumpy cloud used for the distant nebulae. */
export const nebulaTexture = (hex: number, size = 512): Texture =>
  draw(size, (context) => {
    const color = rgb(hex);
    context.globalCompositeOperation = "lighter";
    for (let i = 0; i < 22; i += 1) {
      const radius = size * (0.12 + Math.random() * 0.28);
      const x = size / 2 + (Math.random() - 0.5) * size * 0.5;
      const y = size / 2 + (Math.random() - 0.5) * size * 0.5;
      const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      context.globalAlpha = 0.16;
      context.fillStyle = gradient;
      context.fillRect(0, 0, size, size);
    }
  });
