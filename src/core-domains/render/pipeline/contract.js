export const RENDER_LAYER_GRAPH_CAPABILITIES = Object.freeze([
  "n:render:pipeline:render-layer-graph",
  "n:render:pipeline:render-pass-contract",
  "n:render:pipeline:render-layer-validation"
]);

const clone = value => value === undefined ? undefined : structuredClone(value);
const uniqueStrings = values => Object.freeze([...new Set((values ?? []).map(String))]);

function normalizeDepth(depth = {}) {
  return Object.freeze({
    test: depth.test !== false,
    write: depth.write === true,
    source: depth.source == null ? null : String(depth.source)
  });
}

function normalizeBlend(blend = {}) {
  return Object.freeze({
    mode: String(blend.mode ?? "none"),
    premultipliedAlpha: blend.premultipliedAlpha === true
  });
}

export function createRenderPassContract(config = {}) {
  if (!config.id) throw new TypeError("Render pass contracts require an id.");
  const order = Number(config.order ?? 0);
  if (!Number.isFinite(order)) throw new TypeError(`Render pass ${config.id} order must be finite.`);
  return Object.freeze({
    id: String(config.id),
    passId: String(config.passId ?? config.id),
    semanticLayer: String(config.semanticLayer ?? config.id),
    stage: String(config.stage ?? "scene-content"),
    order,
    sceneContent: config.sceneContent !== false,
    technical: config.technical === true,
    transparent: config.transparent === true,
    reads: uniqueStrings(config.reads),
    writes: uniqueStrings(config.writes),
    requires: uniqueStrings(config.requires),
    mustRunAfter: uniqueStrings(config.mustRunAfter),
    mustRunBefore: uniqueStrings(config.mustRunBefore),
    depth: normalizeDepth(config.depth),
    blend: normalizeBlend(config.blend),
    metadata: Object.freeze(clone(config.metadata ?? {}))
  });
}

export function createRenderLayerGraph(config = {}) {
  const passes = Object.freeze((config.passes ?? []).map(createRenderPassContract));
  return Object.freeze({
    id: String(config.id ?? "render-layer-graph"),
    version: String(config.version ?? "1.0.0"),
    externalInputs: uniqueStrings(config.externalInputs),
    finalScenePassId: config.finalScenePassId == null ? null : String(config.finalScenePassId),
    passes,
    metadata: Object.freeze(clone(config.metadata ?? {}))
  });
}

function dependencyMap(graph) {
  const ids = new Set(graph.passes.map(pass => pass.id));
  const dependencies = new Map(graph.passes.map(pass => [pass.id, new Set()]));
  for (const pass of graph.passes) {
    for (const dependency of [...pass.requires, ...pass.mustRunAfter]) {
      if (ids.has(dependency)) dependencies.get(pass.id).add(dependency);
    }
    for (const before of pass.mustRunBefore) {
      if (ids.has(before)) dependencies.get(before).add(pass.id);
    }
  }
  return dependencies;
}

// Pure dependency resolution; the provider owns actual parallel execution.
function orderPasses(graph, dependencies) {
  const byId = new Map(graph.passes.map(pass => [pass.id, pass]));
  const pending = new Map([...dependencies].map(([id, values]) => [id, new Set(values)]));
  const ordered = [], batches = [];
  while (pending.size) {
    const ready = [...pending.entries()]
      .filter(([, values]) => values.size === 0)
      .map(([id]) => byId.get(id))
      .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
    if (!ready.length) {
      return { valid: false, ordered, batches, cycle: [...pending.keys()].sort() };
    }
    batches.push(ready.map(pass => pass.id));
    for (const pass of ready) {
      ordered.push(pass);
      pending.delete(pass.id);
      for (const values of pending.values()) values.delete(pass.id);
    }
  }
  return { valid: true, ordered, batches, cycle: [] };
}

function resourceReads(pass) {
  // Depth testing consumes the selected depth resource even when the author
  // did not repeat it in the ordinary reads list.
  return new Set([
    ...pass.reads,
    ...(pass.depth.test && pass.depth.source ? [pass.depth.source] : [])
  ]);
}

function inferResourceDependencies(ordered, dependencies) {
  const lastWriter = new Map(), readers = new Map(), hazards = [];
  const add = (pass, before, resourceId, type) => {
    if (!before || before === pass.id) return;
    dependencies.get(pass.id).add(before);
    hazards.push(Object.freeze({ before, after: pass.id, resourceId, type }));
  };
  for (const pass of ordered) {
    for (const resourceId of resourceReads(pass)) {
      add(pass, lastWriter.get(resourceId), resourceId, 'RAW');
      if (!readers.has(resourceId)) readers.set(resourceId, new Set());
      readers.get(resourceId).add(pass.id);
    }
    for (const resourceId of pass.writes) {
      add(pass, lastWriter.get(resourceId), resourceId, 'WAW');
      for (const reader of readers.get(resourceId) ?? []) {
        add(pass, reader, resourceId, 'WAR');
      }
      readers.set(resourceId, new Set());
      lastWriter.set(resourceId, pass.id);
    }
  }
  return hazards;
}

function resourceLifetimes(graph, ordered) {
  const uses = Object.create(null);
  const external = new Set(graph.externalInputs);
  ordered.forEach((pass, index) => {
    for (const resourceId of new Set([...resourceReads(pass), ...pass.writes])) {
      const value = uses[resourceId] ?? { firstUse: index, lastUse: index, external: external.has(resourceId) };
      value.lastUse = index;
      uses[resourceId] = value;
    }
  });
  return Object.freeze(Object.fromEntries(
    Object.entries(uses).sort(([a], [b]) => a.localeCompare(b))
      .map(([id, use]) => [id, Object.freeze(use)])
  ));
}

export function resolveRenderLayerGraph(input = {}) {
  const graph = input.passes ? createRenderLayerGraph(input) : input;
  const dependencies = dependencyMap(graph);
  const explicit = orderPasses(graph, dependencies);
  if (!explicit.valid) {
    return Object.freeze({
      valid: false,
      orderedPasses: Object.freeze(explicit.ordered),
      cycle: Object.freeze(explicit.cycle),
      dependencies: Object.freeze({}),
      batches: Object.freeze([]),
      hazards: Object.freeze([]),
      resourceLifetimes: Object.freeze({})
    });
  }
  // Preserve the established authored/explicit order. Record the missing
  // inter-pass resource hazards as dependencies before any provider may
  // parallelize passes; no GPU barriers or queue submission happen here.
  const hazards = inferResourceDependencies(explicit.ordered, dependencies);
  const resolved = orderPasses(graph, dependencies);
  return Object.freeze({
    valid: resolved.valid,
    orderedPasses: Object.freeze(resolved.ordered),
    cycle: Object.freeze(resolved.cycle),
    dependencies: Object.freeze(Object.fromEntries(
      [...dependencies].sort(([a], [b]) => a.localeCompare(b))
        .map(([id, values]) => [id, Object.freeze([...values].sort())])
    )),
    batches: Object.freeze(resolved.batches.map(ids => Object.freeze(ids))),
    hazards: Object.freeze(hazards),
    resourceLifetimes: resourceLifetimes(graph, resolved.ordered)
  });
}

export function validateRenderLayerGraph(input = {}, options = {}) {
  const graph = input.passes ? createRenderLayerGraph(input) : input;
  const issues = [];
  const ids = new Set();
  const byId = new Map();

  for (const pass of graph.passes ?? []) {
    if (ids.has(pass.id)) issues.push(`duplicate-pass-id:${pass.id}`);
    ids.add(pass.id);
    byId.set(pass.id, pass);
    if (pass.transparent && pass.depth.write) issues.push(`transparent-pass-writes-depth:${pass.id}`);
    if (pass.blend.mode !== "none" && !pass.transparent) issues.push(`blended-pass-not-transparent:${pass.id}`);
    if (pass.technical && pass.sceneContent) issues.push(`technical-pass-marked-scene-content:${pass.id}`);
  }

  for (const pass of graph.passes ?? []) {
    for (const dependency of [...pass.requires, ...pass.mustRunAfter, ...pass.mustRunBefore]) {
      if (!byId.has(dependency)) issues.push(`unknown-pass-dependency:${pass.id}:${dependency}`);
    }
  }

  const resolution = resolveRenderLayerGraph(graph);
  if (!resolution.valid) issues.push(`cyclic-pass-graph:${resolution.cycle.join(",")}`);

  const ordered = resolution.orderedPasses;
  const orderedIndex = new Map(ordered.map((pass, index) => [pass.id, index]));
  for (const pass of graph.passes ?? []) {
    for (const after of pass.mustRunAfter) {
      if (orderedIndex.has(after) && orderedIndex.get(pass.id) <= orderedIndex.get(after)) {
        issues.push(`must-run-after-violation:${pass.id}:${after}`);
      }
    }
    for (const before of pass.mustRunBefore) {
      if (orderedIndex.has(before) && orderedIndex.get(pass.id) >= orderedIndex.get(before)) {
        issues.push(`must-run-before-violation:${pass.id}:${before}`);
      }
    }
  }

  const external = new Set(graph.externalInputs ?? []);
  const available = new Set(external);
  for (const pass of ordered) {
    for (const read of resourceReads(pass)) {
      if (!available.has(read)) issues.push(`unresolved-read:${pass.id}:${read}`);
    }
    for (const write of pass.writes) available.add(write);
  }

  const finalScenePassId = String(options.finalScenePassId ?? graph.finalScenePassId ?? "");
  if (finalScenePassId) {
    const finalPass = byId.get(finalScenePassId);
    if (!finalPass) {
      issues.push(`missing-final-scene-pass:${finalScenePassId}`);
    } else {
      if (!finalPass.sceneContent) issues.push(`final-scene-pass-not-scene-content:${finalScenePassId}`);
      const finalIndex = orderedIndex.get(finalScenePassId);
      for (const pass of ordered.slice(finalIndex + 1)) {
        if (!pass.technical || pass.sceneContent) issues.push(`scene-content-after-final:${pass.id}`);
      }
    }
  }

  for (const requiredResource of options.requiredResources ?? []) {
    if (!available.has(String(requiredResource))) issues.push(`missing-required-resource:${requiredResource}`);
  }

  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
    orderedPasses: Object.freeze(ordered),
    graph
  });
}

export function assertRenderLayerGraph(input = {}, options = {}) {
  const result = validateRenderLayerGraph(input, options);
  if (!result.valid) throw new TypeError(`Invalid render layer graph: ${result.issues.join(", ")}`);
  return result;
}
