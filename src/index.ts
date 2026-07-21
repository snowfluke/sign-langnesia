/**
 * @module
 *
 * BISINDO (Bahasa Isyarat Indonesia) alphabet classifier for Node.js, Bun,
 * and Deno. EfficientNet-B3 ONNX, 26 classes (A–Z).
 *
 * @example
 * ```ts
 * import { SignLangnesiaService } from "sign-langnesia";
 *
 * const service = new SignLangnesiaService();
 * await service.initialize();
 *
 * const result = await service.classify(imageBuffer);
 * console.log(result.label, result.confidence);
 *
 * await service.destroy();
 * ```
 */

export type {
  ClassificationOptions,
  ClassifyOptions,
  ClassifyResult,
  DebuggingOptions,
  LabelScore,
  ModelOptions,
  SignLangnesiaOptions,
} from "./interface.js";

export type {
  CanvasOps,
  CoreCanvas,
  OrtNamespace,
  PlatformProvider,
  RawImage,
} from "./core/platform.js";

export type { NodeClassifySource } from "./processor/platform.node.js";
export { NodePlatformProvider } from "./processor/platform.node.js";
export { SignLangnesiaService } from "./processor/sign-langnesia.service.js";

export {
  BISINDO_LABELS,
  DEFAULT_CLASSIFICATION_OPTIONS,
  DEFAULT_DEBUGGING_OPTIONS,
  DEFAULT_MODEL_URL,
  IMAGENET_MEAN,
  IMAGENET_STD,
  INPUT_SIZE,
  MODEL_BASE_URL,
} from "./constants.js";
