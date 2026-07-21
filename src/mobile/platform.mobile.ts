import * as ort from "onnxruntime-react-native";
import { CanvasProcessor, CanvasToolkit, getPlatform } from "ppu-ocv/canvas-mobile";
import type {
  CanvasOps,
  CanvasProcessorLike,
  CanvasToolkitLike,
  CoreCanvas,
  OrtNamespace,
  PlatformProvider,
} from "../core/platform.js";

// Importing `ppu-ocv/canvas-mobile` registers the Skia-backed canvas platform
// as a side effect. Skia itself is lazy-required by ppu-ocv only when a canvas
// is actually created, so this import is safe in bundlers for other entries.

/**
 * Default execution providers for React Native.
 *
 * `onnxruntime-react-native` runs on CPU by default; NNAPI (Android) and CoreML
 * (iOS) can be opted into via `session.executionProviders`. WebGPU is not
 * available on React Native.
 */
export function getDefaultMobileExecutionProviders(): ort.InferenceSession.SessionOptions["executionProviders"] {
  return ["cpu"];
}

/** What `classify()` accepts on React Native. */
export type MobileClassifySource = string | ArrayBuffer | CoreCanvas;

export class MobilePlatformProvider implements PlatformProvider<MobileClassifySource> {
  public readonly ort: OrtNamespace = ort as unknown as OrtNamespace;

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
    // React Native provides a global fetch; all string sources are URLs.
    const url = typeof source === "string" ? source : fallback;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch resource from ${url} (${response.status})`);
    }
    return response.arrayBuffer();
  }

  public async toCanvas(source: MobileClassifySource): Promise<CoreCanvas> {
    if (
      typeof source !== "string" &&
      !(source instanceof ArrayBuffer) &&
      getPlatform().isCanvas(source)
    ) {
      return source;
    }
    const bytes = await this.loadResource(
      typeof source === "string" || source instanceof ArrayBuffer ? source : undefined,
      ""
    );
    return this.canvas.prepareCanvas(bytes);
  }
}
