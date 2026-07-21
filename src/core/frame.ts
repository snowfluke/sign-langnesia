import type { CanvasOps, CoreCanvas, RawImage } from "./platform.js";

/** Center-crop to square, resize to `size`×`size`, and read back RGBA pixels. */
export function frameToRawImage(canvas: CoreCanvas, size: number, ops: CanvasOps): RawImage {
  const { width, height } = canvas;
  if (!width || !height) {
    throw new Error("Source has no pixels yet (video not ready?)");
  }

  const side = Math.min(width, height);
  const x0 = Math.floor((width - side) / 2);
  const y0 = Math.floor((height - side) / 2);
  const square =
    width === height
      ? canvas
      : ops.getToolkit().crop({ canvas, bbox: { x0, y0, x1: x0 + side, y1: y0 + side } });

  const resized =
    square.width === size && square.height === size
      ? square
      : ops.createProcessor(square).resize({ width: size, height: size }).toCanvas();

  const ctx = resized.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2d canvas context unavailable");
  return ctx.getImageData(0, 0, size, size);
}
