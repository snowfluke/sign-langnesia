import type { InferenceSession, Tensor } from "onnxruntime-common";

/** Decoded RGBA pixels at the model input size. */
export type RawImage = {
  data: Uint8ClampedArray;
  width: number;
  height: number;
};

/** Minimal 2d-context surface the core needs from any canvas backend. */
export type CoreCanvasContext = {
  getImageData(x: number, y: number, w: number, h: number): RawImage;
};

/** Minimal structural canvas shared by @napi-rs/canvas, DOM, and Skia backends. */
export type CoreCanvas = {
  width: number;
  height: number;
  // Options stay untyped: each backend declares its own attribute bag and the
  // shapes share no common property.
  getContext(type: "2d", options?: Record<string, unknown>): CoreCanvasContext | null;
};

/** Anything with a 2d context is treated as a canvas. */
export function isCoreCanvas(value: unknown): value is CoreCanvas {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as CoreCanvas).getContext === "function"
  );
}

/** Chainable subset of ppu-ocv's `CanvasProcessor` the core relies on. */
export type CanvasProcessorLike = {
  resize(options: { width: number; height: number }): CanvasProcessorLike;
  toCanvas(): CoreCanvas;
};

/** Subset of ppu-ocv's `CanvasToolkit` the core relies on. */
export type CanvasToolkitLike = {
  crop(options: {
    canvas: CoreCanvas;
    bbox: { x0: number; y0: number; x1: number; y1: number };
  }): CoreCanvas;
};

/** Canvas operations backed by the platform's ppu-ocv canvas entry point. */
export type CanvasOps = {
  prepareCanvas(image: ArrayBuffer): Promise<CoreCanvas>;
  createProcessor(canvas: CoreCanvas): CanvasProcessorLike;
  getToolkit(): CanvasToolkitLike;
};

/** Minimal ORT namespace shape shared by node, web, and react-native flavors. */
export type OrtNamespace = {
  InferenceSession: typeof InferenceSession;
  Tensor: typeof Tensor;
};

/** Runtime seam: everything platform-specific lives behind this. */
export type PlatformProvider<TSource> = {
  ort: OrtNamespace;
  canvas: CanvasOps;
  /** Resolve a model source (path/URL/bytes) to raw bytes. */
  loadResource(source: string | ArrayBuffer | undefined, fallback: string): Promise<ArrayBuffer>;
  /** Normalize any supported source into a backend canvas. */
  toCanvas(source: TSource): Promise<CoreCanvas>;
};
