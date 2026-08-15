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
