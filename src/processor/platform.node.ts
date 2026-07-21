import * as fs from "node:fs/promises";
import * as ort from "onnxruntime-node";
import { CanvasProcessor, CanvasToolkit } from "ppu-ocv/canvas";
import type {
  CanvasOps,
  CanvasProcessorLike,
  CanvasToolkitLike,
  CoreCanvas,
  OrtNamespace,
  PlatformProvider,
} from "../core/platform.js";
import { isCoreCanvas } from "../core/platform.js";

/** What `classify()` accepts on Node/Bun/Deno. */
export type NodeClassifySource = string | ArrayBuffer | CoreCanvas;

export class NodePlatformProvider implements PlatformProvider<NodeClassifySource> {
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
    const target = typeof source === "string" ? source : fallback;
    if (target.startsWith("http")) {
      const response = await fetch(target);
      if (!response.ok) {
        throw new Error(`Failed to fetch resource from ${target} (${response.status})`);
      }
      return response.arrayBuffer();
    }
    const buffer = await fs.readFile(target);
    return buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    ) as ArrayBuffer;
  }

  public async toCanvas(source: NodeClassifySource): Promise<CoreCanvas> {
    if (isCoreCanvas(source)) {
      return source;
    }
    const bytes = await this.loadResource(source, "");
    return this.canvas.prepareCanvas(bytes);
  }
}
