import {createToolchainRegistryService} from './toolchain/kits/toolchain-registry-kit/services.js';
import {createToolchainResolutionService} from './toolchain/kits/toolchain-resolution-kit/services.js';
import {createCompilerDriverService} from './compile/kits/compiler-driver-kit/services.js';
import { homedir } from "node:os";
import path from "node:path";

import { CORE_REGISTRY_SHA256 } from "../catalog.js";
import { createArtifactCacheService } from "./artifact/kits/artifact-cache-kit/services.js";
import { createArtifactIntegrityService } from "./artifact/kits/artifact-integrity-kit/services.js";
import { createArtifactManifestService } from "./artifact/kits/artifact-manifest-kit/services.js";
import { createArtifactOutputService } from "./artifact/kits/artifact-output-kit/services.js";
import { createDependencyAnalysisService } from "./analysis/kits/dependency-analysis-kit/services.js";
import { createEffectAnalysisService } from "./analysis/kits/effect-analysis-kit/services.js";
import { createJavascriptAstService } from "./analysis/kits/javascript-ast-kit/services.js";
import { createTypeAnalysisService } from "./analysis/kits/type-analysis-kit/services.js";
import { createCapabilityResolutionService } from "./classification/kits/capability-resolution-kit/services.js";
import { createFallbackSelectionService } from "./classification/kits/fallback-selection-kit/services.js";
import { createPortabilityClassifierService } from "./classification/kits/portability-classifier-kit/services.js";
import { createJavascriptFallbackService } from "./compile/kits/javascript-fallback-kit/services.js";
import { createNativeRuntimeLinkService } from "./compile/kits/native-runtime-link-kit/services.js";
import { createRuntimeAbiService } from "./compile/kits/runtime-abi-kit/services.js";
import { createRustLoweringService } from "./compile/kits/rust-lowering-kit/services.js";
import { createWebModuleLinkerService } from "./compile/kits/web-module-linker-kit/services.js";
import { createExecutionIrService } from "./ir/kits/execution-ir-kit/services.js";
import { createIrValidationService } from "./ir/kits/ir-validation-kit/services.js";
import { createKitIrService } from "./ir/kits/kit-ir-kit/services.js";
import { createSourceMapService } from "./ir/kits/source-map-kit/services.js";
import { createBuildApprovalService } from "./orchestration/kits/build-approval-kit/services.js";
import { createBuildExecutionService } from "./orchestration/kits/build-execution-kit/services.js";
import { createBuildPlanService } from "./orchestration/kits/build-plan-kit/services.js";
import { createBuildReceiptService } from "./orchestration/kits/build-receipt-kit/services.js";
import { createBuildRequestService } from "./orchestration/kits/build-request-kit/services.js";
import { createTargetSetService } from "./orchestration/kits/target-set-kit/services.js";
import { createCrossRuntimeParityService } from "./proof/kits/cross-runtime-parity-kit/services.js";
import { createProjectImmutabilityService } from "./proof/kits/project-immutability-kit/services.js";
import { createTargetValidationService } from "./proof/kits/target-validation-kit/services.js";
import { createDependencySourceService } from "./source/kits/dependency-source-kit/services.js";
import { createModuleGraphService } from "./source/kits/module-graph-kit/services.js";
import { createProjectSourceService } from "./source/kits/project-source-kit/services.js";
import { createSourceCacheService } from "./source/kits/source-cache-kit/services.js";
import { createSourceFingerprintService } from "./source/kits/source-fingerprint-kit/services.js";
import { createAndroidXrTargetProvider } from "./target/android-xr/kits/android-xr-target-kit/services.js";
import { createOpenXrInputService } from "./target/openxr/kits/openxr-input-kit/services.js";
import { createOpenXrRenderService } from "./target/openxr/kits/openxr-render-kit/services.js";
import { createOpenXrRuntimeService } from "./target/openxr/kits/openxr-runtime-kit/services.js";
import { createPcvrTargetProvider } from "./target/pcvr/kits/pcvr-target-kit/services.js";
import { createWebLiveTargetProvider } from "./target/web-live/kits/web-live-target-kit/services.js";
import { createWebStaticTargetProvider } from "./target/web-static/kits/web-static-target-kit/services.js";
import { createTargetRegistryService } from "./target/kits/target-registry-kit/services.js";
import { createHostNativeTargetProvider } from './target/host-native/kits/host-native-target-kit/services.js';
import { createIsolatedStageService } from "./toolchain/kits/isolated-stage-kit/services.js";
import { createProcessExecutionService } from "./toolchain/kits/process-execution-kit/services.js";
import { createToolchainDiscoveryService } from "./toolchain/kits/toolchain-discovery-kit/services.js";
import { createToolchainProvisionService } from "./toolchain/kits/toolchain-provision-kit/services.js";
import { createToolchainSourceService } from "./toolchain/kits/toolchain-source-kit/services.js";

export * from "./adapters/mcp/build-mcp-provider.js";

export * from "./contracts.js";
export * from "./domain.manifest.js";

export function createBuildDomain(config = {}) {
  const stateRoot = path.resolve(config.stateRoot ?? process.env.NEXUSENGINE_HOME ?? path.join(homedir(), ".nexusengine"));
  const artifactRoot = path.resolve(config.artifactRoot ?? path.join(stateRoot, "artifacts"));
  const sourceCache = createSourceCacheService({ root: path.join(stateRoot, "sources") });
  const toolchainSource = createToolchainSourceService(config.toolchainSource);
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
  const toolchainDiscovery = createToolchainDiscoveryService(config.toolchainDiscovery);
  const toolchainRegistry=createToolchainRegistryService(config.toolchainRegistry);
  const toolchainResolution=createToolchainResolutionService({registry:toolchainRegistry,discovery:toolchainDiscovery});
  const isolatedStage=createIsolatedStageService({root:path.join(stateRoot,'builds')});
  const buildApproval=createBuildApprovalService();
  const compilerDriver=createCompilerDriverService({approval:buildApproval,resolution:toolchainResolution,drivers:config.compilerDrivers??{},processExecution,isolatedStage});
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
      createHostNativeTargetProvider({...config.targets?.hostNative,processExecution,rustLowering,runtimeAbi,toolchainDiscovery}),
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
    buildApproval,
    buildReceipt: createBuildReceiptService({ root: path.join(stateRoot, "receipts") }),
    rustLowering,
    javascriptFallback,
    webModuleLinker,
    runtimeAbi,
    nativeRuntimeLink: createNativeRuntimeLinkService(),
    toolchainSource,
    toolchainRegistry,
    toolchainResolution,
    compilerDriver,
    toolchainDiscovery,
    toolchainProvision,
    isolatedStage,
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

  if(config.initialSnapshot?.toolchainRegistry)toolchainRegistry.loadSnapshot(config.initialSnapshot.toolchainRegistry);
  const build = createBuildExecutionService(services, {
    stateRoot,
    artifactRoot,
    registryHash: CORE_REGISTRY_SHA256,
    initialSnapshot: config.initialSnapshot
  });

  return Object.freeze({
    ...build,
    snapshot:()=>({...build.snapshot(),toolchainRegistry:toolchainRegistry.getSnapshot()}),
    loadSnapshot(input){const candidate=createToolchainRegistryService();if(input?.toolchainRegistry)candidate.loadSnapshot(input.toolchainRegistry);build.loadSnapshot(input);if(input.toolchainRegistry)toolchainRegistry.loadSnapshot(input.toolchainRegistry);return {...build.snapshot(),toolchainRegistry:toolchainRegistry.getSnapshot()};},
    reset(){compilerDriver.reset();toolchainRegistry.reset();build.reset();if(config.initialSnapshot?.toolchainRegistry)toolchainRegistry.loadSnapshot(config.initialSnapshot.toolchainRegistry);return {...build.snapshot(),toolchainRegistry:toolchainRegistry.getSnapshot()};},
    async shutdown(){await Promise.all([build.shutdown(),compilerDriver.shutdown()]);},
    planProgram:input=>compilerDriver.plan(input),
    compileProgram:(id,options)=>compilerDriver.execute(id,options),
    runProgram:(id,options)=>compilerDriver.run(id,options),
    stateRoot,
    services
  });
}

export default createBuildDomain;
