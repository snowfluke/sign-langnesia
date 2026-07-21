import type { InferenceSession } from "onnxruntime-common";

/** Where the classifier model and its labels come from. */
export type ModelOptions = {
  /** Model source: filesystem path (Node/Bun), http(s) URL, or raw bytes. */
  classifier?: string | ArrayBuffer;
  /** Class labels in model output order. Defaults to A to Z (BISINDO alphabet). */
  labels?: readonly string[];
};

export type ClassificationOptions = {
  /** How many top predictions to return in `scores`. Default 3. */
  topK?: number;
};

export type DebuggingOptions = {
  /** Log lifecycle events to the console. Default false. */
  verbose?: boolean;
};

/** Constructor options for `SignLangnesiaService`. */
export type SignLangnesiaOptions = {
  model?: ModelOptions;
  classification?: ClassificationOptions;
  debugging?: DebuggingOptions;
  /** Passed straight to onnxruntime's `InferenceSession.create`. */
  session?: InferenceSession.SessionOptions;
};

/** Per-call overrides for `classify()`. */
export type ClassifyOptions = {
  topK?: number;
};

export type LabelScore = {
  label: string;
  /** Softmax probability, 0..1. */
  confidence: number;
};

export type ClassifyResult = {
  /** Top-1 label. */
  label: string;
  /** Top-1 probability, 0..1. */
  confidence: number;
  /** Top-k predictions, descending. */
  scores: LabelScore[];
};
