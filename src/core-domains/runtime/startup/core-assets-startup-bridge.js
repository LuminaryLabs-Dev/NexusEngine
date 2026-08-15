const clone = (value) => value === undefined ? undefined : structuredClone(value);

function failureFrom(error, source, fallback = null) {
  return {
    code: String(error?.code ?? "core.assets.startup.failed"),
    message: String(error?.message ?? error ?? "Required asset preparation failed."),
    source,
    retryable: error?.retryable !== false,
    fallback: clone(error?.fallback ?? fallback),
    metadata: clone(error?.metadata ?? {})
  };
}

export async function trackAssetPreparation(options = {}) {
  const { startup, assets } = options;
  if (!startup || typeof startup.addPreparation !== "function") {
    throw new TypeError("trackAssetPreparation requires a Core Startup API.");
  }
  if (!assets || typeof assets.requestBundle !== "function") {
    throw new TypeError("trackAssetPreparation requires a Core Assets API.");
  }

  const preparationId = String(options.preparationId ?? options.bundleId ?? "asset-preparation");
  const bundleId = String(options.bundleId ?? "");
  if (!bundleId) throw new TypeError("trackAssetPreparation requires bundleId.");
  const required = options.required !== false;
  startup.addPreparation({
    id: preparationId,
    label: options.label ?? bundleId,
    required,
    weight: options.weight ?? 1,
    metadata: { bundleId, ...(clone(options.metadata ?? {})) }
  });
  startup.working(preparationId, 0, options.detail ?? `Preparing ${bundleId}`);

  try {
    const receipt = await assets.requestBundle(bundleId, {
      ...(options.requestOptions ?? {}),
      onProgress(progress, detail, job) {
        startup.working(preparationId, progress, detail ?? `Preparing ${bundleId}`);
        options.requestOptions?.onProgress?.(progress, detail, job);
        options.onProgress?.(progress, detail, job);
      }
    });
    startup.ready(preparationId, receipt, options.readyDetail ?? `${bundleId} ready`);
    return receipt;
  } catch (error) {
    const failure = failureFrom(error, preparationId, options.fallback ?? null);
    if (required) {
      startup.reportPreparation(preparationId, { status: "failed", failure, detail: failure.message });
      throw error;
    }
    startup.skip(preparationId, failure.message);
    return { skipped: true, failure };
  }
}

export default trackAssetPreparation;
