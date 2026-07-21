import { DEFAULT_MODEL_URL } from "../constants.js";
import { BaseSignLangnesiaService } from "../core/base-sign-langnesia.service.js";
import type { SignLangnesiaOptions } from "../interface.js";
import type { MobileClassifySource } from "./platform.mobile.js";
import { MobilePlatformProvider } from "./platform.mobile.js";

/**
 * BISINDO alphabet classifier for React Native
 * (`onnxruntime-react-native` + Skia-backed canvas via ppu-ocv).
 *
 * The default model is fetched from the GitHub repo (`MODEL_BASE_URL`);
 * pass bytes via `model.classifier` for offline use.
 */
export class SignLangnesiaService extends BaseSignLangnesiaService<MobileClassifySource> {
  constructor(options: SignLangnesiaOptions = {}) {
    super(new MobilePlatformProvider(), DEFAULT_MODEL_URL, options);
  }
}
