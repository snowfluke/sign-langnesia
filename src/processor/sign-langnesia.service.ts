import { DEFAULT_MODEL_URL } from "../constants.js";
import { BaseSignLangnesiaService } from "../core/base-sign-langnesia.service.js";
import type { SignLangnesiaOptions } from "../interface.js";
import type { NodeClassifySource } from "./platform.node.js";
import { NodePlatformProvider } from "./platform.node.js";

/** BISINDO alphabet classifier for Node.js, Bun, and Deno. */
export class SignLangnesiaService extends BaseSignLangnesiaService<NodeClassifySource> {
  constructor(options: SignLangnesiaOptions = {}) {
    super(new NodePlatformProvider(), DEFAULT_MODEL_URL, options);
  }
}
