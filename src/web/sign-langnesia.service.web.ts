import { DEFAULT_MODEL_URL } from "../constants.js";
import { BaseSignLangnesiaService } from "../core/base-sign-langnesia.service.js";
import type { SignLangnesiaOptions } from "../interface.js";
import type { WebClassifySource } from "./platform.web.js";
import { WebPlatformProvider } from "./platform.web.js";

/** BISINDO alphabet classifier for browsers (WebGPU with WASM fallback). */
export class SignLangnesiaService extends BaseSignLangnesiaService<WebClassifySource> {
  constructor(options: SignLangnesiaOptions = {}) {
    super(new WebPlatformProvider(), DEFAULT_MODEL_URL, options);
  }
}
