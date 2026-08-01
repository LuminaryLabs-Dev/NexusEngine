import { hashRegistryValue } from "../kits/composition-registry-kit/registry.js";

export const COMPOSITION_PREPARATION_SCHEMA = "nexusengine.composition-preparation/1";
export const COMPOSITION_APPLY_RECEIPT_SCHEMA = "nexusengine.composition-apply-receipt/1";
export const COMPOSITION_APPLY_STATE_SCHEMA = "nexusengine.composition-apply-state/1";
export const COMPOSITION_INSTALL_RECEIPT_SCHEMA = "nexusengine.composition-install-receipt/1";

const asList = (value) => Array.isArray(value) ? value : value == null ? [] : [value];
const clone = (value) => value === undefined ? undefined : structuredClone(value);

function jsonClone(value, label) {
  try {
    return JSON.parse(JSON.stringify(value, (_key, entry) => {
      if (typeof entry === "bigint") return String(entry);
      if (typeof entry === "function" || typeof entry === "symbol") return undefined;
      return entry;
    }));
  } catch (error) {
    throw new TypeError(`${label} must be JSON-serializable: ${error.message}`);
  }
}

function stableText(value, label) {
  const result = String(value ?? "").trim();
  if (!result) throw new TypeError(`${label} requires a stable value.`);
  return result;
}

function uniqueStrings(value) {
  return [...new Set(asList(value).map((entry) => stableText(entry, "Composition selection")))].sort();
}

function normalizeRequest(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("Composition request must be an object.");
  }
  if (Object.prototype.hasOwnProperty.call(input, "bundles")) {
    throw new TypeError("Composition bundles were removed; use recipes.");
  }
  if (input.tree) {
    return Object.freeze({
      tree: clone(input.tree),
      scopeNodeId: input.scopeNodeId == null ? null : stableText(input.scopeNodeId, "scopeNodeId")
    });
  }
  const configs = input.configs && typeof input.configs === "object" && !Array.isArray(input.configs)
    ? jsonClone(input.configs, "Composition configs")
    : {};
  return Object.freeze({
    kits: Object.freeze(uniqueStrings(input.kits)),
    domains: Object.freeze(uniqueStrings(input.domains)),
    recipes: Object.freeze(uniqueStrings(input.recipes)),
    configs: Object.freeze(configs),
    allowedStatuses: input.allowedStatuses == null
      ? null
      : Object.freeze(uniqueStrings(input.allowedStatuses))
  });
}

function planRequest(composition, request) {
  if (request.tree) {
    return composition.planning.planTree(request.tree, {
      ...(request.scopeNodeId ? { scopeNodeId: request.scopeNodeId } : {})
    });
  }
  return composition.planning.plan({
    kits: request.kits,
    domains: request.domains,
    recipes: request.recipes
  }, {
    ...(request.allowedStatuses ? { allowedStatuses: request.allowedStatuses } : {})
  });
}

function materializeKits(composition, request, plan) {
  const sources = new Map(composition.registry.listSources().map((source) => [source.registryId, source]));
  const order = plan.order.map((entry) => typeof entry === "string"
    ? { registryId: entry, config: request.configs?.[entry] ?? {} }
    : entry);
  return order.map((entry, index) => {
    const kitId = stableText(entry.registryId, `Composition plan entry ${index}`);
    const record = composition.registry.getKit(kitId);
    if (!record) throw new TypeError(`Composition plan references unknown Kit ${kitId}.`);
    const source = sources.get(record.source.registryId);
    if (!source) throw new TypeError(`Composition Kit ${kitId} references unknown source ${record.source.registryId}.`);
    const config = {
      ...clone(record.defaults),
      ...clone(request.configs?.[kitId] ?? {}),
      ...clone(entry.config ?? {})
    };
    const descriptor = {
      kitId,
      version: record.version,
      domainPath: record.domainPath,
      config,
      source: {
        registryId: source.registryId,
        package: source.package,
        version: source.version,
        sourceCommit: source.sourceCommit,
        integrity: source.integrity,
        status: source.status,
        subpath: record.source.subpath,
        exportName: record.source.exportName,
        environments: record.source.environments,
        permissions: record.source.permissions,
        installable: record.source.installable
      }
    };
    return Object.freeze({
      ...descriptor,
      descriptorFingerprint: hashRegistryValue(descriptor)
    });
  });
}

function normalizeInstallReceipt(value, kits) {
  const requested = asList(value?.packages).length
    ? asList(value.packages)
    : kits.map((kit) => ({
      kitId: kit.kitId,
      package: kit.source.package,
      version: kit.source.version,
      subpath: kit.source.subpath,
      exportName: kit.source.exportName,
      sourceCommit: kit.source.sourceCommit,
      integrity: kit.source.integrity
    }));
  return Object.freeze({
    schema: COMPOSITION_INSTALL_RECEIPT_SCHEMA,
    status: "installation-required",
    packages: Object.freeze(requested.map((entry, index) => Object.freeze({
      kitId: stableText(entry.kitId, `Install receipt package ${index} kitId`),
      package: stableText(entry.package, `Install receipt package ${index} package`),
      version: stableText(entry.version, `Install receipt package ${index} version`),
      subpath: entry.subpath == null ? null : stableText(entry.subpath, `Install receipt package ${index} subpath`),
      exportName: entry.exportName == null ? null : stableText(entry.exportName, `Install receipt package ${index} exportName`),
      sourceCommit: stableText(entry.sourceCommit, `Install receipt package ${index} sourceCommit`),
      integrity: stableText(entry.integrity, `Install receipt package ${index} integrity`)
    })))
  });
}

function normalizePreflight(preflight, kits) {
  if (!preflight || preflight.ok === false) {
    return {
      ok: false,
      error: String(preflight?.error ?? "Composition host preflight rejected the plan."),
      installReceipt: preflight?.installReceipt
        ? normalizeInstallReceipt(preflight.installReceipt, kits)
        : null,
      staged: preflight?.staged
    };
  }
  const entries = asList(preflight.resolvedKits ?? preflight.resolved);
  const byId = new Map();
  for (const entry of entries) {
    const kitId = stableText(entry?.kitId ?? entry?.registryId, "Resolved Kit id");
    if (byId.has(kitId)) throw new TypeError(`Composition host resolved Kit ${kitId} more than once.`);
    byId.set(kitId, entry);
  }
  const resolvedKits = kits.map((kit) => {
    const resolved = byId.get(kit.kitId);
    if (!resolved) throw new TypeError(`Composition host did not resolve Kit ${kit.kitId}.`);
    const executableFingerprint = stableText(
      resolved.executableFingerprint ?? resolved.fingerprint,
      `Resolved Kit ${kit.kitId} executableFingerprint`
    );
    return Object.freeze({
      kitId: kit.kitId,
      executableFingerprint,
      effectiveFingerprint: hashRegistryValue({
        descriptorFingerprint: kit.descriptorFingerprint,
        executableFingerprint
      })
    });
  });
  const expectedIds = new Set(kits.map(({ kitId }) => kitId));
  const unexpected = [...byId.keys()].filter((kitId) => !expectedIds.has(kitId));
  if (unexpected.length) {
    throw new TypeError(`Composition host resolved unexpected Kit(s): ${unexpected.join(", ")}.`);
  }
  return {
    ok: true,
    resolvedKits: Object.freeze(resolvedKits),
    staged: preflight.staged,
    installReceipt: null
  };
}

function normalizeState(snapshot = {}) {
  if (snapshot.schema !== COMPOSITION_APPLY_STATE_SCHEMA) {
    throw new TypeError("Unsupported composition apply state.");
  }
  const receipts = asList(snapshot.receipts).map((receipt) => {
    if (receipt?.schema !== COMPOSITION_APPLY_RECEIPT_SCHEMA) {
      throw new TypeError("Composition apply state contains an invalid receipt.");
    }
    return jsonClone(receipt, "Composition apply receipt");
  });
  const receiptIds = receipts.map(({ planId }) => planId);
  if (new Set(receiptIds).size !== receiptIds.length) {
    throw new TypeError("Composition apply state contains duplicate plan receipts.");
  }
  const kitFingerprints = snapshot.kitFingerprints && typeof snapshot.kitFingerprints === "object"
    ? Object.fromEntries(Object.entries(snapshot.kitFingerprints).map(([kitId, fingerprint]) => [
      stableText(kitId, "Kit fingerprint id"),
      stableText(fingerprint, `Kit ${kitId} fingerprint`)
    ]))
    : {};
  return { receipts, kitFingerprints };
}

export function createCompositionApplyController(options = {}) {
  const composition = options.composition;
  const host = options.host;
  if (!composition?.registry || !composition?.planning || !composition?.capabilities) {
    throw new TypeError("Composition apply controller requires the Core Composition API.");
  }
  if (!host || typeof host.preflight !== "function" || typeof host.apply !== "function") {
    throw new TypeError("Composition apply controller requires host.preflight and host.apply.");
  }
  if (typeof host.captureSnapshot !== "function" || typeof host.restoreSnapshot !== "function") {
    throw new TypeError("Composition apply controller requires transactional host.captureSnapshot and host.restoreSnapshot.");
  }

  let receipts = new Map();
  let kitFingerprints = new Map();

  function getSnapshot() {
    return Object.freeze({
      schema: COMPOSITION_APPLY_STATE_SCHEMA,
      receipts: Object.freeze([...receipts.values()].map(clone)),
      kitFingerprints: Object.freeze(Object.fromEntries(
        [...kitFingerprints.entries()].sort(([left], [right]) => left.localeCompare(right))
      ))
    });
  }

  function loadSnapshot(snapshot) {
    const normalized = normalizeState(snapshot);
    receipts = new Map(normalized.receipts.map((receipt) => [receipt.planId, Object.freeze(receipt)]));
    kitFingerprints = new Map(Object.entries(normalized.kitFingerprints));
    return getSnapshot();
  }

  async function prepareInternal(input = {}, context = {}) {
    const request = normalizeRequest(input);
    const plan = planRequest(composition, request);
    if (!plan.ok) {
      return {
        public: Object.freeze({
          schema: COMPOSITION_PREPARATION_SCHEMA,
          ok: false,
          planId: null,
          request: clone(request),
          plan: clone(plan),
          kits: Object.freeze([]),
          resolvedKits: Object.freeze([]),
          capabilityChanges: Object.freeze({ requires: Object.freeze([]), provides: Object.freeze([]) }),
          registryContentHash: composition.registry.getSnapshot().contentHash,
          installReceipt: null,
          error: plan.errors?.[0]?.message ?? "Composition plan failed."
        }),
        staged: null
      };
    }
    const kits = Object.freeze(materializeKits(composition, request, plan));
    const unavailable = kits.filter((kit) => kit.source.installable !== true);
    if (unavailable.length) {
      return {
        public: Object.freeze({
          schema: COMPOSITION_PREPARATION_SCHEMA,
          ok: false,
          planId: null,
          request: clone(request),
          plan: clone(plan),
          kits: clone(kits),
          resolvedKits: Object.freeze([]),
          capabilityChanges: Object.freeze({
            requires: Object.freeze([...new Set(kits.flatMap((kit) => composition.registry.getKit(kit.kitId)?.requires ?? []))].sort()),
            provides: Object.freeze([...new Set(kits.flatMap((kit) => composition.registry.getKit(kit.kitId)?.provides ?? []))].sort())
          }),
          registryContentHash: composition.registry.getSnapshot().contentHash,
          installReceipt: normalizeInstallReceipt(null, unavailable),
          error: "Composition requires packages that are not installed."
        }),
        staged: null
      };
    }
    const preflight = normalizePreflight(await host.preflight({
      request: clone(request),
      plan: clone(plan),
      kits: clone(kits),
      context
    }), kits);
    if (!preflight.ok) {
      return {
        public: Object.freeze({
          schema: COMPOSITION_PREPARATION_SCHEMA,
          ok: false,
          planId: null,
          request: clone(request),
          plan: clone(plan),
          kits: clone(kits),
          resolvedKits: Object.freeze([]),
          capabilityChanges: Object.freeze({
            requires: Object.freeze([...new Set(kits.flatMap((kit) => composition.registry.getKit(kit.kitId)?.requires ?? []))].sort()),
            provides: Object.freeze([...new Set(kits.flatMap((kit) => composition.registry.getKit(kit.kitId)?.provides ?? []))].sort())
          }),
          registryContentHash: composition.registry.getSnapshot().contentHash,
          installReceipt: clone(preflight.installReceipt),
          error: preflight.error
        }),
        staged: preflight.staged
      };
    }
    const identity = {
      request,
      plan,
      kits,
      resolvedKits: preflight.resolvedKits
    };
    const planId = hashRegistryValue(identity);
    const capabilityChanges = Object.freeze({
      requires: Object.freeze([...new Set(kits.flatMap((kit) => composition.registry.getKit(kit.kitId)?.requires ?? []))].sort()),
      provides: Object.freeze([...new Set(kits.flatMap((kit) => composition.registry.getKit(kit.kitId)?.provides ?? []))].sort())
    });
    return {
      public: Object.freeze({
        schema: COMPOSITION_PREPARATION_SCHEMA,
        ok: true,
        planId,
        request: clone(request),
        plan: clone(plan),
        kits: clone(kits),
        resolvedKits: clone(preflight.resolvedKits),
        capabilityChanges,
        registryContentHash: composition.registry.getSnapshot().contentHash,
        installReceipt: null,
        error: null
      }),
      staged: preflight.staged
    };
  }

  async function prepare(input = {}, context = {}) {
    return (await prepareInternal(input, context)).public;
  }

  async function apply(input = {}, applyOptions = {}) {
    const expectedPlanId = stableText(applyOptions.expectedPlanId, "expectedPlanId");
    const prepared = await prepareInternal(input, applyOptions.context ?? {});
    if (!prepared.public.ok) {
      throw new Error(prepared.public.error);
    }
    if (prepared.public.planId !== expectedPlanId) {
      throw new TypeError(`Composition plan changed after review: expected ${expectedPlanId}, received ${prepared.public.planId}.`);
    }
    const existingReceipt = receipts.get(expectedPlanId);
    if (existingReceipt) return clone(existingReceipt);

    for (const resolution of prepared.public.resolvedKits) {
      const accepted = kitFingerprints.get(resolution.kitId);
      if (accepted && accepted !== resolution.effectiveFingerprint) {
        throw new TypeError(`Composition Kit ${resolution.kitId} fingerprint conflicts with the installed Kit.`);
      }
    }

    const controllerSnapshot = getSnapshot();
    const hostSnapshot = await host.captureSnapshot({
      prepared: clone(prepared.public),
      context: applyOptions.context ?? {}
    });
    try {
      const result = await host.apply({
        prepared: clone(prepared.public),
        staged: prepared.staged,
        context: applyOptions.context ?? {}
      });
      if (!result || result.ok === false) {
        throw new Error(String(result?.error ?? "Composition host failed to apply the prepared plan."));
      }
      const receipt = Object.freeze({
        schema: COMPOSITION_APPLY_RECEIPT_SCHEMA,
        id: `composition-apply:${expectedPlanId}`,
        planId: expectedPlanId,
        status: "applied",
        sequence: receipts.size + 1,
        appliedAt: String(result.appliedAt ?? new Date().toISOString()),
        registryContentHash: prepared.public.registryContentHash,
        capabilityChanges: clone(prepared.public.capabilityChanges),
        installOrder: Object.freeze(prepared.public.kits.map(({ kitId }) => kitId)),
        resolvedKits: clone(prepared.public.resolvedKits),
        host: Object.freeze(jsonClone(result.receipt ?? {}, "Composition host receipt"))
      });

      receipts.set(expectedPlanId, receipt);
      for (const resolution of prepared.public.resolvedKits) {
        kitFingerprints.set(resolution.kitId, resolution.effectiveFingerprint);
      }
      if (typeof options.persist === "function") await options.persist(clone(getSnapshot()));
      return clone(receipt);
    } catch (error) {
      loadSnapshot(controllerSnapshot);
      try {
        await host.restoreSnapshot(hostSnapshot, {
          prepared: clone(prepared.public),
          context: applyOptions.context ?? {},
          cause: error
        });
        if (typeof options.persist === "function") await options.persist(clone(controllerSnapshot));
      } catch (rollbackError) {
        throw new AggregateError(
          [error, rollbackError],
          "Composition apply failed and the host rollback did not complete."
        );
      }
      throw error;
    }
  }

  if (options.initialSnapshot) loadSnapshot(options.initialSnapshot);

  return Object.freeze({
    prepare,
    apply,
    getReceipt(planId) {
      return clone(receipts.get(String(planId)) ?? null);
    },
    listReceipts() {
      return [...receipts.values()].map(clone);
    },
    getSnapshot,
    loadSnapshot,
    reset() {
      receipts = new Map();
      kitFingerprints = new Map();
      return getSnapshot();
    }
  });
}

export default createCompositionApplyController;
