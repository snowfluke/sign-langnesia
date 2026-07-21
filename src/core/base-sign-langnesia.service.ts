import type { InferenceSession } from "onnxruntime-common";
import {
  BISINDO_LABELS,
  DEFAULT_CLASSIFICATION_OPTIONS,
  DEFAULT_DEBUGGING_OPTIONS,
  INPUT_SIZE,
} from "../constants.js";
import type { ClassifyOptions, ClassifyResult, SignLangnesiaOptions } from "../interface.js";
import { frameToRawImage } from "./frame.js";
import { imageToTensor } from "./image-tensor.js";
import type { PlatformProvider } from "./platform.js";
import { softmax, topK } from "./scores.js";
import { createSessionWithFallback } from "./session-factory.js";

/**
 * Shared classifier lifecycle: `initialize()` → `classify()`… → `destroy()`.
 * Platform specifics (decoding, canvas, ORT flavor) live in the injected
 * `PlatformProvider`; Node and web services are thin subclasses.
 */
export class BaseSignLangnesiaService<TSource> {
  protected session: InferenceSession | null = null;
  protected initializing: Promise<void> | null = null;
  protected readonly labels: readonly string[];
  protected readonly options: SignLangnesiaOptions;

  constructor(
    protected readonly platform: PlatformProvider<TSource>,
    protected readonly defaultModelSource: string,
    options: SignLangnesiaOptions = {}
  ) {
    this.options = options;
    this.labels = options.model?.labels ?? BISINDO_LABELS;
  }

  /** Load the model bytes and build the ONNX session. Idempotent. */
  public async initialize(): Promise<void> {
    if (this.session) return;
    this.initializing ??= this.buildSession();
    try {
      await this.initializing;
    } finally {
      this.initializing = null;
    }
  }

  public isInitialized(): boolean {
    return this.session !== null;
  }

  /** Classify one image/frame. Lazy-initializes on first call. */
  public async classify(source: TSource, options: ClassifyOptions = {}): Promise<ClassifyResult> {
    await this.initialize();
    const session = this.session;
    if (!session) throw new Error("Session failed to initialize");

    const canvas = await this.platform.toCanvas(source);
    const image = frameToRawImage(canvas, INPUT_SIZE, this.platform.canvas);
    const input = imageToTensor(image, this.platform.ort);
    const outputs = await session.run({ [session.inputNames[0]]: input });
    const logits = outputs[session.outputNames[0]].data;
    if (!(logits instanceof Float32Array)) {
      throw new Error("Expected float32 logits output");
    }
    if (logits.length !== this.labels.length) {
      throw new Error(
        `Model emits ${logits.length} classes but ${this.labels.length} labels given`
      );
    }

    const probs = softmax(logits);
    const k =
      options.topK ?? this.options.classification?.topK ?? DEFAULT_CLASSIFICATION_OPTIONS.topK;
    const scores = topK(probs, this.labels, k);
    return { label: scores[0].label, confidence: scores[0].confidence, scores };
  }

  /** Release the ONNX session. */
  public async destroy(): Promise<void> {
    if (this.session) {
      await this.session.release();
      this.session = null;
    }
  }

  private async buildSession(): Promise<void> {
    const bytes = await this.platform.loadResource(
      this.options.model?.classifier,
      this.defaultModelSource
    );
    this.log(`model loaded (${(bytes.byteLength / 1024 / 1024).toFixed(1)} MB)`);
    this.session = await createSessionWithFallback(
      this.platform.ort,
      new Uint8Array(bytes),
      this.options.session,
      (msg) => this.log(msg)
    );
    this.log(`session ready — ${this.labels.length} classes @ ${INPUT_SIZE}×${INPUT_SIZE}`);
  }

  protected log(msg: string): void {
    if (this.options.debugging?.verbose ?? DEFAULT_DEBUGGING_OPTIONS.verbose) {
      console.log(`[sign-langnesia] ${msg}`);
    }
  }
}
