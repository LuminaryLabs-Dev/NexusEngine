import { normalizeBuildSourceRecord } from "../../../source/kits/dependency-source-kit/services.js";

export const BUILD_TOOLCHAIN_SOURCES = Object.freeze([
  normalizeBuildSourceRecord({
    id: "git:quickjs-ng@v0.15.0",
    sourceKind: "git",
    canonicalLocator: "https://github.com/quickjs-ng/quickjs.git",
    exactVersion: "433941b99fb3c5e7f98b7ebd78727972bcf467ee",
    integrity: null,
    license: "MIT",
    requiredEnvironment: ["native-build"],
    resolutionStatus: "unresolved"
  }),
  normalizeBuildSourceRecord({
    id: "git:openxr-sdk-source@1.1.58",
    sourceKind: "git",
    canonicalLocator: "https://github.com/KhronosGroup/OpenXR-SDK-Source.git",
    exactVersion: "45df0ea7769e586de4a627ccded70ec9e3b4d4ac",
    integrity: null,
    license: "Apache-2.0",
    requiredEnvironment: ["android-xr", "pcvr"],
    resolutionStatus: "unresolved"
  })
]);

export function createToolchainSourceService() {
  return Object.freeze({
    list() { return BUILD_TOOLCHAIN_SOURCES; },
    get(id) { return BUILD_TOOLCHAIN_SOURCES.find((record) => record.id === id) ?? null; }
  });
}

export default createToolchainSourceService;
