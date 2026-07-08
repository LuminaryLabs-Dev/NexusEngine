import { defineDomainServiceKit } from "../../../../domain-service-kit.js";

export function createCpuBackendKit() {
  return Object.freeze({
    id: "cpu",
    kind: "cpu-backend-kit",
    selected: true,
    capabilities: Object.freeze(["float32array", "deterministic", "training", "sampling"])
  });
}

export function createWebGPUBackendDescriptorKit() {
  const available = typeof globalThis.navigator !== "undefined" && Boolean(globalThis.navigator.gpu);
  return Object.freeze({
    id: "webgpu",
    kind: "webgpu-backend-descriptor-kit",
    selected: false,
    available,
    capabilities: Object.freeze(available ? ["descriptor-only", "future-kernels"] : [])
  });
}

export function createBackendCapabilityReportKit() {
  return {
    report(selected = "cpu") {
      const cpu = createCpuBackendKit();
      const webgpu = createWebGPUBackendDescriptorKit();
      return {
        selected,
        backends: { cpu, webgpu },
        note: webgpu.available ? "WebGPU detected; v0 uses CPU kernels." : "CPU backend selected; WebGPU unavailable or not enabled."
      };
    }
  };
}

export function createBackendAutoSelectKit() {
  return {
    select({ preferred = "auto" } = {}) {
      const webgpu = createWebGPUBackendDescriptorKit();
      const selected = preferred === "webgpu" && webgpu.available ? "webgpu" : "cpu";
      return createBackendCapabilityReportKit().report(selected);
    }
  };
}

export function createDiffusionBackendDomain(config = {}) {
  let selected = "cpu";
  const auto = createBackendAutoSelectKit();
  const report = createBackendCapabilityReportKit();
  return defineDomainServiceKit({
    id: config.id ?? "n-diffusion-backend-domain-kit",
    domain: "diffusion-backend",
    apiName: config.apiName ?? "diffusionBackend",
    version: "0.0.1",
    stability: "experimental",
    services: ["backend", "capability-report", "auto-select"],
    metadata: {
      purpose: "Diffusion backend subdomain with CPU execution and WebGPU capability reporting."
    },
    createApi() {
      return {
        selectBackend(options = {}) {
          const result = auto.select({ preferred: options.preferred ?? config.preferred ?? "auto" });
          selected = result.selected;
          return result;
        },
        getCapabilities() {
          return report.report(selected);
        },
        getSelected() {
          return selected;
        }
      };
    }
  });
}
