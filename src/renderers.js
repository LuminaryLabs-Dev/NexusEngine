function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

export function createHeadlessRenderer(config = {}) {
  const frames = [];
  return Object.freeze({
    rendererType: "headless",
    config: Object.freeze({ ...config }),
    frames,
    resize() {},
    render(snapshot) {
      const frame = Object.freeze({
        at: Date.now(),
        snapshot: clone(snapshot)
      });
      frames.push(frame);
      return frame.snapshot;
    },
    dispose() {
      frames.length = 0;
    }
  });
}

export function createRenderer(type = "headless", config = {}) {
  if (type !== "headless") {
    throw new RangeError(
      `NexusEngine Core does not provide the product renderer "${type}". Resolve a renderer adapter from the owning product or trusted kit package.`
    );
  }
  return createHeadlessRenderer(config);
}
