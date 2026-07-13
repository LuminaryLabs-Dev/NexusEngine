const clone = (value) => value === undefined ? undefined : structuredClone(value);

function resolveElement(value, root = globalThis.document) {
  if (!value) return null;
  if (typeof value === "string") return root?.querySelector?.(value) ?? null;
  return value;
}

function defaultView(descriptor) {
  const active = descriptor.activePreparation;
  const failure = descriptor.failure;
  return {
    progress: descriptor.progress,
    label: failure?.message
      ?? active?.detail
      ?? active?.label
      ?? (descriptor.playable ? "Ready" : "Starting"),
    error: failure?.message ?? null,
    complete: descriptor.playable,
    status: descriptor.status
  };
}

export function createBrowserStartupPresentationAdapter(options = {}) {
  const startup = options.startup;
  if (!startup || typeof startup.getDescriptor !== "function") {
    throw new TypeError("createBrowserStartupPresentationAdapter requires a Core Startup API.");
  }

  const documentRoot = options.document ?? globalThis.document;
  const loader = resolveElement(options.loader, documentRoot);
  const fill = resolveElement(options.fill, documentRoot);
  const label = resolveElement(options.label, documentRoot);
  const error = resolveElement(options.error, documentRoot);
  const format = typeof options.format === "function" ? options.format : defaultView;
  const completeClass = String(options.completeClass ?? "is-complete");
  const hideOnComplete = options.hideOnComplete === true;

  function render(descriptor = startup.getDescriptor()) {
    const view = { ...defaultView(descriptor), ...clone(format(clone(descriptor)) ?? {}) };
    const progress = Math.max(0, Math.min(1, Number(view.progress) || 0));

    if (fill?.style) fill.style.width = `${Math.round(progress * 10000) / 100}%`;
    if (label && view.label != null) label.textContent = String(view.label);
    if (loader?.dataset) loader.dataset.startupStatus = String(view.status ?? descriptor.status);
    if (loader?.classList) loader.classList.toggle(completeClass, Boolean(view.complete));
    if (loader && hideOnComplete && view.complete) loader.hidden = true;

    if (error) {
      const text = view.error == null ? "" : String(view.error);
      error.textContent = text;
      error.hidden = text.length === 0;
    }

    return Object.freeze({ descriptor: clone(descriptor), view: Object.freeze(clone(view)) });
  }

  function reportFailure(cause, details = {}) {
    const failure = startup.fail({
      code: details.code ?? "startup.host.failed",
      message: details.message ?? String(cause?.message ?? cause ?? "Application startup failed."),
      source: details.source ?? "browser-host",
      retryable: details.retryable !== false,
      fallback: details.fallback ?? null,
      metadata: details.metadata ?? {}
    });
    render();
    return failure;
  }

  function withTimeout(promise, optionsOrMs = {}) {
    const settings = typeof optionsOrMs === "number" ? { milliseconds: optionsOrMs } : optionsOrMs;
    const milliseconds = Math.max(1, Number(settings.milliseconds ?? settings.timeoutMs) || 15000);
    const labelText = settings.label ?? "Startup operation";
    let timer = null;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => {
        const timeoutError = new Error(`${labelText} timed out after ${milliseconds}ms.`);
        timeoutError.code = settings.code ?? "startup.host.timeout";
        reject(timeoutError);
      }, milliseconds);
    });
    return Promise.race([Promise.resolve(promise), timeout]).finally(() => clearTimeout(timer));
  }

  return Object.freeze({
    render,
    reportFailure,
    withTimeout,
    getDescriptor: () => startup.getDescriptor()
  });
}

export default createBrowserStartupPresentationAdapter;
