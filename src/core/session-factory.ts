import type { InferenceSession } from "onnxruntime-common";
import type { OrtNamespace } from "./platform.js";

/** Providers that are always guaranteed to work as a last-resort fallback. */
const ALWAYS_AVAILABLE_FALLBACKS = new Set(["cpu", "wasm"]);

type ExecutionProvider = NonNullable<InferenceSession.SessionOptions["executionProviders"]>[number];

/** Extract the provider name whether it's a string or a `{ name }` object. */
function providerName(provider: ExecutionProvider): string {
  return typeof provider === "string" ? provider : provider.name;
}

/**
 * Create an ORT session, retrying with a CPU/WASM-only provider list if the
 * original attempt fails. Works around cases like `["webgpu", "wasm"]` on a
 * host where the GPU provider throws during session construction instead of
 * silently falling back. Throws the original error if the provider list was
 * already safe-only.
 */
export async function createSessionWithFallback(
  ort: OrtNamespace,
  modelData: Uint8Array,
  sessionOpts: InferenceSession.SessionOptions | undefined,
  logger: (msg: string) => void
): Promise<InferenceSession> {
  const opts = sessionOpts ?? {};
  try {
    return await ort.InferenceSession.create(modelData, opts);
  } catch (err) {
    const providers = opts.executionProviders ?? [];
    const names = providers.map(providerName);
    const alreadySafe = names.every((n) => ALWAYS_AVAILABLE_FALLBACKS.has(n));
    if (alreadySafe || names.length === 0) {
      throw err;
    }

    const fallback = names.find((n) => ALWAYS_AVAILABLE_FALLBACKS.has(n));
    const fallbackName = fallback ?? (names.includes("wasm") ? "wasm" : "cpu");

    const msg = err instanceof Error ? err.message : String(err);
    logger(
      `executionProviders=${JSON.stringify(names)} failed (${msg}); ` +
        `falling back to ["${fallbackName}"].`
    );

    return ort.InferenceSession.create(modelData, {
      ...opts,
      executionProviders: [fallbackName],
    });
  }
}
