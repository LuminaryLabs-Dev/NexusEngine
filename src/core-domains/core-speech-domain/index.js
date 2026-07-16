import { createCoreSpeechKit } from "../../core-kits/core-speech-kit/index.js";

export * from "../../core-kits/core-speech-kit/index.js";

export function createCoreSpeechDomain(config = {}) {
  return [createCoreSpeechKit(config.root ?? config)];
}

export default createCoreSpeechDomain;
