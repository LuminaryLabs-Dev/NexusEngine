function callPath(target, path, args = []) {
  const parts = String(path).split(".").filter(Boolean);
  const methodName = parts.pop();
  const host = parts.reduce((current, part) => current?.[part], target);
  if (!host || typeof host[methodName] !== "function") {
    throw new TypeError(`Replay call path is not callable: ${path}`);
  }
  return host[methodName](...args);
}

export function createReplayRunner({ snapshot = (engine) => engine.getState?.() ?? {}, tick = (engine, dt) => engine.tick?.(dt) } = {}) {
  return {
    run(engine, fixture = {}) {
      const events = [];
      for (const step of fixture.steps ?? []) {
        if (step.call) {
          events.push({ type: "call", call: step.call, result: callPath(engine, step.call, step.args ?? []) });
        }
        if (step.tick) {
          const count = Math.max(0, Number(step.tick.count ?? 1));
          const dt = Number.isFinite(Number(step.tick.dt)) ? Number(step.tick.dt) : 1 / 60;
          for (let i = 0; i < count; i += 1) tick(engine, dt);
          events.push({ type: "tick", count, dt });
        }
      }
      return { id: fixture.id ?? "replay", events, snapshot: snapshot(engine) };
    }
  };
}

export function assertReplayDeterministic(first, second) {
  const left = JSON.stringify(first);
  const right = JSON.stringify(second);
  if (left !== right) {
    throw new Error("Replay outputs are not deterministic.");
  }
  return true;
}
