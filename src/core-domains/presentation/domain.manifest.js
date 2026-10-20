import { defineCoreDomainManifest } from "../domain-manifest.js";
import { atomicKit, domainNode, manifestShell } from "../manifest-input.js";

const presentationProof = ["tests/core-kits/core-presentation-domain-smoke.mjs"];
const graphicsProof = ["tests/core-domains/core-graphics-domain-smoke.mjs", "tests/core-kits/core-graphics-kit-smoke.mjs"];
const graphProof = ["tests/core-kits/core-graphics-render-layer-graph-contract.mjs", "tests/core-kits/core-graphics-render-layer-graph-smoke.mjs"];
const utilityProof = ["tests/core-kits/core-utility-articulation-smoke.mjs"];
const speechProof = ["tests/core-domains/core-speech-domain-smoke.mjs"];
const captureProof = ["tests/core-domains/core-capture-domain-smoke.mjs", "tests/core-domains/core-capture-shape-visual-smoke.mjs"];
const skyProof = ["tests/core-kits/core-skybox-kit-smoke.mjs"];
const generalProof = ["tests/core-domain-kits-smoke.mjs"];

const sub = (id, segment, label, responsibility, owns, forbiddenResponsibilities, provides, proofReferences, requires = ["n:presentation"]) => domainNode({
  id,
  domainPath: `n:presentation:${segment}`,
  parentDomainPath: "n:presentation",
  label,
  responsibility,
  owns,
  forbiddenResponsibilities,
  requires,
  provides,
  proofReferences
});

export const presentationDomainManifest = defineCoreDomainManifest(manifestShell({
  root: domainNode({ id: "presentation-domain", domainPath: "n:presentation", label: "Presentation", responsibility: "Own renderer-neutral presentation descriptors and output policy contracts.", owns: ["presentation descriptors", "presentation capability registry", "output policy contracts"], forbiddenResponsibilities: ["renderer implementation", "DOM implementation", "audio playback", "authored visual presets"], provides: ["n:presentation", "presentation:descriptor", "presentation:capability"], proofReferences: presentationProof }),
  subdomains: [
    sub("presentation-output-domain", "output", "Presentation Output", "Own surface, safe-area, viewport, aspect, bar, and render-resolution policy.", ["surface descriptors", "safe areas", "viewport policy", "render resolution policy"], ["window implementation", "renderer allocation", "DOM layout"], ["n:presentation:output", "presentation:surface", "presentation:viewport"], presentationProof),
    sub("presentation-animation-domain", "animation", "Presentation Animation", "Own animation, pose, blend, rig, and timeline descriptors.", ["animation descriptors", "pose descriptors", "rig transforms", "timeline descriptors"], ["animation playback implementation", "asset loading", "physical movement", "pose solving"], ["n:presentation:animation", "animation:descriptor", "animation:rig"], utilityProof),
    sub("presentation-audio-domain", "audio", "Presentation Audio", "Own audio cue, music, ambience, mix, volume, and spatial audio descriptors.", ["audio descriptors", "mix groups", "volume policy", "spatial audio descriptors"], ["audio playback", "audio device access", "authored music"], ["n:presentation:audio", "audio:descriptor", "audio:mix"], generalProof),
    sub("presentation-ui-domain", "ui", "Presentation UI", "Own renderer-neutral HUD, menu, prompt, notification, focus, selection, accessibility, and scale descriptors.", ["UI descriptors", "focus state", "selection state", "accessibility descriptors", "UI scale policy"], ["DOM implementation", "native widget implementation", "authored layouts"], ["n:presentation:ui", "ui:descriptor", "ui:scale"], generalProof),
    sub("presentation-speech-domain", "speech", "Presentation Speech", "Own provider-neutral speech requests, voices, utterance lifecycle, and synthesis result contracts.", ["speech requests", "voice descriptors", "utterance lifecycle", "synthesis results"], ["model runtime", "network fetch", "audio playback", "subtitle UI"], ["n:presentation:speech", "speech:request", "speech:result", "speech:provider-contract"], speechProof),
    sub("presentation-capture-domain", "capture", "Presentation Capture", "Own observation requests, view sets, framing, capture jobs, progress, and result contracts.", ["capture requests", "view sets", "capture jobs", "capture results"], ["renderer capture implementation", "filesystem output", "authored shot lists"], ["n:presentation:capture", "capture:request", "capture:result", "capture:provider-contract"], captureProof),
    sub("presentation-sky-domain", "sky", "Presentation Sky", "Own generic sky, atmosphere, cloud, horizon, and celestial descriptors.", ["sky descriptors", "atmosphere descriptors", "cloud descriptors", "celestial descriptors"], ["authored sky presets", "shader implementation", "weather simulation"], ["n:presentation:sky", "sky:descriptor", "sky:atmosphere"], skyProof),
  ],
  publicEntry: { subpath: "./domains/presentation", module: "./src/core-domains/presentation/index.js" },
  publicEntries: [{"domainPath": "n:presentation", "subpath": "./domains/presentation/requests", "module": "./src/core-domains/presentation/requests/vfx-descriptors.js"}],
  publicKits: [
    atomicKit({ id: "presentation-registry-kit", responsibility: "Register renderer-neutral presentation capabilities and descriptors.", domainPath: "n:presentation", apiName: "presentation", provides: ["n:presentation", "presentation:descriptor", "presentation:capability"], module: "./src/core-domains/presentation/kits/presentation-kit/index.js", exportName: "createPresentationKit", publicSubpath: "./domains/presentation/registry", proofReferences: presentationProof }),
    atomicKit({ id: "presentation-output-kit", responsibility: "Calculate renderer-neutral surfaces, safe areas, viewports, aspect policy, and render resolution.", domainPath: "n:presentation:output", apiName: "presentationOutput", requires: ["n:presentation"], provides: ["n:presentation:output", "presentation:surface", "presentation:viewport"], module: "./src/core-domains/presentation/output/kits/output-kit/index.js", exportName: "createPresentationOutputKit", publicSubpath: "./domains/presentation/output", proofReferences: presentationProof }),
    atomicKit({ id: "animation-descriptor-kit", responsibility: "Manage animation clips, poses, blends, transitions, and timeline descriptors.", domainPath: "n:presentation:animation", apiName: "animation", requires: ["n:presentation"], provides: ["n:presentation:animation", "animation:descriptor"], module: "./src/core-domains/presentation/animation/kits/animation-kit/index.js", exportName: "createAnimationKit", publicSubpath: "./domains/presentation/animation", proofReferences: generalProof }),
    atomicKit({ id: "rig-transform-kit", responsibility: "Create neutral joint, limb, and rig transform descriptors.", domainPath: "n:presentation:animation", apiName: "rigTransform", provides: ["animation:rig"], module: "./src/core-domains/presentation/animation/kits/rig-transform-kit.js", exportName: "createRigTransformKit", publicSubpath: "./domains/presentation/animation/rig", proofReferences: utilityProof }),
    atomicKit({ id: "audio-descriptor-kit", responsibility: "Manage renderer-neutral audio cues, mix groups, volume policy, and spatial audio descriptors.", domainPath: "n:presentation:audio", apiName: "audio", requires: ["n:presentation"], provides: ["n:presentation:audio", "audio:descriptor", "audio:mix"], module: "./src/core-domains/presentation/audio/kits/audio-kit/index.js", exportName: "createAudioKit", publicSubpath: "./domains/presentation/audio", proofReferences: generalProof }),
    atomicKit({ id: "ui-descriptor-kit", responsibility: "Manage renderer-neutral UI, focus, selection, prompt, notification, and accessibility descriptors.", domainPath: "n:presentation:ui", apiName: "ui", requires: ["n:presentation"], provides: ["n:presentation:ui", "ui:descriptor"], module: "./src/core-domains/presentation/ui/kits/ui-kit/index.js", exportName: "createUIKit", publicSubpath: "./domains/presentation/ui", proofReferences: generalProof }),
    atomicKit({ id: "ui-scale-kit", responsibility: "Calculate deterministic reference-resolution and UI scale policy.", domainPath: "n:presentation:ui", apiName: "uiScale", requires: ["n:presentation:output"], provides: ["ui:scale"], module: "./src/core-domains/presentation/ui/kits/ui-scale-kit/index.js", exportName: "createUIScaleKit", publicSubpath: "./domains/presentation/ui/scale", proofReferences: presentationProof }),
    atomicKit({ id: "speech-contract-kit", responsibility: "Manage provider-neutral speech requests, voices, utterance lifecycle, and synthesis results.", domainPath: "n:presentation:speech", apiName: "speech", requires: ["n:presentation"], provides: ["n:presentation:speech", "speech:request", "speech:result", "speech:provider-contract"], module: "./src/core-domains/presentation/speech/kits/speech-kit/index.js", exportName: "createSpeechKit", publicSubpath: "./domains/presentation/speech", proofReferences: speechProof }),
    atomicKit({ id: "capture-contract-kit", responsibility: "Manage observation requests, view sets, framing, capture jobs, progress, and result contracts.", domainPath: "n:presentation:capture", apiName: "capture", requires: ["n:presentation"], provides: ["n:presentation:capture", "capture:request", "capture:result", "capture:provider-contract"], module: "./src/core-domains/presentation/capture/kits/capture-kit/index.js", exportName: "createCaptureKit", publicSubpath: "./domains/presentation/capture", proofReferences: captureProof }),
    atomicKit({ id: "sky-descriptor-kit", responsibility: "Create generic sky, horizon, atmosphere, cloud, and celestial descriptors.", domainPath: "n:presentation:sky", apiName: "sky", requires: ["n:presentation"], provides: ["n:presentation:sky", "sky:descriptor", "sky:atmosphere"], module: "./src/core-domains/presentation/sky/kits/sky-kit/index.js", exportName: "createSkyDescriptorKit", publicSubpath: "./domains/presentation/sky", proofReferences: skyProof }),
  ],
}));

export default presentationDomainManifest;
