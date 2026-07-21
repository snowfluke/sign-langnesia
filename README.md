# sign-langnesia

BISINDO (Bahasa Isyarat Indonesia) alphabet classifier SDK in TypeScript.
EfficientNet-B3 ONNX, 26 classes (A–Z), 98.8% validation accuracy. Runs
anywhere JavaScript runs: Node.js, Bun, Deno, browsers (WebGPU with WASM
fallback), and React Native. Same architecture as
[ppu-paddle-ocr](https://github.com/PT-Perkasa-Pilar-Utama/ppu-paddle-ocr),
with image handling by [ppu-ocv](https://github.com/PT-Perkasa-Pilar-Utama/ppu-ocv)'s
canvas-native entries (no OpenCV — works in constrained environments like
MV3 service workers).

Model by [Syizuril/bisindo-sign-language](https://huggingface.co/Syizuril/bisindo-sign-language) —
see [models/README.md](models/README.md) for attribution and conversion notes.

## Entry points

| Import path             | Runtime              | ONNX runtime                    | Canvas backend                      |
| :---------------------- | :------------------- | :------------------------------ | :---------------------------------- |
| `sign-langnesia`        | Node.js, Bun, Deno   | `onnxruntime-node`              | `@napi-rs/canvas` (ppu-ocv)         |
| `sign-langnesia/web`    | Browsers, extensions | `onnxruntime-web` (WebGPU→WASM) | DOM / `OffscreenCanvas`             |
| `sign-langnesia/mobile` | React Native         | `onnxruntime-react-native`      | Skia (`@shopify/react-native-skia`) |

## Install

```sh
bun add sign-langnesia onnxruntime-node @napi-rs/canvas           # Node/Bun/Deno
bun add sign-langnesia onnxruntime-web                            # browsers
bun add sign-langnesia onnxruntime-react-native @shopify/react-native-skia  # RN
```

## Usage

Node / Bun / Deno:

```ts
import { SignLangnesiaService } from "sign-langnesia";

const service = new SignLangnesiaService({
  model: { classifier: "/abs/path/to/efficientnet_bisindo.onnx" },
});
await service.initialize();

const buffer = await Bun.file("./sign.jpg").arrayBuffer();
const result = await service.classify(buffer);
console.log(result.label, result.confidence); // "A" 0.98

await service.destroy();
```

Browser (live webcam):

```ts
import { SignLangnesiaService } from "sign-langnesia/web";

const service = new SignLangnesiaService({
  model: { classifier: "/models/efficientnet_bisindo.onnx" },
});
await service.initialize();

const result = await service.classify(videoElement); // any frame source
console.log(result.label);
```

`classify()` accepts a path/URL string, `ArrayBuffer`, or a canvas — plus
`<video>`, `<img>`, `OffscreenCanvas`, and `ImageBitmap` on the web. Frames
are center-cropped to a square and resized to 300×300 with ImageNet
normalization; that preprocessing is built in.

## Lifecycle

`new` → `await initialize()` → `classify()`… → `await destroy()`. One service
per process; keep it warm, destroy on shutdown. `classify()` lazy-initializes
if you skip `initialize()`, but explicit init surfaces model-load failures at
startup.

## Result shape

```ts
type ClassifyResult = {
  label: string; // top-1 letter, "A"–"Z"
  confidence: number; // softmax probability 0..1
  scores: LabelScore[]; // top-k (default 3), descending
};
```

## Live demo

```sh
bun install
bun run build
bun run demo   # http://localhost:3456 — webcam, all client-side
```

## Model

| File                               | What                                                           |
| :--------------------------------- | :------------------------------------------------------------- |
| `models/efficientnet_bisindo.onnx` | EfficientNet-B3, input `[1,3,300,300]`, output `[1,26]` logits |
| `models/class_to_idx.json`         | Label order (A=0 … Z=25), baked into `BISINDO_LABELS`          |

Weights: [Syizuril/bisindo-sign-language](https://huggingface.co/Syizuril/bisindo-sign-language)
(fine-tuned on 9,169 BISINDO images). By default every runtime fetches the
model from this repo's LFS media URL (`MODEL_BASE_URL`) on `initialize()`;
pass a local path or bytes via `model.classifier` to skip the 46 MB download.

## Development

```sh
bun run build       # emit lib/ (js + d.ts)
bun run type-check
bun run lint
bun run fmt
bun test
```

Husky + lint-staged gate commits (oxfmt, oxlint, tsc). Conventional commit
subjects enforced (`feat: …`, `fix: …`, max 80 chars).
