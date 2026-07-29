import { hashRegistryValue } from "../kits/composition-registry-kit/registry.js";

export const COMPOSITION_PREPARATION_SCHEMA = "nexusengine.composition-preparation/1";
export const COMPOSITION_APPLY_RECEIPT_SCHEMA = "nexusengine.composition-apply-receipt/1";
export const COMPOSITION_APPLY_STATE_SCHEMA = "nexusengine.composition-apply-state/1";

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
    bundles: Object.freeze(uniqueStrings(input.bundles)),
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
    bundles: request.bundles
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
        contentHash: source.contentHash,
        exportName: record.source.exportName,
        module: record.source.module,
        trusted: record.source.trusted === true
      }
    };
    return Object.freeze({
      ...descriptor,
      descriptorFingerprint: hashRegistryValue(descriptor)
    });
  });
}

function normalizePreflight(preflight, kits) {
  if (!preflight || preflight.ok === false) {
    return {
      ok: false,
      error: String(preflight?.error ?? "Composition host preflight rejected the plan."),
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
    staged: preflight.staged
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
          error: plan.errors?.[0]?.message ?? "Composition plan failed."
        }),
        staged: null
      };
    }
    const kits = Object.freeze(materializeKits(composition, request, plan));
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
    return {
      public: Object.freeze({
        schema: COMPOSITION_PREPARATION_SCHEMA,
        ok: true,
        planId,
        request: clone(request),
        plan: clone(plan),
        kits: clone(kits),
        resolvedKits: clone(preflight.resolvedKits),
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
      installOrder: Object.freeze(prepared.public.kits.map(({ kitId }) => kitId)),
      resolvedKits: clone(prepared.public.resolvedKits),
      host: Object.freeze(jsonClone(result.receipt ?? {}, "Composition host receipt"))
    });

    receipts.set(expectedPlanId, receipt);
    for (const resolution of prepared.public.resolvedKits) {
      kitFingerprints.set(resolution.kitId, resolution.effectiveFingerprint);
    }
    if (typeof options.persist === "function") {
      await options.persist(clone(getSnapshot()));
    }
    return clone(receipt);
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
