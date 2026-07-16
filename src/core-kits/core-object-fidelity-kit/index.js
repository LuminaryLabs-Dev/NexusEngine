import { defineEvent, defineResource } from "../../ecs.js";
import { defineDomainServiceKit } from "../../domain-service-kit.js";
import {
  createObjectFidelityBuild,
  createObjectFidelityPackage,
  createObjectFidelityProfile,
  createObjectForm,
  hashFidelityValue
} from "./descriptors.js";

export * from "./descriptors.js";

export const CORE_OBJECT_FIDELITY_VERSION = "0.1.0";

const ObjectFidelityState = defineResource("core.object-fidelity.state");
const FidelityProfileRegistered = defineEvent("core.object-fidelity.profile-registered");
const FidelityBuildRequested = defineEvent("core.object-fidelity.build-requested");
const FidelityBuildProgressed = defineEvent("core.object-fidelity.build-progressed");
const FidelityPackageCommitted = defineEvent("core.object-fidelity.package-committed");
const FidelityBuildFailed = defineEvent("core.object-fidelity.build-failed");
const FidelityBuildCancelled = defineEvent("core.object-fidelity.build-cancelled");
const FidelityAdapted = defineEvent("core.object-fidelity.adapted");
const FidelityReset = defineEvent("core.object-fidelity.reset");
const FidelitySnapshotLoaded = defineEvent("core.object-fidelity.snapshot-loaded");

const runtimes = new WeakMap();
const clone = (value) => value === undefined ? undefined : structuredClone(value);

function initialState() {
  return {
    version: CORE_OBJECT_FIDELITY_VERSION,
    sequence: 0,
    profiles: {},
    forms: {},
    builds: {},
    activePackages: {},
    pendingPackages: {},
    adaptations: {},
    committedOperations: {}
  };
}

function ensureRuntime(world) {
  if (!runtimes.has(world)) runtimes.set(world, { builders: new Map() });
  return runtimes.get(world);
}

function normalizeError(error) {
  if (error == null) return null;
  if (error instanceof Error) return { name: error.name, message: error.message };
  if (typeof error === "object") return clone(error);
  return { name: "Error", message: String(error) };
}

function referenceLayer(id, role, kind, reference) {
  return reference ? { id, role, kind, reference } : null;
}

function createSourceBuilder() {
  return {
    id: "source-form",
    async prepare({ object, requirement, buildId }) {
      const layers = requirement.layers ?? [
        referenceLayer("geometry", "structure", "mesh", object.geometry),
        referenceLayer("material", "appearance", "material", object.material),
        referenceLayer("collision", "collision", "collision", object.collision)
      ].filter(Boolean);
      return {
        form: {
          id: `${buildId}:${requirement.id}`,
          objectId: object.id,
          requirementId: requirement.id,
          fidelity: requirement.fidelity,
          state: "ready",
          traits: requirement.requiredTraits,
          layers,
          metadata: { source: "core-object", objectContentHash: object.contentHash }
        }
      };
    }
  };
}

function createAbsentBuilder() {
  return {
    id: "absent-form",
    async prepare({ object, requirement, buildId }) {
      return {
        form: {
          id: `${buildId}:${requirement.id}`,
          objectId: object.id,
          requirementId: requirement.id,
          fidelity: requirement.fidelity,
          state: "ready",
          traits: requirement.requiredTraits,
          layers: [],
          metadata: { absent: true }
        }
      };
    }
  };
}

function createCapturedBuilder() {
  return {
    id: "captured-form",
    async prepare({ object, requirement, buildId }) {
      if (!requirement.capture) throw new TypeError(`Captured form ${requirement.id} requires capture settings.`);
      const requestId = `${buildId}:${requirement.id}:view-set`;
      return {
        form: {
          id: `${buildId}:${requirement.id}`,
          objectId: object.id,
          requirementId: requirement.id,
          fidelity: requirement.fidelity,
          state: "awaiting-views",
          traits: requirement.requiredTraits,
          layers: [],
          captureDependencies: [requestId],
          metadata: { source: "capture" }
        },
        captureRequest: {
          ...clone(requirement.capture),
          id: requestId,
          subject: {
            ...(requirement.capture.subject ?? {}),
            objectId: object.id,
            formId: `${buildId}:${requirement.id}`
          }
        }
      };
    },
    async complete({ form, captureResult }) {
      const layers = Object.entries(captureResult.observations ?? {}).map(([role, reference], index) => ({
        id: `${role}-${index}`,
        role,
        kind: role === "depth" ? "depth-layer" : "directional-image",
        reference
      }));
      return {
        ...clone(form),
        state: "ready",
        layers,
        metadata: {
          ...clone(form.metadata ?? {}),
          captureResultId: captureResult.id,
          captureContentHash: captureResult.contentHash
        }
      };
    }
  };
}

function validateSnapshot(snapshot = {}) {
  const next = initialState();
  next.sequence = Math.max(0, Math.floor(Number(snapshot.sequence ?? 0)));
  for (const profile of Object.values(snapshot.profiles ?? {})) {
    const normalized = createObjectFidelityProfile(profile);
    next.profiles[normalized.id] = normalized;
  }
  for (const form of Object.values(snapshot.forms ?? {})) {
    const normalized = createObjectForm(form);
    next.forms[normalized.id] = normalized;
  }
  for (const build of Object.values(snapshot.builds ?? {})) {
    const normalized = createObjectFidelityBuild(build);
    next.builds[normalized.id] = normalized;
  }
  for (const packageValue of Object.values(snapshot.activePackages ?? {})) {
    const normalized = createObjectFidelityPackage(packageValue);
    next.activePackages[normalized.objectId] = normalized;
  }
  for (const packageValue of Object.values(snapshot.pendingPackages ?? {})) {
    const normalized = createObjectFidelityPackage(packageValue);
    next.pendingPackages[normalized.objectId] = normalized;
  }
  next.adaptations = clone(snapshot.adaptations ?? {});
  next.committedOperations = clone(snapshot.committedOperations ?? {});
  return next;
}

export function createCoreObjectFidelityKit(config = {}) {
  return defineDomainServiceKit({
    id: config.id ?? "core-object-fidelity-domain",
    domain: "object-fidelity",
    domainPath: config.domainPath ?? "n:object:fidelity",
    parentDomainPath: config.parentDomainPath,
    apiName: config.apiName ?? "objectFidelity",
    version: CORE_OBJECT_FIDELITY_VERSION,
    stability: config.stability ?? "stable-candidate",
    requires: ["object:descriptor-contract", ...(config.requires ?? [])],
    services: ["forms", "profiles", "builds", "packages", "readiness", "adaptation", "snapshot", "reset"],
    resources: { ObjectFidelityState },
    events: {
      FidelityProfileRegistered,
      FidelityBuildRequested,
      FidelityBuildProgressed,
      FidelityPackageCommitted,
      FidelityBuildFailed,
      FidelityBuildCancelled,
      FidelityAdapted,
      FidelityReset,
      FidelitySnapshotLoaded
    },
    metadata: {
      purpose: "Preserve object identity through multiple valid forms, view-derived evidence, readiness, contextual adaptation, and atomic package replacement.",
      owns: ["acceptable object forms", "fidelity profiles", "fidelity builds", "form readiness", "capture dependencies", "fidelity packages", "contextual adaptation", "atomic package replacement"],
      doesNotOwn: ["object identity", "tree morphology or creature anatomy", "renderer objects", "GPU resources", "capture rendering", "asset transport", "WebGPU or Three.js"],
      optional: true,
      rendererAgnostic: true,
      deterministic: true,
      snapshot: true,
      reset: true,
      ...(config.metadata ?? {})
    },
    initWorld({ world }) {
      const runtime = ensureRuntime(world);
      runtime.builders.set("source-form", createSourceBuilder());
      runtime.builders.set("captured-form", createCapturedBuilder());
      runtime.builders.set("absent-form", createAbsentBuilder());
      world.setResource(ObjectFidelityState, initialState());
    },
    createApi({ engine, world }) {
      const runtime = ensureRuntime(world);
      const state = () => world.getResource(ObjectFidelityState);

      function publish(next, event, payload = {}) {
        world.setResource(ObjectFidelityState, next);
        world.emit(event, { state: clone(next), ...clone(payload) });
        return clone(next);
      }

      function patch(value, event, payload = {}) {
        const current = state();
        return publish({ ...current, ...clone(value), sequence: Number(current.sequence ?? 0) + 1 }, event, payload);
      }

      function putBuild(build, event = FidelityBuildProgressed, payload = {}) {
        const normalized = createObjectFidelityBuild(build);
        const current = state();
        patch({ builds: { ...current.builds, [normalized.id]: normalized } }, event, { build: normalized, ...payload });
        return normalized;
      }

      function putForm(form) {
        const normalized = createObjectForm(form);
        const current = state();
        patch({ forms: { ...current.forms, [normalized.id]: normalized } }, FidelityBuildProgressed, { form: normalized });
        return normalized;
      }

      function packageFor(build, profile, formsByRequirement) {
        const active = state().activePackages[build.objectId];
        return createObjectFidelityPackage({
          id: `${build.id}:package`,
          objectId: build.objectId,
          objectContentHash: build.objectContentHash,
          profileId: profile.id,
          buildId: build.id,
          revision: Number(active?.revision ?? 0) + 1,
          forms: formsByRequirement,
          readiness: { visible: Object.keys(formsByRequirement).length > 0, complete: false },
          metadata: { quality: build.quality }
        });
      }

      function updatePendingPackage(build, profile, formsByRequirement, complete = false) {
        const current = state();
        const packageValue = createObjectFidelityPackage({
          ...packageFor(build, profile, formsByRequirement),
          readiness: { visible: Object.keys(formsByRequirement).length > 0, complete }
        });
        patch({ pendingPackages: { ...current.pendingPackages, [build.objectId]: packageValue } }, FidelityBuildProgressed, { package: packageValue });
        return packageValue;
      }

      function failBuild(build, error) {
        return clone(putBuild({
          ...build,
          state: "failed",
          errors: [...(build.errors ?? []), normalizeError(error)],
          revision: build.revision + 1
        }, FidelityBuildFailed));
      }

      function currentObject(build) {
        return engine.n?.coreObject?.get?.(build.objectId) ?? engine.coreObject?.get?.(build.objectId) ?? null;
      }

      function isCurrent(build) {
        return currentObject(build)?.contentHash === build.objectContentHash;
      }

      function requiredRequirements(profile, quality) {
        return profile.forms.filter((requirement) => requirement.required && requirement.qualities.includes(quality));
      }

      function commitBuild(build, profile, formsByRequirement) {
        if (!isCurrent(build)) return putBuild({ ...build, state: "stale", revision: build.revision + 1 }, FidelityBuildFailed, { reason: "object-content-changed" });
        const missing = requiredRequirements(profile, build.quality).filter((requirement) => !formsByRequirement[requirement.id]);
        if (missing.length) return failBuild(build, new Error(`Missing required fidelity forms: ${missing.map((entry) => entry.id).join(", ")}.`));

        const pending = updatePendingPackage(build, profile, formsByRequirement, true);
        const current = state();
        const ledger = engine.n?.coreTransactionLedger ?? engine.coreTransactionLedger;
        if (ledger?.record) {
          const recorded = ledger.record("object-fidelity", build.operationId, {
            packageId: pending.id,
            packageRevision: pending.revision,
            packageContentHash: pending.contentHash
          }, { objectId: build.objectId, buildId: build.id });
          if (recorded.duplicate) return clone(current.builds[build.id] ?? build);
        } else if (current.committedOperations[build.operationId]) {
          return clone(current.builds[build.id] ?? build);
        }

        const readyBuild = createObjectFidelityBuild({
          ...build,
          state: "ready",
          readiness: { visible: true, complete: true },
          availableForms: Object.values(formsByRequirement),
          awaiting: [],
          packageId: pending.id,
          revision: build.revision + 1
        });
        const afterPending = state();
        const pendingPackages = { ...afterPending.pendingPackages };
        delete pendingPackages[build.objectId];
        publish({
          ...afterPending,
          sequence: Number(afterPending.sequence ?? 0) + 1,
          builds: { ...afterPending.builds, [readyBuild.id]: readyBuild },
          activePackages: { ...afterPending.activePackages, [build.objectId]: pending },
          pendingPackages,
          committedOperations: { ...afterPending.committedOperations, [build.operationId]: { packageId: pending.id, packageRevision: pending.revision } }
        }, FidelityPackageCommitted, { build: readyBuild, package: pending });
        return clone(readyBuild);
      }

      async function prepareRequirement(build, profile, requirement, object, formsByRequirement) {
        if (!requirement.qualities.includes(build.quality)) return { build, formsByRequirement };
        const builder = runtime.builders.get(requirement.builderId);
        if (!builder) {
          if (requirement.required) throw new Error(`Missing fidelity form builder: ${requirement.builderId}.`);
          return { build, formsByRequirement };
        }
        const prepared = await builder.prepare({ engine, object: clone(object), profile: clone(profile), requirement: clone(requirement), buildId: build.id, quality: build.quality });
        let form = createObjectForm(prepared?.form ?? prepared);
        if (!prepared?.captureRequest) {
          form = putForm({ ...form, state: "ready" });
          return {
            build: createObjectFidelityBuild({ ...build, readiness: { visible: true, complete: false }, availableForms: [...build.availableForms, form.id], revision: build.revision + 1 }),
            formsByRequirement: { ...formsByRequirement, [requirement.id]: form.id }
          };
        }

        const capture = engine.n?.coreCapture ?? engine.coreCapture;
        if (!capture?.request) {
          if (requirement.required) throw new Error(`Fidelity form ${requirement.id} requires Core Capture.`);
          return { build, formsByRequirement };
        }
        form = putForm(form);
        const captureJob = await capture.request(prepared.captureRequest);
        if (captureJob.state === "ready") {
          const completed = createObjectForm(await builder.complete({
            engine,
            object: clone(object),
            profile: clone(profile),
            requirement: clone(requirement),
            buildId: build.id,
            quality: build.quality,
            form: clone(form),
            captureResult: capture.getResult(captureJob.id)
          }));
          putForm(completed);
          return {
            build: createObjectFidelityBuild({ ...build, readiness: { visible: true, complete: false }, availableForms: [...build.availableForms, completed.id], revision: build.revision + 1 }),
            formsByRequirement: { ...formsByRequirement, [requirement.id]: completed.id }
          };
        }
        if (captureJob.state === "failed" && requirement.required) throw new Error(`Required capture failed for fidelity form ${requirement.id}: ${captureJob.error?.message ?? "unknown error"}.`);
        return {
          build: createObjectFidelityBuild({
            ...build,
            state: "awaiting-views",
            awaiting: [...build.awaiting, { requirementId: requirement.id, builderId: requirement.builderId, captureJobId: captureJob.id, form: clone(form), required: requirement.required }],
            readiness: { visible: build.readiness.visible, complete: false },
            revision: build.revision + 1
          }),
          formsByRequirement
        };
      }

      async function requestBuild(input = {}) {
        const objectId = String(input.objectId ?? "").trim();
        const profileId = String(input.profileId ?? "").trim();
        if (!objectId || !profileId) throw new TypeError("Fidelity build requires objectId and profileId.");
        const object = engine.n?.coreObject?.get?.(objectId) ?? engine.coreObject?.get?.(objectId);
        if (!object) throw new RangeError(`Unknown core object: ${objectId}.`);
        const profile = state().profiles[profileId];
        if (!profile) throw new RangeError(`Unknown object fidelity profile: ${profileId}.`);
        const quality = String(input.quality ?? "high");
        const operationId = `${object.id}:${object.contentHash}:${profile.id}:${profile.version}:${quality}`;
        const buildId = `fidelity:${hashFidelityValue(operationId)}`;
        const existing = state().builds[buildId];
        if (existing) return clone(existing);

        let build = createObjectFidelityBuild({
          id: buildId,
          objectId: object.id,
          objectContentHash: object.contentHash,
          profileId: profile.id,
          quality,
          state: "preparing",
          readiness: { visible: false, complete: false },
          availableForms: [],
          awaiting: [],
          errors: [],
          revision: 0,
          operationId
        });
        putBuild(build, FidelityBuildRequested);
        let formsByRequirement = {};
        try {
          for (const requirement of profile.forms) {
            const prepared = await prepareRequirement(build, profile, requirement, object, formsByRequirement);
            build = prepared.build;
            formsByRequirement = prepared.formsByRequirement;
            putBuild(build);
            updatePendingPackage(build, profile, formsByRequirement, false);
          }
          return build.awaiting.length ? clone(build) : commitBuild(build, profile, formsByRequirement);
        } catch (error) {
          return failBuild(build, error);
        }
      }

      async function resumeBuild(buildId) {
        const existing = state().builds[String(buildId)];
        if (!existing) throw new RangeError(`Unknown fidelity build: ${buildId}.`);
        if (["ready", "failed", "cancelled", "stale"].includes(existing.state)) return clone(existing);
        if (!isCurrent(existing)) return clone(putBuild({ ...existing, state: "stale", revision: existing.revision + 1 }, FidelityBuildFailed));
        const profile = state().profiles[existing.profileId];
        const object = currentObject(existing);
        const capture = engine.n?.coreCapture ?? engine.coreCapture;
        const formsByRequirement = { ...(state().pendingPackages[existing.objectId]?.forms ?? {}) };
        const remaining = [];
        let build = existing;

        for (const wait of existing.awaiting) {
          const job = capture?.getJob?.(wait.captureJobId);
          if (!job || ["queued", "waiting-for-provider", "capturing"].includes(job.state)) {
            remaining.push(wait);
            continue;
          }
          if (job.state === "failed") {
            if (wait.required) return failBuild(build, new Error(`Required capture failed for ${wait.requirementId}: ${job.error?.message ?? "unknown error"}.`));
            continue;
          }
          if (job.state === "cancelled") {
            if (wait.required) return failBuild(build, new Error(`Required capture was cancelled for ${wait.requirementId}.`));
            continue;
          }
          const builder = runtime.builders.get(wait.builderId);
          const requirement = profile.forms.find((entry) => entry.id === wait.requirementId);
          const completed = createObjectForm(await builder.complete({
            engine,
            object: clone(object),
            profile: clone(profile),
            requirement: clone(requirement),
            buildId: build.id,
            quality: build.quality,
            form: clone(wait.form),
            captureResult: capture.getResult(job.id)
          }));
          putForm(completed);
          formsByRequirement[wait.requirementId] = completed.id;
          build = createObjectFidelityBuild({ ...build, availableForms: [...build.availableForms, completed.id], revision: build.revision + 1 });
        }

        build = createObjectFidelityBuild({
          ...build,
          state: remaining.length ? "awaiting-views" : "validating",
          awaiting: remaining,
          readiness: { visible: Object.keys(formsByRequirement).length > 0, complete: false },
          revision: build.revision + 1
        });
        putBuild(build);
        updatePendingPackage(build, profile, formsByRequirement, false);
        return remaining.length ? clone(build) : commitBuild(build, profile, formsByRequirement);
      }

      const api = {
        registerProfile(input) {
          const profile = createObjectFidelityProfile(input);
          const current = state();
          const existing = current.profiles[profile.id];
          if (existing?.contentHash === profile.contentHash) return clone(existing);
          patch({ profiles: { ...current.profiles, [profile.id]: profile } }, FidelityProfileRegistered, { profile });
          return clone(profile);
        },
        registerFormBuilder(builder) {
          if (!builder || typeof builder !== "object" || typeof builder.id !== "string" || typeof builder.prepare !== "function") throw new TypeError("Form builder requires id and prepare(context).");
          runtime.builders.set(builder.id, builder);
          return builder.id;
        },
        unregisterFormBuilder(builderId) {
          if (["source-form", "captured-form", "absent-form"].includes(String(builderId))) return false;
          return runtime.builders.delete(String(builderId));
        },
        listFormBuilders() { return Array.from(runtime.builders.keys()).sort(); },
        requestBuild,
        resumeBuild,
        cancelBuild(buildId) {
          const id = String(buildId);
          const build = state().builds[id];
          if (!build) return false;
          if (build.state === "cancelled") return true;
          if (["ready", "failed", "stale"].includes(build.state)) return false;
          const capture = engine.n?.coreCapture ?? engine.coreCapture;
          for (const wait of build.awaiting) capture?.cancel?.(wait.captureJobId);
          putBuild({ ...build, state: "cancelled", revision: build.revision + 1 }, FidelityBuildCancelled);
          return true;
        },
        getBuild(buildId) { return clone(state().builds[String(buildId)] ?? null); },
        getForm(formId) { return clone(state().forms[String(formId)] ?? null); },
        getActivePackage(objectId) { return clone(state().activePackages[String(objectId)] ?? null); },
        getPendingPackage(objectId) { return clone(state().pendingPackages[String(objectId)] ?? null); },
        getRenderablePackage(objectId) { return clone(state().activePackages[String(objectId)] ?? state().pendingPackages[String(objectId)] ?? null); },
        adapt(input = {}) {
          const objectId = String(input.objectId ?? "").trim();
          if (!objectId) throw new TypeError("Fidelity adaptation requires objectId.");
          const packageValue = state().activePackages[objectId] ?? state().pendingPackages[objectId];
          if (!packageValue?.readiness?.visible) return null;
          const profile = state().profiles[packageValue.profileId];
          const quality = String(input.quality ?? packageValue.metadata?.quality ?? "high");
          const projectedSize = Math.max(0, Number(input.projectedSize ?? 0));
          const candidates = profile.forms
            .filter((requirement) => requirement.qualities.includes(quality))
            .filter((requirement) => packageValue.forms[requirement.id])
            .sort((left, right) => right.minimumProjectedSize - left.minimumProjectedSize || left.order - right.order || left.id.localeCompare(right.id));
          if (!candidates.length) return null;

          const previous = state().adaptations[objectId] ?? null;
          let selected = candidates.find((requirement) => projectedSize >= requirement.minimumProjectedSize && (requirement.maximumProjectedSize == null || projectedSize <= requirement.maximumProjectedSize)) ?? candidates.at(-1);
          if (previous) {
            const previousRequirement = candidates.find((entry) => packageValue.forms[entry.id] === previous.formId);
            if (previousRequirement) {
              const margin = Math.max(1, previousRequirement.minimumProjectedSize) * profile.change.hysteresis;
              const withinMinimum = projectedSize >= Math.max(0, previousRequirement.minimumProjectedSize - margin);
              const withinMaximum = previousRequirement.maximumProjectedSize == null || projectedSize <= previousRequirement.maximumProjectedSize + margin;
              if (withinMinimum && withinMaximum) selected = previousRequirement;
            }
          }

          const result = {
            objectId,
            packageId: packageValue.id,
            packageRevision: packageValue.revision,
            formId: packageValue.forms[selected.id],
            previousFormId: previous?.formId ?? null,
            change: { mode: profile.change.mode, duration: profile.change.duration },
            context: {
              projectedSize,
              quality,
              importance: Math.max(0, Math.min(1, Number(input.importance ?? 0.5)))
            }
          };
          const current = state();
          patch({ adaptations: { ...current.adaptations, [objectId]: result } }, FidelityAdapted, { adaptation: result });
          return clone(result);
        },
        getSnapshot() { return clone(state()); },
        loadSnapshot(snapshot = {}) { return publish(validateSnapshot(snapshot), FidelitySnapshotLoaded); },
        reset() { return publish(initialState(), FidelityReset); }
      };

      engine.objectFidelity = api;
      return api;
    }
  });
}

export default createCoreObjectFidelityKit;
