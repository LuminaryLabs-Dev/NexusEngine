import { normalizeBuildSourceRecord } from "../../../source/kits/dependency-source-kit/services.js";

export const BUILD_TOOLCHAIN_SOURCES = Object.freeze([
  normalizeBuildSourceRecord({
    id: "git:quickjs-ng@v0.15.0",
    sourceKind: "git",
    canonicalLocator: "https://github.com/quickjs-ng/quickjs/archive/433941b99fb3c5e7f98b7ebd78727972bcf467ee.tar.gz",
    exactVersion: "433941b99fb3c5e7f98b7ebd78727972bcf467ee",
    integrity: "sha256:ecfb5211b82c1f3bf30e07f20f906f13f857e3f795cb220933009c82e5574db2",
    license: "MIT",
    requiredEnvironment: ["android-xr", "native-build", "pcvr"],
    provider: "github-archive",
    resolutionStatus: "resolved"
  }),
  normalizeBuildSourceRecord({
    id: "git:openxr-sdk-source@1.1.58",
    sourceKind: "git",
    canonicalLocator: "https://github.com/KhronosGroup/OpenXR-SDK-Source/archive/45df0ea7769e586de4a627ccded70ec9e3b4d4ac.tar.gz",
    exactVersion: "45df0ea7769e586de4a627ccded70ec9e3b4d4ac",
    integrity: "sha256:1b884ad7bd70f330727bb5d0ad36db7bc1e10d60050dfb17d1f3a4f46891046e",
    license: "Apache-2.0",
    requiredEnvironment: ["android-xr", "pcvr"],
    provider: "github-archive",
    resolutionStatus: "resolved"
  })
]);

export function createToolchainSourceService() {
  return Object.freeze({
    list() { return BUILD_TOOLCHAIN_SOURCES; },
    get(id) { return BUILD_TOOLCHAIN_SOURCES.find((record) => record.id === id) ?? null; }
  });
}

export default createToolchainSourceService;
