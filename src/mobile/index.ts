/**
 * @module
 *
 * BISINDO (Bahasa Isyarat Indonesia) alphabet classifier for React Native.
 * Uses `onnxruntime-react-native` and ppu-ocv's Skia-backed canvas.
 *
 * @example
 * ```ts
 * import { SignLangnesiaService } from "sign-langnesia/mobile";
 *
 * const service = new SignLangnesiaService({
 *   model: { classifier: "https://example.com/efficientnet_bisindo.onnx" },
 * });
 * await service.initialize();
 *
 * const result = await service.classify(frameBuffer);
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

export type { MobileClassifySource } from "./platform.mobile.js";
export { getDefaultMobileExecutionProviders, MobilePlatformProvider } from "./platform.mobile.js";
export { SignLangnesiaService } from "./sign-langnesia.service.mobile.js";

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
