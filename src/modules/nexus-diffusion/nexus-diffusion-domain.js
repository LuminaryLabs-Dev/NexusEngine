import { defineResource, defineEvent } from "../../ecs.js";
import { defineDomainServiceKit } from "../../domain-service-kit.js";

import { createDiffusionDatasetDomain } from "./subdomains/dataset/index.js";
import { createDiffusionTensorDomain } from "./subdomains/tensor/index.js";
import { createDiffusionBackendDomain } from "./subdomains/backend/index.js";
import { createDiffusionNoiseDomain } from "./subdomains/noise/index.js";
import { createDiffusionModelDomain } from "./subdomains/model/index.js";
import { createDiffusionTrainingDomain } from "./subdomains/training/index.js";
import { createDiffusionSamplingDomain } from "./subdomains/sampling/index.js";
import { createDiffusionCheckpointDomain } from "./subdomains/checkpoint/index.js";
import { createDiffusionPreviewDomain } from "./subdomains/preview/index.js";

const DiffusionState = defineResource("nexus.diffusion.state");
const DiffusionPrepared = defineEvent("nexus.diffusion.prepared");
const DiffusionTrained = defineEvent("nexus.diffusion.trained");
const DiffusionSampled = defineEvent("nexus.diffusion.sampled");
const DiffusionCheckpointSaved = defineEvent("nexus.diffusion.checkpoint.saved");

function clone(value) {
  return structuredClone(value);
}

function createInitialState(config = {}) {
  return {
    id: "nexus-diffusion-state",
    domain: "nexus-diffusion",
    version: "0.0.1",
    prepared: false,
    backend: typeof config.backend === "string" ? config.backend : config.backend?.preferred ?? "auto",
    imageSize: config.imageSize ?? 32,
    channels: config.channels ?? 1,
    timesteps: config.timesteps ?? 50,
    dataset: config.dataset ?? "procedural-shapes",
    model: config.model ?? "tiny-denoiser",
    metrics: {
      epochs: 0,
      steps: 0,
      latestLoss: null,
      meanLoss: null,
      losses: []
    },
    sample: null,
    checkpoint: null,
    datasetDescriptor: null,
    modelDescriptor: null
  };
}

function requireSubdomain(domains, name) {
  if (!domains[name]) throw new TypeError(`Nexus diffusion requires engine.n.${name}. Install createNexusDiffusionKits().`);
  return domains[name];
}

export function createNexusDiffusionDomain(config = {}) {
  return defineDomainServiceKit({
    id: config.id ?? "nexus-diffusion-domain",
    domain: "nexus-diffusion",
    apiName: config.apiName ?? "diffusion",
    version: "0.0.1",
    stability: "experimental",
    services: ["diffusion", "training", "sampling", "checkpoint", "preview"],
    resources: { DiffusionState },
    events: { DiffusionPrepared, DiffusionTrained, DiffusionSampled, DiffusionCheckpointSaved },
    metadata: {
      purpose: "Composed diffusion domain for tiny browser-trainable generative models.",
      subdomains: ["dataset", "tensor", "backend", "noise", "model", "training", "sampling", "checkpoint", "preview"]
    },
    initWorld({ world }) {
      world.setResource(DiffusionState, createInitialState(config));
    },
    createApi({ world, engine }) {
      const getState = () => world.getResource(DiffusionState);
      const replaceState = (state) => {
        world.setResource(DiffusionState, clone(state));
        return clone(world.getResource(DiffusionState));
      };
      const patchState = (patch = {}) => replaceState({ ...getState(), ...clone(patch) });
      const api = {
        getStatus() {
          return clone(getState());
        },
        getSubdomains() {
          return {
            dataset: engine.n.diffusionDataset,
            tensor: engine.n.diffusionTensor,
            backend: engine.n.diffusionBackend,
            noise: engine.n.diffusionNoise,
            model: engine.n.diffusionModel,
            training: engine.n.diffusionTraining,
            sampling: engine.n.diffusionSampling,
            checkpoint: engine.n.diffusionCheckpoint,
            preview: engine.n.diffusionPreview
          };
        },
        prepare() {
          const domains = this.getSubdomains();
          const backend = requireSubdomain(domains, "backend").selectBackend({ preferred: getState().backend });
          const dataset = requireSubdomain(domains, "dataset").createDataset({
            kind: getState().dataset,
            imageSize: getState().imageSize,
            channels: getState().channels
          });
          const model = requireSubdomain(domains, "model").createModel({
            kind: getState().model,
            imageSize: getState().imageSize,
            channels: getState().channels
          });
          requireSubdomain(domains, "noise").createSchedule({ timesteps: getState().timesteps });
          const next = patchState({
            prepared: true,
            backend: backend.selected,
            backendDescriptor: backend,
            datasetDescriptor: dataset.descriptor,
            modelDescriptor: model.descriptor
          });
          world.emit(DiffusionPrepared, { state: next });
          return next;
        },
        train(options = {}) {
          if (!getState().prepared) this.prepare();
          const domains = this.getSubdomains();
          const result = requireSubdomain(domains, "training").train({
            state: getState(),
            dataset: requireSubdomain(domains, "dataset"),
            tensor: requireSubdomain(domains, "tensor"),
            noise: requireSubdomain(domains, "noise"),
            model: requireSubdomain(domains, "model"),
            options
          });
          const next = patchState({ metrics: result.metrics });
          world.emit(DiffusionTrained, { state: next, result });
          return result;
        },
        sample(options = {}) {
          if (!getState().prepared) this.prepare();
          const domains = this.getSubdomains();
          const result = requireSubdomain(domains, "sampling").sample({
            state: getState(),
            tensor: requireSubdomain(domains, "tensor"),
            noise: requireSubdomain(domains, "noise"),
            model: requireSubdomain(domains, "model"),
            options
          });
          const next = patchState({ sample: result });
          world.emit(DiffusionSampled, { state: next, result });
          return result;
        },
        saveCheckpoint(id = "memory") {
          const domains = this.getSubdomains();
          const result = requireSubdomain(domains, "checkpoint").save({
            id,
            state: getState(),
            model: requireSubdomain(domains, "model").snapshot()
          });
          patchState({ checkpoint: result.descriptor });
          world.emit(DiffusionCheckpointSaved, { result });
          return result;
        },
        loadCheckpoint(id = "memory") {
          const domains = this.getSubdomains();
          const result = requireSubdomain(domains, "checkpoint").load(id);
          if (result?.model) requireSubdomain(domains, "model").loadSnapshot(result.model);
          if (result?.state) replaceState(result.state);
          return result;
        },
        getPreviewState() {
          const domains = this.getSubdomains();
          return requireSubdomain(domains, "preview").createPreviewState({
            state: getState(),
            dataset: requireSubdomain(domains, "dataset"),
            sample: getState().sample
          });
        },
        reset() {
          return replaceState(createInitialState(config));
        }
      };
      return api;
    }
  });
}

export function createNexusDiffusionKits(config = {}) {
  return [
    createDiffusionDatasetDomain(config.dataset ?? { imageSize: config.imageSize, channels: config.channels }),
    createDiffusionTensorDomain(config.tensor ?? {}),
    createDiffusionBackendDomain(config.backend ?? {}),
    createDiffusionNoiseDomain(config.noise ?? { timesteps: config.timesteps }),
    createDiffusionModelDomain(config.modelConfig ?? { imageSize: config.imageSize, channels: config.channels }),
    createDiffusionTrainingDomain(config.training ?? {}),
    createDiffusionSamplingDomain(config.sampling ?? {}),
    createDiffusionCheckpointDomain(config.checkpoint ?? {}),
    createDiffusionPreviewDomain(config.preview ?? {}),
    createNexusDiffusionDomain(config)
  ];
}
