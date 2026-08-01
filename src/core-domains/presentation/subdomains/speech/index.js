import { createSpeechKit } from "./kits/speech-kit/index.js";

export * from "./kits/speech-kit/index.js";

export function createSpeechDomain(config = {}) {
  return [createSpeechKit(config.root ?? config)];
}

export default createSpeechDomain;
