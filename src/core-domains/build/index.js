import { homedir } from "node:os";
import path from "node:path";

import { CORE_REGISTRY_SHA256 } from "../catalog.js";
import { createArtifactCacheService } from "./subdomains/artifact/kits/artifact-cache-kit/services.js";
import { createArtifactIntegrityService } from "./subdomains/artifact/kits/artifact-integrity-kit/services.js";
import { createArtifactManifestService } from "./subdomains/artifact/kits/artifact-manifest-kit/services.js";
import { createArtifactOutputService } from "./subdomains/artifact/kits/artifact-output-kit/services.js";
import { createDependencyAnalysisService } from "./subdomains/analysis/kits/dependency-analysis-kit/services.js";
import { createEffectAnalysisService } from "./subdomains/analysis/kits/effect-analysis-kit/services.js";
import { createJavascriptAstService } from "./subdomains/analysis/kits/javascript-ast-kit/services.js";
import { createTypeAnalysisService } from "./subdomains/analysis/kits/type-analysis-kit/services.js";
import { createCapabilityResolutionService } from "./subdomains/classification/kits/capability-resolution-kit/services.js";
import { createFallbackSelectionService } from "./subdomains/classification/kits/fallback-selection-kit/services.js";
import { createPortabilityClassifierService } from "./subdomains/classification/kits/portability-classifier-kit/services.js";
import { createJavascriptFallbackService } from "./subdomains/compile/kits/javascript-fallback-kit/services.js";
import { createNativeRuntimeLinkService } from "./subdomains/compile/kits/native-runtime-link-kit/services.js";
import { createRuntimeAbiService } from "./subdomains/compile/kits/runtime-abi-kit/services.js";
import { createRustLoweringService } from "./subdomains/compile/kits/rust-lowering-kit/services.js";
import { createWebModuleLinkerService } from "./subdomains/compile/kits/web-module-linker-kit/services.js";
import { createExecutionIrService } from "./subdomains/ir/kits/execution-ir-kit/services.js";
import { createIrValidationService } from "./subdomains/ir/kits/ir-validation-kit/services.js";
import { createKitIrService } from "./subdomains/ir/kits/kit-ir-kit/services.js";
import { createSourceMapService } from "./subdomains/ir/kits/source-map-kit/services.js";
import { createBuildApprovalService } from "./subdomains/orchestration/kits/build-approval-kit/services.js";
import { createBuildExecutionService } from "./subdomains/orchestration/kits/build-execution-kit/services.js";
import { createBuildPlanService } from "./subdomains/orchestration/kits/build-plan-kit/services.js";
import { createBuildReceiptService } from "./subdomains/orchestration/kits/build-receipt-kit/services.js";
import { createBuildRequestService } from "./subdomains/orchestration/kits/build-request-kit/services.js";
import { createTargetSetService } from "./subdomains/orchestration/kits/target-set-kit/services.js";
import { createCrossRuntimeParityService } from "./subdomains/proof/kits/cross-runtime-parity-kit/services.js";
import { createProjectImmutabilityService } from "./subdomains/proof/kits/project-immutability-kit/services.js";
import { createTargetValidationService } from "./subdomains/proof/kits/target-validation-kit/services.js";
import { createDependencySourceService } from "./subdomains/source/kits/dependency-source-kit/services.js";
import { createModuleGraphService } from "./subdomains/source/kits/module-graph-kit/services.js";
import { createProjectSourceService } from "./subdomains/source/kits/project-source-kit/services.js";
import { createSourceCacheService } from "./subdomains/source/kits/source-cache-kit/services.js";
import { createSourceFingerprintService } from "./subdomains/source/kits/source-fingerprint-kit/services.js";
import { createAndroidXrTargetProvider } from "./subdomains/target/subdomains/android-xr/kits/android-xr-target-kit/services.js";
import { createOpenXrInputService } from "./subdomains/target/subdomains/openxr/kits/openxr-input-kit/services.js";
import { createOpenXrRenderService } from "./subdomains/target/subdomains/openxr/kits/openxr-render-kit/services.js";
import { createOpenXrRuntimeService } from "./subdomains/target/subdomains/openxr/kits/openxr-runtime-kit/services.js";
import { createPcvrTargetProvider } from "./subdomains/target/subdomains/pcvr/kits/pcvr-target-kit/services.js";
import { createWebLiveTargetProvider } from "./subdomains/target/subdomains/web-live/kits/web-live-target-kit/services.js";
import { createWebStaticTargetProvider } from "./subdomains/target/subdomains/web-static/kits/web-static-target-kit/services.js";
import { createTargetRegistryService } from "./subdomains/target/kits/target-registry-kit/services.js";
import { createIsolatedStageService } from "./subdomains/toolchain/kits/isolated-stage-kit/services.js";
import { createProcessExecutionService } from "./subdomains/toolchain/kits/process-execution-kit/services.js";
import { createToolchainDiscoveryService } from "./subdomains/toolchain/kits/toolchain-discovery-kit/services.js";
import { createToolchainProvisionService } from "./subdomains/toolchain/kits/toolchain-provision-kit/services.js";
import { createToolchainSourceService } from "./subdomains/toolchain/kits/toolchain-source-kit/services.js";

export * from "./adapters/mcp/build-mcp-provider.js";

export * from "./contracts.js";
export * from "./domain.manifest.js";

export function createBuildDomain(config = {}) {
  const stateRoot = path.resolve(config.stateRoot ?? process.env.NEXUSENGINE_HOME ?? path.join(homedir(), ".nexusengine"));
  const artifactRoot = path.resolve(config.artifactRoot ?? path.join(stateRoot, "artifacts"));
  const sourceCache = createSourceCacheService({ root: path.join(stateRoot, "sources") });
  const toolchainSource = createToolchainSourceService();
  const targetSet = createTargetSetService();
  const processExecution = createProcessExecutionService({ allowedRoot: stateRoot });
  const toolchainProvision = createToolchainProvisionService({
    cache: sourceCache,
    fetchSource: config.fetchSource,
    processExecution
  });
  const openxrSource = toolchainSource.get("git:openxr-sdk-source@1.1.58");
  const openxrRuntime = createOpenXrRuntimeService({ sourceRecord: openxrSource, processExecution });
  const openxrInput = createOpenXrInputService();
  const openxrRender = createOpenXrRenderService();
  const rustLowering = createRustLoweringService();
  const javascriptFallback = createJavascriptFallbackService({
    available: config.quickJsAvailable !== false,
    sourceRecord: toolchainSource.get("git:quickjs-ng@v0.15.0"),
    toolchainProvision
  });
  const runtimeAbi = createRuntimeAbiService();
  const webModuleLinker = createWebModuleLinkerService({
    root: stateRoot,
    processExecution,
    fetchSource: config.webFetchSource
  });
  const targetRegistry = createTargetRegistryService({
    providers: [
      createWebLiveTargetProvider({ ...config.targets?.webLive, linker: webModuleLinker }),
      createWebStaticTargetProvider({ ...config.targets?.webStatic, linker: webModuleLinker }),
      createAndroidXrTargetProvider({
        ...config.targets?.androidXr,
        sourceRecords: toolchainSource.list(),
        stateRoot,
        processExecution,
        toolchainSource,
        toolchainProvision,
        rustLowering,
        javascriptFallback,
        openxrRuntime,
        openxrInput,
        openxrRender
      }),
      createPcvrTargetProvider({
        ...config.targets?.pcvr,
        sourceRecords: toolchainSource.list(),
        stateRoot,
        processExecution,
        toolchainSource,
        toolchainProvision,
        rustLowering,
        javascriptFallback,
        openxrRuntime,
        openxrInput,
        openxrRender
      })
    ]
  });

  const services = Object.freeze({
    projectSource: createProjectSourceService(config.projectSource),
    sourceFingerprint: createSourceFingerprintService(),
    dependencySource: createDependencySourceService(),
    sourceCache,
    moduleGraph: createModuleGraphService(),
    javascriptAst: createJavascriptAstService(),
    typeAnalysis: createTypeAnalysisService(),
    effectAnalysis: createEffectAnalysisService(),
    dependencyAnalysis: createDependencyAnalysisService(),
    kitIr: createKitIrService(),
    executionIr: createExecutionIrService(),
    irValidation: createIrValidationService(),
    sourceMap: createSourceMapService(),
    portabilityClassifier: createPortabilityClassifierService(),
    capabilityResolution: createCapabilityResolutionService(config.capabilities),
    fallbackSelection: createFallbackSelectionService({ quickJsAvailable: config.quickJsAvailable !== false }),
    buildRequest: createBuildRequestService({ targetSet }),
    buildPlan: createBuildPlanService(),
    buildApproval: createBuildApprovalService(),
    buildReceipt: createBuildReceiptService({ root: path.join(stateRoot, "receipts") }),
    rustLowering,
    javascriptFallback,
    webModuleLinker,
    runtimeAbi,
    nativeRuntimeLink: createNativeRuntimeLinkService(),
    toolchainSource,
    toolchainDiscovery: createToolchainDiscoveryService(config.toolchainDiscovery),
    toolchainProvision,
    isolatedStage: createIsolatedStageService({ root: path.join(stateRoot, "builds") }),
    processExecution,
    targetRegistry,
    openxrRuntime,
    openxrInput,
    openxrRender,
    artifactCache: createArtifactCacheService(),
    artifactManifest: createArtifactManifestService(),
    artifactIntegrity: createArtifactIntegrityService(),
    artifactOutput: createArtifactOutputService(),
    projectImmutability: createProjectImmutabilityService(),
    crossRuntimeParity: createCrossRuntimeParityService(),
    targetValidation: createTargetValidationService()
  });

  const build = createBuildExecutionService(services, {
    stateRoot,
    artifactRoot,
    registryHash: CORE_REGISTRY_SHA256,
    initialSnapshot: config.initialSnapshot
  });

  return Object.freeze({
    ...build,
    stateRoot,
    services
  });
}

export default createBuildDomain;
