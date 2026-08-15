import { defineEvent, defineResource } from "../../../../../ecs.js";
import { defineDomainServiceKit } from "../../../../manifest-domain-service-kit.js";

export const CORE_SPEECH_VERSION = "0.0.4";

const SpeechState = defineResource("speech.state");
const SpeechProviderChanged = defineEvent("speech.provider-changed");
const SpeechUtteranceChanged = defineEvent("speech.utterance-changed");
const SpeechReset = defineEvent("speech.reset");
const runtimes = new WeakMap();

const clone = (value) => value === undefined ? undefined : structuredClone(value);
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);

function initialState() {
  return {
    version: CORE_SPEECH_VERSION,
    sequence: 0,
    providers: {},
    voices: {},
    utterances: {},
    lastUtteranceId: null
  };
}

function normalizeProvider(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("Speech provider must be an object.");
  }
  if (typeof input.id !== "string" || !input.id.trim()) {
    throw new TypeError("Speech provider requires an id.");
  }
  if (typeof input.synthesize !== "function") {
    throw new TypeError("Speech provider requires synthesize(request, context).");
  }
  return input;
}

function providerDescriptor(provider, status = "unavailable") {
  return {
    id: provider.id,
    version: provider.version ?? "1",
    status,
    metadata: clone(provider.metadata ?? {})
  };
}

export function createSpeechKit(config = {}) {
  return defineDomainServiceKit({
    manifestId: "speech-contract-kit",
    id: config.id ?? "speech-contract-kit",
    domain: "speech",
    domainPath: config.domainPath ?? "n:presentation:speech",
    parentDomainPath: config.parentDomainPath ?? "n:presentation",
    apiName: config.apiName ?? "speech",
    version: CORE_SPEECH_VERSION,
    stability: config.stability ?? "stable-candidate",
    services: ["providers", "voices", "synthesis", "queue", "cancellation", "snapshot", "reset"],
    resources: { SpeechState },
    events: { SpeechProviderChanged, SpeechUtteranceChanged, SpeechReset },
    metadata: {
      purpose: "Provider-neutral speech requests, voices, synthesis lifecycle, and result contracts.",
      owns: ["speech requests", "provider selection", "voice descriptors", "utterance lifecycle", "synthesis result descriptors"],
      doesNotOwn: ["network fetching", "model loading", "asset persistence", "inference runtime implementation", "audio playback", "subtitle UI"],
      providerNeutral: true,
      snapshot: true,
      reset: true,
      ...(config.metadata ?? {})
    },
    initWorld({ world }) {
      runtimes.set(world, { providers: new Map() });
      world.setResource(SpeechState, initialState());
    },
    createApi({ engine, world }) {
      const runtime = runtimes.get(world);
      const state = () => world.getResource(SpeechState);
      const publish = (next, event, payload = {}) => {
        world.setResource(SpeechState, next);
        world.emit(event, { state: clone(next), ...clone(payload) });
        return clone(next);
      };
      const patch = (changes, event, payload = {}) => {
        const current = state();
        return publish({ ...current, ...clone(changes), sequence: current.sequence + 1 }, event, payload);
      };

      const api = {
        registerProvider(input) {
          const provider = normalizeProvider(input);
          const existing = runtime.providers.get(provider.id);
          if (existing) {
            if (existing !== provider) throw new Error(`Speech provider ${provider.id} already exists with different content.`);
            return provider.id;
          }
          runtime.providers.set(provider.id, provider);
          patch({
            providers: { ...state().providers, [provider.id]: providerDescriptor(provider) }
          }, SpeechProviderChanged, { providerId: provider.id });
          return provider.id;
        },

        async prepareProvider(id) {
          const provider = runtime.providers.get(String(id));
          if (!provider) throw new RangeError(`Unknown speech provider: ${id}.`);
          if (state().providers[provider.id]?.status === "ready") return true;
          const current = state();
          patch({
            providers: {
              ...current.providers,
              [provider.id]: { ...current.providers[provider.id], status: "initializing", error: null }
            }
          }, SpeechProviderChanged, { providerId: provider.id });
          try {
            await provider.initialize?.({ engine, world });
            const readyState = state();
            patch({
              providers: {
                ...readyState.providers,
                [provider.id]: { ...readyState.providers[provider.id], status: "ready" }
              }
            }, SpeechProviderChanged, { providerId: provider.id });
            return true;
          } catch (error) {
            const failedState = state();
            patch({
              providers: {
                ...failedState.providers,
                [provider.id]: {
                  ...failedState.providers[provider.id],
                  status: "failed",
                  error: { name: error.name, message: error.message }
                }
              }
            }, SpeechProviderChanged, { providerId: provider.id });
            throw error;
          }
        },

        registerVoice(input = {}) {
          const voice = {
            id: String(input.id ?? "").trim(),
            provider: input.provider ?? null,
            language: input.language ?? "en",
            metadata: clone(input.metadata ?? {})
          };
          if (!voice.id) throw new TypeError("Speech voice requires an id.");
          const existing = state().voices[voice.id];
          if (existing) {
            if (!same(existing, voice)) throw new Error(`Speech voice ${voice.id} already exists with different content.`);
            return clone(existing);
          }
          patch({ voices: { ...state().voices, [voice.id]: voice } }, SpeechProviderChanged, { voiceId: voice.id });
          return clone(voice);
        },

        async speak(input = {}) {
          const text = String(input.text ?? "").trim();
          if (!text) throw new TypeError("Speech text is required.");
          const providerId = String(
            input.provider
            ?? state().voices[input.voice]?.provider
            ?? config.defaultProvider
            ?? runtime.providers.keys().next().value
            ?? ""
          );
          const provider = runtime.providers.get(providerId);
          if (!provider) throw new Error("No speech provider is available.");
          const id = String(input.id ?? `utterance:${state().sequence + 1}`);
          const request = {
            id,
            text,
            voice: input.voice ?? null,
            provider: providerId,
            rate: input.rate ?? 1,
            pitch: input.pitch ?? 1,
            metadata: clone(input.metadata ?? {})
          };
          const existing = state().utterances[id];
          if (existing) {
            if (!same(existing.request, request)) throw new Error(`Speech utterance ${id} already exists with different content.`);
            return clone(existing);
          }

          const base = {
            id,
            text,
            voice: request.voice,
            provider: providerId,
            request,
            status: "waiting-for-provider",
            priority: input.priority ?? 0,
            source: clone(input.source ?? null),
            generatedAssetId: null,
            result: null,
            error: null
          };
          patch({ utterances: { ...state().utterances, [id]: base }, lastUtteranceId: id }, SpeechUtteranceChanged, { utteranceId: id });
          if (state().providers[providerId]?.status !== "ready") await api.prepareProvider(providerId);
          patch({
            utterances: { ...state().utterances, [id]: { ...state().utterances[id], status: "synthesizing" } }
          }, SpeechUtteranceChanged, { utteranceId: id });
          try {
            const result = await provider.synthesize(request, { engine, world });
            const utterance = {
              ...state().utterances[id],
              status: "ready",
              generatedAssetId: result?.generatedAssetId ?? `speech-audio:${id}`,
              result: clone(result ?? null)
            };
            patch({ utterances: { ...state().utterances, [id]: utterance } }, SpeechUtteranceChanged, { utteranceId: id });
            return clone(utterance);
          } catch (error) {
            const utterance = {
              ...state().utterances[id],
              status: "failed",
              error: { name: error.name, message: error.message }
            };
            patch({ utterances: { ...state().utterances, [id]: utterance } }, SpeechUtteranceChanged, { utteranceId: id });
            throw error;
          }
        },

        cancel(id) {
          const current = state().utterances[String(id)];
          if (!current || ["ready", "failed", "cancelled"].includes(current.status)) return false;
          runtime.providers.get(current.provider)?.cancel?.(current.id);
          patch({
            utterances: { ...state().utterances, [current.id]: { ...current, status: "cancelled" } }
          }, SpeechUtteranceChanged, { utteranceId: current.id });
          return true;
        },

        getProvider(id) {
          return clone(state().providers[String(id)] ?? null);
        },
        getUtterance(id) {
          return clone(state().utterances[String(id)] ?? null);
        },
        getSnapshot() {
          return clone(state());
        },
        loadSnapshot(snapshot = {}) {
          if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
            throw new TypeError("Speech snapshot must be an object.");
          }
          return publish({ ...initialState(), ...clone(snapshot), version: CORE_SPEECH_VERSION }, SpeechReset, { loaded: true });
        },
        reset() {
          for (const provider of runtime.providers.values()) provider.reset?.();
          const next = initialState();
          next.providers = Object.fromEntries(
            [...runtime.providers.values()].map((provider) => [provider.id, providerDescriptor(provider)])
          );
          return publish(next, SpeechReset);
        }
      };
      return api;
    }
  });
}

export default createSpeechKit;
