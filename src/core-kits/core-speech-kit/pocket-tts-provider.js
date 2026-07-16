const clone = (value) => value === undefined ? undefined : structuredClone(value);

export const POCKET_TTS_PROVIDER_ID = "pocket-tts";
export const POCKET_TTS_DEFAULT_BUNDLE_ID = "speech-model:pocket-tts:english-2026-04";
export const POCKET_TTS_DEFAULT_MODEL_REPOSITORY = "KevinAHM/pocket-tts-onnx";
export const POCKET_TTS_DEFAULT_MODEL_REVISION = "main";
export const POCKET_TTS_DEFAULT_LANGUAGE = "english_2026-04";

const DEFAULT_FILES = Object.freeze([
  ["bundle", "bundle.json", "application/json"],
  ["tokenizer", "tokenizer.model", "application/octet-stream"],
  ["bosBeforeVoice", "bos_before_voice.npy", "application/octet-stream"],
  ["voices", "voices.bin", "application/octet-stream"],
  ["mimiEncoder", "mimi_encoder_int8.onnx", "application/onnx"],
  ["textConditioner", "text_conditioner_int8.onnx", "application/onnx"],
  ["flowMain", "flow_lm_main_int8.onnx", "application/onnx"],
  ["flow", "flow_lm_flow_int8.onnx", "application/onnx"],
  ["mimiDecoder", "mimi_decoder_int8.onnx", "application/onnx"]
]);

function requiredText(value, label) {
  const next = String(value ?? "").trim();
  if (!next) throw new TypeError(`${label} requires a non-empty value.`);
  return next;
}

function hfResolveUrl(repository, revision, path) {
  return `https://huggingface.co/${repository}/resolve/${revision}/${path}`;
}

export function createPocketTTSAssetManifest(config = {}) {
  const repository = config.repository ?? POCKET_TTS_DEFAULT_MODEL_REPOSITORY;
  const revision = config.revision ?? POCKET_TTS_DEFAULT_MODEL_REVISION;
  const language = config.language ?? POCKET_TTS_DEFAULT_LANGUAGE;
  const bundleId = config.bundleId ?? `speech-model:pocket-tts:${language.replaceAll("_", "-")}`;
  const basePath = config.basePath ?? `onnx/${language}`;
  const assetProviderId = config.assetProviderId ?? "pocket-tts-http-assets";
  const hashes = config.hashes ?? {};
  const assets = DEFAULT_FILES.map(([role, filename, mediaType]) => {
    const id = `${bundleId}:${role}`;
    const path = `${basePath}/${filename}`;
    return {
      id,
      type: role.includes("flow") || role.includes("mimi") || role === "textConditioner"
        ? "speech-model"
        : "speech-data",
      version: revision,
      providerId: assetProviderId,
      source: {
        kind: "http",
        uri: config.urls?.[role] ?? hfResolveUrl(repository, revision, path),
        repository,
        revision,
        path
      },
      contentHash: hashes[role] ?? `remote:${repository}@${revision}:${path}`,
      cache: { enabled: true, namespace: "speech-models" },
      metadata: { provider: POCKET_TTS_PROVIDER_ID, role, filename, mediaType, language, precision: "int8" }
    };
  });
  return {
    assets,
    bundle: {
      id: bundleId,
      version: revision,
      assets: assets.map((asset) => asset.id),
      dependencies: [],
      contentHash: config.bundleHash ?? `remote:${repository}@${revision}:${basePath}`,
      metadata: {
        provider: POCKET_TTS_PROVIDER_ID,
        repository,
        revision,
        language,
        runtime: "onnx-web",
        precision: "int8",
        externallyHosted: true
      }
    },
    ids: Object.fromEntries([
      ["bundleId", bundleId],
      ...assets.map((asset) => [asset.metadata.role, asset.id])
    ])
  };
}

export function registerPocketTTSAssets(coreAssets, config = {}) {
  if (!coreAssets?.registerAsset || !coreAssets?.registerBundle) {
    throw new TypeError("Core Assets API is required.");
  }
  const manifest = createPocketTTSAssetManifest(config);
  for (const asset of manifest.assets) coreAssets.registerAsset(asset);
  coreAssets.registerBundle(manifest.bundle);
  return clone(manifest);
}

export function createPocketTTSHttpAssetProvider(config = {}) {
  const fetchImpl = config.fetch ?? globalThis.fetch;
  if (typeof fetchImpl !== "function") throw new TypeError("Pocket TTS HTTP assets require fetch().");
  return {
    id: config.id ?? "pocket-tts-http-assets",
    version: config.version ?? "1",
    metadata: { transport: "http", externalModelStorage: true },
    async load(asset, context = {}) {
      const uri = requiredText(asset.source?.uri, `Pocket TTS asset ${asset.id} source URI`);
      const headers = new Headers(config.headers ?? {});
      const token = typeof config.getToken === "function" ? await config.getToken(asset) : config.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      const response = await fetchImpl(uri, { headers, signal: context.signal ?? undefined });
      if (!response.ok) throw new Error(`Pocket TTS asset request failed (${response.status}) for ${asset.id}.`);
      const mediaType = asset.metadata?.mediaType ?? response.headers.get("content-type") ?? "application/octet-stream";
      const value = mediaType.includes("json") ? await response.json() : await response.arrayBuffer();
      return {
        value,
        portable: value,
        metadata: { uri, mediaType, byteLength: value?.byteLength ?? null }
      };
    }
  };
}

export function createPocketTTSProvider(config = {}) {
  const manifest = createPocketTTSAssetManifest(config);
  let runtime = null;
  let initialized = false;
  let activeController = null;

  async function initializeLocal(context) {
    const assets = context.engine?.n?.coreAssets ?? context.engine?.coreAssets;
    if (!assets) throw new Error("Pocket TTS local mode requires Core Assets.");
    registerPocketTTSAssets(assets, config);
    await assets.requestBundle(manifest.ids.bundleId, { priority: config.priority ?? "background" });
    const resolved = Object.fromEntries(
      Object.entries(manifest.ids)
        .filter(([key]) => key !== "bundleId")
        .map(([key, id]) => [key, assets.getValue(id)])
    );
    if (!config.runtimeAdapter?.initialize) {
      throw new Error("Pocket TTS local mode requires runtimeAdapter.initialize().");
    }
    runtime = await config.runtimeAdapter.initialize({ assets: resolved, manifest: clone(manifest), context });
  }

  async function synthesizeRemote(request) {
    const endpoint = requiredText(config.endpoint, "Pocket TTS endpoint");
    activeController = new AbortController();
    const headers = new Headers(config.headers ?? {});
    headers.set("Content-Type", "application/json");
    const token = typeof config.getToken === "function" ? await config.getToken(request) : config.token;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const response = await (config.fetch ?? globalThis.fetch)(endpoint, {
      method: "POST",
      headers,
      signal: activeController.signal,
      body: JSON.stringify({
        model: config.model ?? "pocket-tts",
        input: request.text,
        text: request.text,
        voice: request.voice ?? config.voice ?? "alba",
        response_format: config.responseFormat ?? "wav",
        speed: request.rate ?? 1
      })
    });
    if (!response.ok) throw new Error(`Pocket TTS synthesis failed (${response.status}).`);
    const audio = await response.blob();
    return {
      generatedAssetId: `speech-audio:pocket-tts:${request.id}`,
      audio,
      audioUrl: URL.createObjectURL(audio),
      mediaType: audio.type || "audio/wav",
      provider: POCKET_TTS_PROVIDER_ID
    };
  }

  return {
    id: config.providerId ?? POCKET_TTS_PROVIDER_ID,
    version: config.providerVersion ?? "1",
    metadata: {
      bundleId: manifest.ids.bundleId,
      mode: config.endpoint ? "remote" : "local",
      language: config.language ?? POCKET_TTS_DEFAULT_LANGUAGE,
      repository: config.repository ?? POCKET_TTS_DEFAULT_MODEL_REPOSITORY,
      revision: config.revision ?? POCKET_TTS_DEFAULT_MODEL_REVISION,
      externalModelStorage: true
    },
    async initialize(context) {
      if (initialized) return true;
      if (config.endpoint) {
        if (typeof (config.fetch ?? globalThis.fetch) !== "function") throw new Error("Pocket TTS remote mode requires fetch().");
      } else {
        await initializeLocal(context);
      }
      initialized = true;
      return true;
    },
    async synthesize(request, context) {
      if (!initialized) await this.initialize(context);
      if (config.endpoint) return synthesizeRemote(request);
      if (!runtime?.synthesize) throw new Error("Pocket TTS runtime adapter does not implement synthesize().");
      return runtime.synthesize(request, context);
    },
    cancel(id) {
      activeController?.abort();
      activeController = null;
      runtime?.cancel?.(id);
    },
    reset() {
      activeController?.abort();
      activeController = null;
      runtime?.reset?.();
    },
    dispose() {
      activeController?.abort();
      activeController = null;
      runtime?.dispose?.();
      runtime = null;
      initialized = false;
    }
  };
}

export default createPocketTTSProvider;
