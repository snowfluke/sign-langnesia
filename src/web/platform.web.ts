import * as ort from "onnxruntime-web";
import { CanvasProcessor, CanvasToolkit } from "ppu-ocv/canvas-web";
import type {
  CanvasOps,
  CanvasProcessorLike,
  CanvasToolkitLike,
  CoreCanvas,
  OrtNamespace,
  PlatformProvider,
} from "../core/platform.js";
import { isCoreCanvas } from "../core/platform.js";

// Provide a default for ONNX WASM paths to avoid 404s on CDN or unbundled
// usage. Override by setting ort.env.wasm.wasmPaths before initialization.
if (typeof window !== "undefined" && !ort.env.wasm.wasmPaths) {
  ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.26.0/dist/";
}

/** True when `navigator.gpu` is present and at least one adapter is available. */
export async function isWebGpuAvailable(): Promise<boolean> {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { gpu?: { requestAdapter: () => Promise<unknown | null> } };
  if (!nav.gpu || typeof nav.gpu.requestAdapter !== "function") return false;
  try {
    const adapter = await nav.gpu.requestAdapter();
    return adapter !== null && adapter !== undefined;
  } catch {
    return false;
  }
}

/** Returns `["webgpu", "wasm"]` when WebGPU is available, otherwise `["wasm"]`. */
export async function getDefaultWebExecutionProviders(): Promise<
  ort.InferenceSession.SessionOptions["executionProviders"]
> {
  if (await isWebGpuAvailable()) {
    return ["webgpu", "wasm"];
  }
  return ["wasm"];
}

/** What `classify()` accepts in the browser. */
export type WebClassifySource =
  | string
  | ArrayBuffer
  | HTMLImageElement
  | HTMLVideoElement
  | HTMLCanvasElement
  | OffscreenCanvas
  | ImageBitmap;

type DrawableContext = {
  drawImage(source: CanvasImageSource, x: number, y: number): void;
};

export class WebPlatformProvider implements PlatformProvider<WebClassifySource> {
  public readonly ort: OrtNamespace = ort as unknown as OrtNamespace;
  private scratch: OffscreenCanvas | HTMLCanvasElement | null = null;

  public readonly canvas: CanvasOps = {
    prepareCanvas: (image: ArrayBuffer): Promise<CoreCanvas> =>
      CanvasProcessor.prepareCanvas(image) as unknown as Promise<CoreCanvas>,
    createProcessor: (canvas: CoreCanvas): CanvasProcessorLike =>
      new CanvasProcessor(canvas as never) as unknown as CanvasProcessorLike,
    getToolkit: (): CanvasToolkitLike =>
      CanvasToolkit.getInstance() as unknown as CanvasToolkitLike,
  };

  public async loadResource(
    source: string | ArrayBuffer | undefined,
    fallback: string
  ): Promise<ArrayBuffer> {
    if (source instanceof ArrayBuffer) {
      return source;
    }
    const url = typeof source === "string" ? source : fallback;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch resource from ${url} (${response.status})`);
    }
    return response.arrayBuffer();
  }

  public async toCanvas(source: WebClassifySource): Promise<CoreCanvas> {
    if (typeof source === "string" || source instanceof ArrayBuffer) {
      const bytes = await this.loadResource(source, "");
      return this.canvas.prepareCanvas(bytes);
    }
    if (isCoreCanvas(source)) {
      return source;
    }

    // <video>, <img>, ImageBitmap → draw the full frame; core crops/resizes.
    let width: number;
    let height: number;
    if (typeof HTMLVideoElement !== "undefined" && source instanceof HTMLVideoElement) {
      width = source.videoWidth;
      height = source.videoHeight;
    } else if (typeof HTMLImageElement !== "undefined" && source instanceof HTMLImageElement) {
      width = source.naturalWidth;
      height = source.naturalHeight;
    } else {
      width = source.width;
      height = source.height;
    }
    if (!width || !height) {
      throw new Error("Source has no pixels yet (video not ready?)");
    }

    const canvas = this.scratchCanvas(width, height);
    const ctx = canvas.getContext("2d", { willReadFrequently: true }) as DrawableContext | null;
    if (!ctx) throw new Error("2d canvas context unavailable");
    ctx.drawImage(source, 0, 0);
    return canvas as unknown as CoreCanvas;
  }

  private scratchCanvas(width: number, height: number): OffscreenCanvas | HTMLCanvasElement {
    if (this.scratch && this.scratch.width === width && this.scratch.height === height) {
      return this.scratch;
    }
    if (typeof OffscreenCanvas !== "undefined") {
      this.scratch = new OffscreenCanvas(width, height);
    } else {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      this.scratch = canvas;
    }
    return this.scratch;
  }
}
