# sign-langnesia

sign-langnesia is a TypeScript SDK that identifies the BISINDO (Bahasa Isyarat
Indonesia) alphabet in images. The model is an EfficientNet-B3 in ONNX format
with 26 classes (A to Z). The SDK operates in Node.js, Bun, Deno, browsers,
and React Native. In browsers, it uses WebGPU when available and WASM when
not.

The architecture is the same as
[ppu-paddle-ocr](https://github.com/PT-Perkasa-Pilar-Utama/ppu-paddle-ocr).
Image operations use the canvas-native entries of
[ppu-ocv](https://github.com/PT-Perkasa-Pilar-Utama/ppu-ocv). These entries do
not use OpenCV. Thus the SDK also operates in constrained environments, for
example MV3 service workers.

The model weights come from
[Syizuril/bisindo-sign-language](https://huggingface.co/Syizuril/bisindo-sign-language).
Refer to [models/README.md](models/README.md) for attribution, conversion
notes, and measured accuracy.

## Entry points

| Import path             | Runtime              | ONNX runtime                     | Canvas backend                      |
| :---------------------- | :------------------- | :------------------------------- | :---------------------------------- |
| `sign-langnesia`        | Node.js, Bun, Deno   | `onnxruntime-node`               | `@napi-rs/canvas` (ppu-ocv)         |
| `sign-langnesia/web`    | Browsers, extensions | `onnxruntime-web` (WebGPU, WASM) | DOM / `OffscreenCanvas`             |
| `sign-langnesia/mobile` | React Native         | `onnxruntime-react-native`       | Skia (`@shopify/react-native-skia`) |

## Installation

```sh
bun add sign-langnesia onnxruntime-node @napi-rs/canvas           # Node/Bun/Deno
bun add sign-langnesia onnxruntime-web                            # browsers
bun add sign-langnesia onnxruntime-react-native @shopify/react-native-skia  # RN
```

## Usage

Node / Bun / Deno:

```ts
import { SignLangnesiaService } from "sign-langnesia";

const service = new SignLangnesiaService();
await service.initialize();

const buffer = await Bun.file("./sign.jpg").arrayBuffer();
const result = await service.classify(buffer);
console.log(result.label, result.confidence); // "A" 0.98

await service.destroy();
```

Browser (live webcam):

```ts
import { SignLangnesiaService } from "sign-langnesia/web";

const service = new SignLangnesiaService();
await service.initialize();

const result = await service.classify(videoElement);
console.log(result.label);
```

The `classify()` function accepts these sources:

- A path or a URL, as a string
- An `ArrayBuffer`
- A canvas

On the web, it also accepts `<video>`, `<img>`, `OffscreenCanvas`, and
`ImageBitmap`.

The SDK prepares each frame before classification. It crops the center square,
sets the size to 300x300 pixels, and applies ImageNet normalization.

## Lifecycle

Follow this sequence: `new`, `await initialize()`, `classify()`,
`await destroy()`. Use one service for each process. Keep the service warm.
Destroy the service at shutdown. If you do not call `initialize()`, the first
`classify()` call does the initialization. An explicit `initialize()` shows
model-load failures at startup.

## Result shape

```ts
type ClassifyResult = {
  label: string; // top-1 letter, "A" to "Z"
  confidence: number; // softmax probability, 0 to 1
  scores: LabelScore[]; // top-k predictions (default 3), in descending order
};
```

## Live demo

```sh
bun install
bun run build
bun run demo
```

Open http://localhost:3456. The demo uses your webcam. All computation occurs
in the browser. The `deploy-pages` workflow publishes the same demo to GitHub
Pages on each push to `main`.

## Model

| File                               | What                                                           |
| :--------------------------------- | :------------------------------------------------------------- |
| `models/efficientnet_bisindo.onnx` | EfficientNet-B3, input `[1,3,300,300]`, output `[1,26]` logits |
| `models/class_to_idx.json`         | Label order (A=0 to Z=25), included as `BISINDO_LABELS`        |

By default, each runtime downloads the model from this repository
(`MODEL_BASE_URL`) at `initialize()`. To prevent the 46 MB download, set a
local path or bytes in `model.classifier`.

## Development

```sh
bun run build       # emit lib/ (js + d.ts)
bun run type-check
bun run lint
bun run fmt
bun test
```

Husky and lint-staged control each commit (oxfmt, oxlint, tsc). Commit
subjects must follow the Conventional Commits format, for example `feat: ...`
or `fix: ...`, with a maximum of 80 characters.
