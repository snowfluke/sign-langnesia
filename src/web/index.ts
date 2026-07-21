/**
 * @module
 *
 * BISINDO (Bahasa Isyarat Indonesia) alphabet classifier for browsers.
 * Uses `onnxruntime-web`: WebGPU when available, WASM otherwise.
 *
 * @example
 * ```ts
 * import { SignLangnesiaService } from "sign-langnesia/web";
 *
 * const service = new SignLangnesiaService();
 * await service.initialize();
 *
 * const result = await service.classify(videoElement);
 * console.log(result.label, result.confidence);
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
} from "../interface.js";

export type {
  CanvasOps,
  CoreCanvas,
  OrtNamespace,
  PlatformProvider,
  RawImage,
} from "../core/platform.js";

export type { WebClassifySource } from "./platform.web.js";
export {
  getDefaultWebExecutionProviders,
  isWebGpuAvailable,
  WebPlatformProvider,
} from "./platform.web.js";
export { SignLangnesiaService } from "./sign-langnesia.service.web.js";

export {
  BISINDO_LABELS,
  DEFAULT_CLASSIFICATION_OPTIONS,
  DEFAULT_DEBUGGING_OPTIONS,
  DEFAULT_MODEL_URL,
  IMAGENET_MEAN,
  IMAGENET_STD,
  INPUT_SIZE,
  MODEL_BASE_URL,
} from "../constants.js";
