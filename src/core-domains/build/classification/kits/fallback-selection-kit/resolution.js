import { contentIntegrity, stableJson } from "../../../contracts.js";

/** Strongly connected import groups cannot be split across execution environments. */
export function dependencyGroups(graph) {
  const modules = new Map(graph.modules.map((module) => [module.path, module]));
  let cursor = 0;
  const indices = new Map(),
    low = new Map(),
    stack = [],
    active = new Set(),
    groups = [];
  function visit(id) {
    indices.set(id, cursor);
    low.set(id, cursor++);
    stack.push(id);
    active.add(id);
    for (const edge of modules.get(id).imports) {
      const next = edge.resolved;
      if (edge.external || !modules.has(next)) continue;
      if (!indices.has(next)) {
        visit(next);
        low.set(id, Math.min(low.get(id), low.get(next)));
      } else if (active.has(next))
        low.set(id, Math.min(low.get(id), indices.get(next)));
    }
    if (low.get(id) === indices.get(id)) {
      const group = [];
      let next;
      do {
        next = stack.pop();
        active.delete(next);
        group.push(next);
      } while (next !== id);
      groups.push(group.sort());
    }
  }
  for (const id of [...modules.keys()].sort()) if (!indices.has(id)) visit(id);
  return groups.sort((a, b) => a[0].localeCompare(b[0]));
}

export function resolveExecution({
  classification,
  moduleGraph,
  target,
  profile,
  dependencyAnalysis,
}) {
  const records = new Map(
    classification.modules.map((module) => [module.modulePath, module]),
  );
  const groups = dependencyGroups(moduleGraph).map((paths) => {
    const modules = paths.map((id) => records.get(id));
    const effects = [
      ...new Set(modules.flatMap((module) => module.effects)),
    ].sort();
    const imports = moduleGraph.modules
      .filter((module) => paths.includes(module.path))
      .flatMap((module) => module.imports);
    const requirements = [];
    let mode =
      modules.every((module) => module.mode === "native") && paths.length === 1
        ? "native"
        : "node";
    const web = ["web-live", "web-static"].includes(target);
    if (web) mode = "javascript";
    else if (
      mode === "node" &&
      target !== "host-native" &&
      !effects.some((effect) => effect.startsWith("node:"))
    )
      mode = "javascript";
    if (
      !web &&
      target !== "host-native" &&
      classification.mode === "javascript" &&
      mode === "native"
    )
      mode = "javascript";
    if (modules.some((module) => module.mode === "unsupported"))
      requirements.push({ code: "unsupported-source", modules: paths });
    for (const edge of imports.filter(
      (edge) =>
        edge.external &&
        !edge.builtin &&
        (target === "host-native" ||
          dependencyAnalysis?.unresolved.includes(edge.package)),
    ))
      requirements.push({
        code: "external-runtime-closure-unproven",
        specifier: edge.specifier,
      });
    if (mode !== "native" && profile === "strict-native")
      requirements.push({
        code: "strict-native-rejects-javascript",
        modules: paths,
      });
    if (mode === "node" && target !== "host-native")
      requirements.push({ code: "node-runtime-target-unproven", target });
    if (!web && effects.some((effect) => effect.startsWith("browser:")))
      requirements.push({
        code: "browser-api-requires-platform-provider",
        effects: effects.filter((effect) => effect.startsWith("browser:")),
      });
    if (web && effects.some((effect) => effect.startsWith("node:")))
      requirements.push({
        code: "node-api-requires-platform-provider",
        effects: effects.filter((effect) => effect.startsWith("node:")),
      });
    // Native substitutions remain unavailable until a real implementation and parity proof are registered.
    return {
      id: contentIntegrity(stableJson(paths)),
      modules: paths,
      sourceAstHashes: modules.map((module) => module.sourceAstHash),
      mode: requirements.length ? "unsupported" : mode,
      reason:
        mode === "native"
          ? "compiler-supported-numeric-ir"
          : mode === "node"
            ? "node-module-environment-required"
            : web
              ? "web-module-environment"
              : "whole-kit-javascript-fallback",
      effects,
      requirements,
    };
  });
  const modes = new Set(groups.map((group) => group.mode));
  const interpreted = modes.has("node") || modes.has("javascript");
  const mode = modes.has("unsupported")
    ? "unsupported"
    : interpreted
      ? modes.has("native")
        ? "hybrid"
        : modes.has("node")
          ? "node"
          : "javascript"
      : "native";
  const runtimes = modes.has("node")
    ? ["node"]
    : modes.has("javascript")
      ? [["web-live", "web-static"].includes(target) ? "browser" : "quickjs-ng"]
      : [];
  const payload = {
    schema: "nexusengine.execution-resolution/1",
    target,
    profile,
    mode,
    groups,
    runtimes,
    requirements: groups.flatMap((group) => group.requirements),
  };
  return Object.freeze({
    ...payload,
    contentHash: contentIntegrity(stableJson(payload)),
  });
}
