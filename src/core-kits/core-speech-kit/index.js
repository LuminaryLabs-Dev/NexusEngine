import { defineEvent, defineResource } from "../../ecs.js";
import { defineDomainServiceKit } from "../../domain-service-kit.js";

export const CORE_SPEECH_VERSION = "0.1.0";
export const TINY_TTS_DEFAULT_ASSET_ID = "speech-model:tiny-tts-en-v1:model";
export const TINY_TTS_DEFAULT_PHONEMIZER_ID = "speech-model:tiny-tts-en-v1:phonemizer";
export const TINY_TTS_DEFAULT_VOCABULARY_ID = "speech-model:tiny-tts-en-v1:vocabulary";
export const TINY_TTS_DEFAULT_BUNDLE_ID = "speech-model:tiny-tts-en-v1";

const SpeechState = defineResource("core.speech.state");
const SpeechProviderChanged = defineEvent("core.speech.provider-changed");
const SpeechUtteranceChanged = defineEvent("core.speech.utterance-changed");
const SpeechReset = defineEvent("core.speech.reset");

const runtimes = new WeakMap();
const clone = (value) => value === undefined ? undefined : structuredClone(value);

function initialState() {
  return { version: CORE_SPEECH_VERSION, sequence: 0, providers: {}, voices: {}, utterances: {}, lastUtteranceId: null };
}

function normalizeProvider(input) {
  if (!input || typeof input !== "object") throw new TypeError("Speech provider must be an object.");
  if (!input.id) throw new TypeError("Speech provider requires an id.");
  if (typeof input.synthesize !== "function") throw new TypeError("Speech provider requires synthesize(request, context).");
  return input;
}

export function createTinyTTSAssetManifest(config = {}) {
  const prefix = config.id ?? TINY_TTS_DEFAULT_BUNDLE_ID;
  const modelId = config.modelId ?? `${prefix}:model`;
  const phonemizerId = config.phonemizerId ?? `${prefix}:phonemizer`;
  const vocabularyId = config.vocabularyId ?? `${prefix}:vocabulary`;
  const common = { version: config.version ?? "1.0.0", cache: { enabled: true, namespace: "speech-model" }, providerId: config.assetProviderId ?? null };
  return {
    assets: [
      { ...common, id: modelId, type: "speech-model", uri: config.modelUri ?? "/assets/tiny-tts/tinytts.fp16.onnx", contentHash: config.modelHash ?? `unverified:${modelId}`, metadata: { role: "model", mediaType: "application/onnx", runtime: "onnx", precision: "fp16" } },
      { ...common, id: phonemizerId, type: "speech-data", uri: config.phonemizerUri ?? "/assets/tiny-tts/phonemizer.json", contentHash: config.phonemizerHash ?? `unverified:${phonemizerId}`, metadata: { role: "phonemizer", mediaType: "application/json" } },
      { ...common, id: vocabularyId, type: "speech-data", uri: config.vocabularyUri ?? "/assets/tiny-tts/vocabulary.json", contentHash: config.vocabularyHash ?? `unverified:${vocabularyId}`, metadata: { role: "vocabulary", mediaType: "application/json" } }
    ],
    bundle: { id: prefix, version: config.version ?? "1.0.0", assets: [modelId, phonemizerId, vocabularyId], dependencies: [], contentHash: config.bundleHash ?? `unverified:${prefix}`, metadata: { provider: "tiny-tts", language: config.language ?? "en", sampleRate: config.sampleRate ?? 44100, runtime: "onnx", precision: "fp16" } },
    ids: { bundleId: prefix, modelId, phonemizerId, vocabularyId }
  };
}

export function registerTinyTTSAssets(coreAssets, config = {}) {
  if (!coreAssets?.registerAsset || !coreAssets?.registerBundle) throw new TypeError("Core Assets API is required.");
  const manifest = createTinyTTSAssetManifest(config);
  for (const asset of manifest.assets) coreAssets.registerAsset(asset);
  coreAssets.registerBundle(manifest.bundle);
  return clone(manifest);
}

export function createTinyTTSProvider(config = {}) {
  const manifest = createTinyTTSAssetManifest(config);
  let bundleReady = false;
  let session = null;
  let released = false;
  return {
    id: config.providerId ?? "tiny-tts",
    version: config.providerVersion ?? "1",
    metadata: { assetId: manifest.ids.bundleId, executionProvider: config.executionProvider ?? "wasm", modelHash: config.modelHash ?? null, language: config.language ?? "en" },
    async initialize(context) {
      const assets = context.engine?.n?.coreAssets ?? context.engine?.coreAssets;
      if (!assets) throw new Error("TinyTTS requires Core Assets.");
      registerTinyTTSAssets(assets, config);
      await assets.requestBundle(manifest.ids.bundleId, { priority: config.priority ?? "normal" });
      bundleReady = true;
      const model = assets.getValue(manifest.ids.modelId);
      const phonemizer = assets.getValue(manifest.ids.phonemizerId);
      const vocabulary = assets.getValue(manifest.ids.vocabularyId);
      if (typeof config.createSession === "function") session = await config.createSession({ model, phonemizer, vocabulary, executionProvider: config.executionProvider ?? "wasm", context });
      else if (context.engine?.n?.coreCompute?.createInferenceSession) session = await context.engine.n.coreCompute.createInferenceSession({ format: "onnx", model, executionProvider: config.executionProvider ?? "wasm" });
      return true;
    },
    async synthesize(request, context) {
      if (!bundleReady) await this.initialize(context);
      if (typeof config.synthesize === "function") return config.synthesize({ request, session, context, manifest });
      if (session?.synthesize) return session.synthesize(request);
      throw new Error("TinyTTS provider has no inference implementation. Supply createSession or synthesize.");
    },
    reset() {},
    dispose() { if (!released) session?.dispose?.(); released = true; session = null; bundleReady = false; }
  };
}

export function createCoreSpeechKit(config = {}) {
  return defineDomainServiceKit({
    id: config.id ?? "core-speech-domain",
    domain: "speech",
    domainPath: config.domainPath ?? "n:speech",
    apiName: config.apiName ?? "coreSpeech",
    version: CORE_SPEECH_VERSION,
    stability: config.stability ?? "stable-candidate",
    services: ["providers", "voices", "synthesis", "queue", "cancellation", "snapshot", "reset"],
    resources: { SpeechState },
    events: { SpeechProviderChanged, SpeechUtteranceChanged, SpeechReset },
    metadata: { purpose: "Provider-neutral speech synthesis with asset-backed model loading, serializable lifecycle state, and host-neutral audio results.", owns: ["speech requests", "provider selection", "voice descriptors", "utterance lifecycle", "synthesis results and cache identities"], doesNotOwn: ["network fetching", "asset persistence", "ONNX runtime implementation", "audio playback", "subtitle UI"], assetBacked: true, providerNeutral: true, snapshot: true, reset: true, ...(config.metadata ?? {}) },
    initWorld({ world }) { runtimes.set(world, { providers: new Map(), engine: null }); world.setResource(SpeechState, initialState()); },
    createApi({ engine, world }) {
      const runtime = runtimes.get(world);
      runtime.engine = engine;
      const state = () => world.getResource(SpeechState);
      const publish = (next, event, payload = {}) => { world.setResource(SpeechState, next); world.emit(event, { state: clone(next), ...clone(payload) }); return clone(next); };
      const patch = (changes, event, payload = {}) => { const current = state(); return publish({ ...current, ...clone(changes), sequence: current.sequence + 1 }, event, payload); };
      const api = {
        registerProvider(input) { const provider = normalizeProvider(input); runtime.providers.set(provider.id, provider); patch({ providers: { ...state().providers, [provider.id]: { id: provider.id, version: provider.version ?? "1", status: "unavailable", metadata: clone(provider.metadata ?? {}) } } }, SpeechProviderChanged, { providerId: provider.id }); return provider.id; },
        async prepareProvider(id) { const provider = runtime.providers.get(String(id)); if (!provider) throw new RangeError(`Unknown speech provider: ${id}.`); const current = state(); patch({ providers: { ...current.providers, [provider.id]: { ...current.providers[provider.id], status: "initializing" } } }, SpeechProviderChanged, { providerId: provider.id }); try { await provider.initialize?.({ engine, world }); const now = state(); patch({ providers: { ...now.providers, [provider.id]: { ...now.providers[provider.id], status: "ready" } } }, SpeechProviderChanged, { providerId: provider.id }); return true; } catch (error) { const now = state(); patch({ providers: { ...now.providers, [provider.id]: { ...now.providers[provider.id], status: "failed", error: { name: error.name, message: error.message } } } }, SpeechProviderChanged, { providerId: provider.id }); throw error; } },
        registerVoice(input) { const voice = { id: String(input.id), provider: input.provider ?? null, language: input.language ?? "en", metadata: clone(input.metadata ?? {}) }; patch({ voices: { ...state().voices, [voice.id]: voice } }, SpeechProviderChanged, { voiceId: voice.id }); return clone(voice); },
        async speak(input = {}) { const text = String(input.text ?? "").trim(); if (!text) throw new TypeError("Speech text is required."); const providerId = String(input.provider ?? state().voices[input.voice]?.provider ?? config.defaultProvider ?? runtime.providers.keys().next().value ?? ""); const provider = runtime.providers.get(providerId); if (!provider) throw new Error("No speech provider is available."); const id = String(input.id ?? `utterance:${state().sequence + 1}`); const base = { id, text, voice: input.voice ?? null, provider: providerId, status: "waiting-for-provider", priority: input.priority ?? 0, source: clone(input.source ?? null), generatedAssetId: null, error: null };
          patch({ utterances: { ...state().utterances, [id]: base }, lastUtteranceId: id }, SpeechUtteranceChanged, { utteranceId: id });
          if (state().providers[providerId]?.status !== "ready") await api.prepareProvider(providerId);
          patch({ utterances: { ...state().utterances, [id]: { ...state().utterances[id], status: "synthesizing" } } }, SpeechUtteranceChanged, { utteranceId: id });
          try { const result = await provider.synthesize({ id, text, voice: input.voice ?? null, rate: input.rate ?? 1, pitch: input.pitch ?? 1, metadata: clone(input.metadata ?? {}) }, { engine, world }); const generatedAssetId = result?.generatedAssetId ?? `speech-audio:${id}`; const utterance = { ...state().utterances[id], status: "ready", generatedAssetId, result: clone(result ?? null) }; patch({ utterances: { ...state().utterances, [id]: utterance } }, SpeechUtteranceChanged, { utteranceId: id }); return clone(utterance); } catch (error) { const utterance = { ...state().utterances[id], status: "failed", error: { name: error.name, message: error.message } }; patch({ utterances: { ...state().utterances, [id]: utterance } }, SpeechUtteranceChanged, { utteranceId: id }); throw error; }
        },
        cancel(id) { const current = state().utterances[String(id)]; if (!current || ["ready", "failed", "cancelled"].includes(current.status)) return false; runtime.providers.get(current.provider)?.cancel?.(current.id); patch({ utterances: { ...state().utterances, [current.id]: { ...current, status: "cancelled" } } }, SpeechUtteranceChanged, { utteranceId: current.id }); return true; },
        getProvider(id) { return clone(state().providers[String(id)] ?? null); },
        getUtterance(id) { return clone(state().utterances[String(id)] ?? null); },
        getSnapshot: () => clone(state()),
        reset() { for (const provider of runtime.providers.values()) provider.reset?.(); const next = initialState(); next.providers = Object.fromEntries(Array.from(runtime.providers.values()).map((provider) => [provider.id, { id: provider.id, version: provider.version ?? "1", status: "unavailable", metadata: clone(provider.metadata ?? {}) }])); return publish(next, SpeechReset); }
      };
      engine.coreSpeech = api;
      return api;
    }
  });
}

export default createCoreSpeechKit;
