# Models

| File                        | What                                                           |
| :-------------------------- | :------------------------------------------------------------- |
| `efficientnet_bisindo.onnx` | EfficientNet-B3, input `[1,3,300,300]`, output `[1,26]` logits |
| `class_to_idx.json`         | Label order (A=0 … Z=25)                                       |

## Attribution

The classifier weights come from
[Syizuril/bisindo-sign-language](https://huggingface.co/Syizuril/bisindo-sign-language)
— an EfficientNet-B3 fine-tuned on 9,169 images of the BISINDO (Bahasa Isyarat
Indonesia) A–Z alphabet, 98.8% validation accuracy. The original PyTorch
checkpoint was exported to ONNX (opset 17, fixed 300×300 input, dynamic batch)
with `torch.onnx.export`.
