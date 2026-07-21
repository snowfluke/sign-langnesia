import { createCanvas } from "@napi-rs/canvas";
import { describe, expect, test } from "bun:test";
import { resolve } from "node:path";
import { softmax, topK } from "../src/core/scores.js";
import { BISINDO_LABELS, SignLangnesiaService } from "../src/index.js";

const MODEL_PATH = resolve(import.meta.dir, "../models/efficientnet_bisindo.onnx");

describe("scores", () => {
  test("softmax sums to 1 and preserves argmax", () => {
    const logits = new Float32Array([1.5, -0.2, 3.1, 0.0]);
    const probs = softmax(logits);
    const sum = probs.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 5);
    expect(probs.indexOf(Math.max(...probs))).toBe(2);
  });

  test("topK sorts descending and clamps k", () => {
    const probs = new Float32Array([0.1, 0.7, 0.2]);
    const scores = topK(probs, ["A", "B", "C"], 2);
    expect(scores.map((s) => s.label)).toEqual(["B", "C"]);
    expect(topK(probs, ["A", "B", "C"], 0)).toHaveLength(1);
  });
});

describe("SignLangnesiaService (node)", () => {
  test(
    "classifies a canvas frame end to end",
    async () => {
      const service = new SignLangnesiaService({ model: { classifier: MODEL_PATH } });
      await service.initialize();
      expect(service.isInitialized()).toBe(true);

      const canvas = createCanvas(640, 480);
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#c8a17a";
      ctx.fillRect(0, 0, 640, 480);

      const full = await service.classify(canvas, { topK: 26 });
      expect(BISINDO_LABELS).toContain(full.label);
      expect(full.scores).toHaveLength(26);
      const sum = full.scores.reduce((a, s) => a + s.confidence, 0);
      expect(sum).toBeCloseTo(1, 3);

      const again = await service.classify(canvas);
      expect(again.label).toBe(full.label);
      expect(again.scores).toHaveLength(3);

      await service.destroy();
      expect(service.isInitialized()).toBe(false);
    },
    { timeout: 60_000 }
  );
});
