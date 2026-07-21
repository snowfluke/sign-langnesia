# Models

| File                        | What                                                           |
| :-------------------------- | :------------------------------------------------------------- |
| `efficientnet_bisindo.onnx` | EfficientNet-B3, input `[1,3,300,300]`, output `[1,26]` logits |
| `class_to_idx.json`         | Label order (A=0 to Z=25)                                      |

## Attribution

The classifier weights come from
[Syizuril/bisindo-sign-language](https://huggingface.co/Syizuril/bisindo-sign-language).
The model is an EfficientNet-B3, fine-tuned on 9,169 images of the BISINDO
(Bahasa Isyarat Indonesia) alphabet, A to Z. The reported validation accuracy
is 98.8%. We exported the PyTorch checkpoint to ONNX with `torch.onnx.export`
(opset 17, fixed 300x300 input, dynamic batch).

## Measured accuracy

We tested the ONNX model on 52 images from an independent dataset
([Research-Binus-BISINDO-DATASET](https://github.com/Zappie733/Research-Binus-BISINDO-DATASET)).
The shipped preprocessing (center crop, 300x300, ImageNet normalization) gave
the best result of all tested variants: 42.3% top-1 accuracy. The model
identifies these letters best: M, A, Z, W, G, O, V, L, K.

The 98.8% validation accuracy applies only to the source dataset. The model
does not generalize well to other cameras, backgrounds, and signers. For
webcam use, better results require one of these changes: train again with a
cross-signer split and augmentation, or crop the hand region with a hand
detector before classification.
