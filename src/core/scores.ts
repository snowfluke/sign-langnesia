import type { LabelScore } from "../interface.js";

/** Numerically stable softmax over raw logits. */
export function softmax(logits: Float32Array): Float32Array {
  let max = -Infinity;
  for (const v of logits) {
    if (v > max) max = v;
  }
  const out = new Float32Array(logits.length);
  let sum = 0;
  for (let i = 0; i < logits.length; i++) {
    const e = Math.exp(logits[i] - max);
    out[i] = e;
    sum += e;
  }
  for (let i = 0; i < out.length; i++) out[i] /= sum;
  return out;
}

/** Top-k labels by probability, descending. */
export function topK(probs: Float32Array, labels: readonly string[], k: number): LabelScore[] {
  const scores: LabelScore[] = [];
  for (let i = 0; i < probs.length; i++) {
    scores.push({ label: labels[i] ?? `#${i}`, confidence: probs[i] });
  }
  scores.sort((a, b) => b.confidence - a.confidence);
  return scores.slice(0, Math.max(1, k));
}
