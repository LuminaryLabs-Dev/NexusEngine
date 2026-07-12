const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

export function createBrowserPresentationSurfaceAdapter(options = {}) {
  const element = options.element;
  if (!element) throw new TypeError("Browser presentation surface adapter requires an element.");
  const windowRef = options.window ?? globalThis.window ?? null;
  const documentRef = options.document ?? globalThis.document ?? null;
  const ResizeObserverRef = options.ResizeObserver ?? globalThis.ResizeObserver;
  const onChange = typeof options.onChange === "function" ? options.onChange : () => {};
  const surfaceId = String(options.surfaceId ?? "main");
  let observer = null;
  let started = false;
  let lastSurface = null;
  let signature = "";

  const measure = () => {
    const rect = element.getBoundingClientRect?.() ?? {};
    const cssWidth = Math.max(0, finite(rect.width, finite(element.clientWidth, windowRef?.innerWidth ?? 0)));
    const cssHeight = Math.max(0, finite(rect.height, finite(element.clientHeight, windowRef?.innerHeight ?? 0)));
    const safeInsets = typeof options.getSafeInsets === "function"
      ? options.getSafeInsets()
      : { top: 0, right: 0, bottom: 0, left: 0 };
    return {
      surfaceId,
      cssWidth,
      cssHeight,
      pixelRatio: Math.max(0.1, finite(windowRef?.devicePixelRatio, 1)),
      safeInsets,
      orientation: cssWidth >= cssHeight ? "landscape" : "portrait",
      fullscreen: Boolean(documentRef?.fullscreenElement),
      visible: documentRef?.visibilityState !== "hidden"
    };
  };

  const emit = () => {
    const surface = measure();
    const next = JSON.stringify(surface);
    lastSurface = surface;
    if (next !== signature) {
      signature = next;
      onChange(structuredClone(surface));
    }
    return structuredClone(surface);
  };

  const start = () => {
    if (started) return lastSurface ?? emit();
    started = true;
    if (typeof ResizeObserverRef === "function") {
      observer = new ResizeObserverRef(emit);
      observer.observe(element);
    }
    windowRef?.addEventListener?.("resize", emit);
    windowRef?.visualViewport?.addEventListener?.("resize", emit);
    documentRef?.addEventListener?.("fullscreenchange", emit);
    documentRef?.addEventListener?.("visibilitychange", emit);
    return emit();
  };

  const stop = () => {
    observer?.disconnect?.();
    observer = null;
    windowRef?.removeEventListener?.("resize", emit);
    windowRef?.visualViewport?.removeEventListener?.("resize", emit);
    documentRef?.removeEventListener?.("fullscreenchange", emit);
    documentRef?.removeEventListener?.("visibilitychange", emit);
    started = false;
  };

  const api = Object.freeze({ start, stop, measure, emit, getSurface: () => structuredClone(lastSurface) });
  if (options.autoStart !== false) start();
  return api;
}
