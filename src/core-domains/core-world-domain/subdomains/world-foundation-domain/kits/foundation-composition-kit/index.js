import { createFoundationContribution, createResolvedFoundation } from "../../contracts.js";

function stableCompare(left, right) {
  return Number(left.priority) - Number(right.priority) || left.id.localeCompare(right.id);
}

function resolveDependencies(contribution, all) {
  const dependencies = new Set();
  for (const dependency of contribution.dependsOn ?? []) {
    const direct = all.find((entry) => entry.id === dependency);
    if (direct) {
      dependencies.add(direct.id);
      continue;
    }
    const featureMatches = all.filter((entry) => entry.featureId === dependency);
    if (featureMatches.length === 0) throw new TypeError(`Foundation contribution ${contribution.id} requires missing dependency ${dependency}.`);
    for (const match of featureMatches) dependencies.add(match.id);
  }
  return [...dependencies].sort();
}

export function orderFoundationContributions(inputs = []) {
  const contributions = inputs.map(createFoundationContribution);
  const byId = new Map();
  for (const contribution of contributions) {
    if (byId.has(contribution.id)) throw new TypeError(`Duplicate foundation contribution id: ${contribution.id}.`);
    byId.set(contribution.id, contribution);
  }
  const dependencies = new Map(contributions.map((entry) => [entry.id, resolveDependencies(entry, contributions)]));
  const indegree = new Map(contributions.map((entry) => [entry.id, dependencies.get(entry.id).length]));
  const dependents = new Map(contributions.map((entry) => [entry.id, []]));
  for (const [id, required] of dependencies) {
    for (const dependency of required) dependents.get(dependency).push(id);
  }
  const ready = contributions.filter((entry) => indegree.get(entry.id) === 0).sort(stableCompare);
  const ordered = [];
  while (ready.length > 0) {
    const next = ready.shift();
    ordered.push(next);
    for (const dependentId of dependents.get(next.id).sort()) {
      indegree.set(dependentId, indegree.get(dependentId) - 1);
      if (indegree.get(dependentId) === 0) {
        ready.push(byId.get(dependentId));
        ready.sort(stableCompare);
      }
    }
  }
  if (ordered.length !== contributions.length) {
    const cyclic = contributions.filter((entry) => !ordered.some((value) => value.id === entry.id)).map((entry) => entry.id).sort();
    throw new TypeError(`Foundation contribution dependency cycle: ${cyclic.join(", ")}.`);
  }
  return ordered;
}

export function applyFoundationBlend(current, next, mode) {
  const value = Number(next) || 0;
  if (mode === "subtract") return current - value;
  if (mode === "replace") return value;
  if (mode === "max") return Math.max(current, value);
  if (mode === "min") return Math.min(current, value);
  return current + value;
}

function composeElevation(baseValue, ordered) {
  const base = Number(baseValue) || 0;
  let value = base;
  const fields = [];
  const operations = [];
  for (const contribution of ordered) {
    const channel = contribution.channels.elevation;
    if (channel === undefined) continue;
    if (typeof channel === "number") {
      value = applyFoundationBlend(value, channel, contribution.blendMode);
      operations.push({ contributionId: contribution.id, featureId: contribution.featureId, blendMode: contribution.blendMode, scalar: channel });
    } else {
      const operation = { contributionId: contribution.id, featureId: contribution.featureId, blendMode: contribution.blendMode, field: channel };
      fields.push(operation);
      operations.push(operation);
    }
  }
  return { baseValue: base, value, fields, operations };
}

function composeObjectChannel(baseValue, ordered, channelName) {
  let value = baseValue ?? null;
  for (const contribution of ordered) {
    const next = contribution.channels[channelName];
    if (next === undefined) continue;
    if (contribution.blendMode === "overlay" && value && typeof value === "object" && typeof next === "object") {
      value = { ...value, ...next };
    } else value = next;
  }
  return value;
}

export function composeFoundationContributions(cellId, base = {}, inputs = [], revision = 1) {
  const ordered = orderFoundationContributions(inputs);
  const baseChannels = base.channels ?? base;
  return createResolvedFoundation({
    cellId,
    revision,
    contributionIds: ordered.map((entry) => entry.id),
    channels: {
      elevation: composeElevation(baseChannels.elevation, ordered),
      material: composeObjectChannel(baseChannels.material, ordered, "material"),
      normal: composeObjectChannel(baseChannels.normal, ordered, "normal"),
      collision: composeObjectChannel(baseChannels.collision, ordered, "collision")
    },
    metadata: { orderedBy: ["dependencies", "priority", "id"] }
  });
}
