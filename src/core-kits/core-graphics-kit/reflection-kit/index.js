import { createCoreCapabilityKit } from "../../core-capability-kit.js";
import {
  createGraphicsAdapterResult,
  createGraphicsVisibleFrameReceipt,
  negotiateGraphicsReflection
} from "../adapters.js";
import {
  REFLECTION_CAPABILITIES,
  createReflectionDescriptor,
  createReflectionPolicyDescriptor
} from "./contract.js";

export * from "./contract.js";

const clone = value => value === undefined ? undefined : structuredClone(value);

function values(input = []) {
  return Array.isArray(input) ? input : Object.values(input ?? {});
}

function mapById(input, factory) {
  return Object.fromEntries(values(input).map(value => {
    const descriptor = factory(value);
    return [descriptor.id, descriptor];
  }));
}

function unique(values = []) {
  return [...new Set(values.map(String))];
}

export function createCoreReflectionKit(config = {}) {
  const configuredReflections = config.reflections ?? config.descriptors?.reflections ?? [];
  const configuredPolicies = config.policies ?? config.descriptors?.policies ?? (config.policy ? [config.policy] : []);
  const reflections = mapById(configuredReflections, createReflectionDescriptor);
  const policies = mapById(configuredPolicies, createReflectionPolicyDescriptor);
  if (Object.keys(policies).length === 0) {
    const defaultPolicy = createReflectionPolicyDescriptor();
    policies[defaultPolicy.id] = defaultPolicy;
  }
  const activePolicyId = String(config.activePolicyId ?? Object.keys(policies)[0]);

  return createCoreCapabilityKit({
    ...config,
    id: config.id ?? "n-core-graphics-reflection-kit",
    domain: "core-graphics-reflection",
    domainPath: config.domainPath ?? "n:graphics:reflection",
    apiName: config.apiName ?? "coreReflection",
    purpose: "Renderer-neutral reflection descriptors, quality budgets, fallback negotiation, normalized provider results, revisions, and visible-frame receipts.",
    owns: [
      "reflection descriptors",
      "reflection quality and fallback policy",
      "reflection admission results",
      "material and reflection revisions",
      "visible reflection frame receipts",
      ...(config.owns ?? [])
    ],
    doesNotOwn: [
      "renderer implementation",
      "GPU resource allocation",
      "shader compilation",
      "reflection pass submission",
      ...(config.doesNotOwn ?? [])
    ],
    services: [
      "reflection-descriptors",
      "reflection-policy",
      "reflection-negotiation",
      "reflection-results",
      "reflection-frame-receipts",
      ...(config.services ?? [])
    ],
    requires: unique(["n:core-graphics", ...(config.requires ?? [])]),
    provides: unique([...REFLECTION_CAPABILITIES, ...(config.provides ?? [])]),
    descriptors: {
      ...(config.descriptors ?? {}),
      reflections,
      policies
    },
    initialState: {
      ...(config.initialState ?? {}),
      activePolicyId,
      materialRevision: Math.max(0, Number(config.materialRevision ?? 0)),
      reflectionRevision: Math.max(0, Number(config.reflectionRevision ?? (Object.keys(reflections).length > 0 ? 1 : 0))),
      lastNegotiation: null,
      lastResult: null,
      lastFrameReceipt: null
    },
    metadata: {
      ...(config.metadata ?? {}),
      rendererAgnostic: true,
      providerNeutral: true,
      snapshotSafe: true,
      deterministicFallback: true
    },
    createApi({ baseApi }) {
      const state = () => baseApi.getState();
      const descriptors = type => baseApi.getDescriptors(type);
      const activePolicy = () => descriptors("policies")[state().activePolicyId] ?? null;
      const bump = key => {
        const next = Math.max(0, Number(state()[key] ?? 0)) + 1;
        baseApi.update({ [key]: next }, "descriptorChanged");
        return next;
      };

      return {
        createDescriptor: createReflectionDescriptor,
        createPolicy: createReflectionPolicyDescriptor,
        registerReflection(input) {
          const descriptor = createReflectionDescriptor(input);
          baseApi.setDescriptor("reflections", descriptor.id, descriptor);
          bump("reflectionRevision");
          return clone(descriptor);
        },
        registerPolicy(input) {
          const descriptor = createReflectionPolicyDescriptor(input);
          baseApi.setDescriptor("policies", descriptor.id, descriptor);
          bump("reflectionRevision");
          return clone(descriptor);
        },
        setActivePolicy(policyId) {
          const id = String(policyId);
          if (!descriptors("policies")[id]) throw new RangeError(`Unknown reflection policy: ${id}.`);
          if (state().activePolicyId !== id) {
            baseApi.update({ activePolicyId: id }, "configured");
            bump("reflectionRevision");
          }
          return clone(descriptors("policies")[id]);
        },
        getActivePolicy: () => clone(activePolicy()),
        getReflection: reflectionId => clone(descriptors("reflections")[String(reflectionId)] ?? null),
        listReflections: () => Object.values(descriptors("reflections")).map(clone),
        bumpMaterialRevision: () => bump("materialRevision"),
        bumpReflectionRevision: () => bump("reflectionRevision"),
        getRevisions: () => ({
          materialRevision: Math.max(0, Number(state().materialRevision ?? 0)),
          reflectionRevision: Math.max(0, Number(state().reflectionRevision ?? 0))
        }),
        negotiate(adapter = {}, policyInput = null) {
          const policy = policyInput
            ? createReflectionPolicyDescriptor(policyInput)
            : activePolicy() ?? createReflectionPolicyDescriptor();
          const revisions = this.getRevisions();
          const request = {
            requestId: `${policy.id}:${state().sequence + 1}`,
            adapterId: adapter.id ?? "graphics-adapter",
            preferredTechnique: policy.preferredTechnique,
            fallbackOrder: policy.allowDegraded ? policy.fallbackOrder : [],
            materialRevision: revisions.materialRevision,
            reflectionRevision: revisions.reflectionRevision,
            updateCost: {},
            metadata: { policyId: policy.id, required: policy.required }
          };
          const raw = typeof adapter.negotiate === "function"
            ? adapter.negotiate(request)
            : negotiateGraphicsReflection(request, adapter.capabilities ?? adapter);
          const result = createGraphicsAdapterResult({
            ...raw,
            adapterId: raw?.adapterId ?? request.adapterId,
            requestId: raw?.requestId ?? request.requestId,
            materialRevision: raw?.materialRevision ?? revisions.materialRevision,
            reflectionRevision: raw?.reflectionRevision ?? revisions.reflectionRevision
          });
          baseApi.update({ lastNegotiation: result }, "updated");
          return clone(result);
        },
        recordResult(input = {}) {
          const revisions = this.getRevisions();
          const result = createGraphicsAdapterResult({
            ...input,
            materialRevision: input.materialRevision ?? revisions.materialRevision,
            reflectionRevision: input.reflectionRevision ?? revisions.reflectionRevision
          });
          baseApi.update({ lastResult: result }, "updated");
          return clone(result);
        },
        acknowledgeFrame(input = {}) {
          const revisions = this.getRevisions();
          const receipt = createGraphicsVisibleFrameReceipt({
            ...input,
            resultId: input.resultId ?? state().lastResult?.id ?? state().lastNegotiation?.id ?? null,
            materialRevision: input.materialRevision ?? revisions.materialRevision,
            reflectionRevision: input.reflectionRevision ?? revisions.reflectionRevision
          });
          baseApi.update({ lastFrameReceipt: receipt }, "updated");
          return clone(receipt);
        },
        getLastNegotiation: () => clone(state().lastNegotiation),
        getLastResult: () => clone(state().lastResult),
        getLastFrameReceipt: () => clone(state().lastFrameReceipt)
      };
    }
  });
}

export default createCoreReflectionKit;
