export function defineWorldSurface({ id, kind, toWorld, fromWorld, sampleFrame, upAt }) {
  if (!id) throw new TypeError("World surface id is required.");
  for (const [name, fn] of Object.entries({ toWorld, fromWorld, sampleFrame })) {
    if (typeof fn !== "function") throw new TypeError(`World surface ${name} is required.`);
  }
  return Object.freeze({ id, kind: kind ?? "custom", toWorld, fromWorld, sampleFrame, upAt: upAt ?? ((point) => sampleFrame(point).normal) });
}
