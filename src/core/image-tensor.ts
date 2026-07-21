import type { Tensor } from "onnxruntime-common";
import { IMAGENET_MEAN, IMAGENET_STD } from "../constants.js";
import type { OrtNamespace, RawImage } from "./platform.js";

/** RGBA pixels → normalized NCHW float32 tensor (ImageNet mean/std). */
export function imageToTensor(image: RawImage, ort: OrtNamespace): Tensor {
  const { data, width, height } = image;
  const plane = width * height;
  const chw = new Float32Array(3 * plane);
  for (let i = 0; i < plane; i++) {
    const px = i * 4;
    chw[i] = (data[px] / 255 - IMAGENET_MEAN[0]) / IMAGENET_STD[0];
    chw[plane + i] = (data[px + 1] / 255 - IMAGENET_MEAN[1]) / IMAGENET_STD[1];
    chw[2 * plane + i] = (data[px + 2] / 255 - IMAGENET_MEAN[2]) / IMAGENET_STD[2];
  }
  return new ort.Tensor("float32", chw, [1, 3, height, width]);
}
