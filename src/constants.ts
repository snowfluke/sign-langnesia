import type { ClassificationOptions, DebuggingOptions } from "./interface.js";

/** EfficientNet-B3 was trained at 300×300. */
export const INPUT_SIZE: number = 300;

/** ImageNet normalization used during training. */
export const IMAGENET_MEAN: readonly [number, number, number] = [0.485, 0.456, 0.406];
export const IMAGENET_STD: readonly [number, number, number] = [0.229, 0.224, 0.225];

/** Output order of the bundled model (`models/class_to_idx.json`): A=0 … Z=25. */
export const BISINDO_LABELS: readonly string[] = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];

/** Raw-media base of the GitHub repo hosting the model (LFS). */
export const MODEL_BASE_URL: string =
  "https://media.githubusercontent.com/media/snowfluke/sign-langnesia/main";

/**
 * Default model source on every runtime. Fetched on `initialize()`; pass a
 * local path or bytes via `model.classifier` to avoid the 46 MB download.
 */
export const DEFAULT_MODEL_URL: string = `${MODEL_BASE_URL}/models/efficientnet_bisindo.onnx`;

export const DEFAULT_CLASSIFICATION_OPTIONS: Required<ClassificationOptions> = { topK: 3 };
export const DEFAULT_DEBUGGING_OPTIONS: Required<DebuggingOptions> = { verbose: false };
