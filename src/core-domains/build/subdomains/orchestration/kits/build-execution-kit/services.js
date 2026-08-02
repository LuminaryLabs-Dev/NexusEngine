import path from "node:path";

import {
  BUILD_RECEIPT_SCHEMA,
  BUILD_STATE_SCHEMA,
  clone,
  errorRecord
} from "../../../../contracts.js";

function publicInspection(inspection) {
  return Object.freeze({
    schema: "nexusengine.build-inspection/1",
    project: inspection.projectSource.root,
    projectSource: inspection.projectSourceService.publicRecord(inspection.projectSource),
    projectFingerprint: inspection.projectFingerprint,
    moduleGraph: inspection.moduleGraph,
    typeAnalysis: inspection.typeAnalysis,
    effects: inspection.effects,
    dependencyAnalysis: inspection.dependencyAnalysis,
    sourceRecords: inspection.sourceRecords,
    kitIr: inspection.kitIr,
    executionIr: inspection.executionIr,
    irValidation: inspection.irValidation,
    sourceMap: inspection.sourceMap,
    classification: inspection.classification,
    rustLowering: Object.freeze(Object.fromEntries(Object.entries(inspection.rustLowering).filter(([key]) => key !== "source")))
  });
}

export function createBuildExecutionService(services, config = {}) {
  const plans = new Map();
  const inMemoryReceipts = new Map();
  const initialSnapshot = config.initialSnapshot ?? null;

  async function inspectInternal(project) {
    const projectSource = await services.projectSource.read(project);
    const projectFingerprint = services.sourceFingerprint.fingerprint(projectSource);
    const parsedModules = projectSource.sourceFiles.map((file) => services.javascriptAst.parse(file));
    const effects = parsedModules.map((parsed) => services.effectAnalysis.analyze(parsed));
    const moduleGraph = await services.moduleGraph.create(projectSource, parsedModules);
    const sourceRecords = await services.dependencySource.discover(projectSource);
    const typeAnalysis = services.typeAnalysis.analyze(projectSource);
    const dependencyAnalysis = services.dependencyAnalysis.analyze(moduleGraph, sourceRecords);
    const kitIr = services.kitIr.create({
      projectFingerprint,
      parsedModules,
      effects,
      moduleGraph,
      typeAnalysis,
      dependencyAnalysis
    });
    const executionIr = services.executionIr.create(kitIr);
    const irValidation = services.irValidation.validate(kitIr, executionIr);
    const sourceMap = services.sourceMap.create(kitIr, executionIr);
    const classification = services.portabilityClassifier.classify(kitIr);
    const rustLowering = services.rustLowering.lower(executionIr, classification);
    return Object.freeze({
      projectSourceService: services.projectSource,
      projectSource,
      projectFingerprint,
      parsedModules,
      effects,
      moduleGraph,
      sourceRecords,
      typeAnalysis,
      dependencyAnalysis,
      kitIr,
      executionIr,
      irValidation,
      sourceMap,
      classification,
      rustLowering
    });
  }

  async function inspect(project) {
    return publicInspection(await inspectInternal(project));
  }

  async function plan(input = {}) {
    const request = services.buildRequest.normalize(input);
    const inspection = await inspectInternal(request.project);
    const toolchains = services.toolchainDiscovery.discover();
    const toolchainSources = services.toolchainSource.list();
    const targets = [];

    for (const target of request.targets) {
      const provider = services.targetRegistry.get(target);
      if (!provider) throw new RangeError(`Build target has no provider: ${target}.`);
      const capabilityResolution = services.capabilityResolution.resolve(inspection.classification, target);
      const executionSelection = services.fallbackSelection.select(
        inspection.classification,
        target,
        capabilityResolution,
        request.profile
      );
      const targetPlan = await provider.plan({
        ...inspection,
        request,
        capabilityResolution,
        executionSelection,
        toolchains,
        toolchainSources
      });
      targets.push(Object.freeze({
        id: target,
        provider: services.targetRegistry.list().find((record) => record.id === target),
        capabilityResolution,
        executionSelection,
        ...clone(targetPlan)
      }));
    }

    const publicPlan = services.buildPlan.create({
      request,
      projectFingerprint: inspection.projectFingerprint.contentHash,
      registryHash: config.registryHash ?? null,
      kitIrHash: inspection.kitIr.contentHash,
      executionIrHash: inspection.executionIr.contentHash,
      classificationHash: inspection.classification.contentHash,
      sourceMapHash: inspection.sourceMap.contentHash,
      sourceRecords: inspection.sourceRecords,
      sharedStages: ["source", "analysis", "ir", "classification"],
      targets
    });
    plans.set(publicPlan.id, Object.freeze({
      publicPlan,
      request,
      inspection,
      targetContexts: new Map(targets.map((target) => [target.id, Object.freeze({
        ...inspection,
        request,
        capabilityResolution: target.capabilityResolution,
        executionSelection: target.executionSelection,
        toolchains,
        toolchainSources,
        targetPlan: target
      })]))
    }));
    return publicPlan;
  }

  async function getReceipt(planId) {
    if (inMemoryReceipts.has(planId)) return clone(inMemoryReceipts.get(planId));
    const receipt = await services.buildReceipt.get(planId);
    if (receipt) inMemoryReceipts.set(planId, receipt);
    return clone(receipt);
  }

  async function apply(planId, approval, options = {}) {
    const prepared = plans.get(String(planId));
    if (!prepared) throw new RangeError(`Unknown Build plan: ${planId}. Run plan() in the current process first.`);
    if (!prepared.inspection || !prepared.targetContexts) {
      throw new Error(`Build plan ${planId} was restored for inspection only; recompute it before apply.`);
    }
    services.buildApproval.requireApproval(prepared.publicPlan.id, approval);
    const existing = await getReceipt(prepared.publicPlan.id);
    if (existing?.status === "succeeded") {
      return Object.freeze({ ...existing, noOp: true });
    }

    const beforeSource = await services.projectSource.read(prepared.request.project);
    const before = services.sourceFingerprint.fingerprint(beforeSource);
    if (before.contentHash !== prepared.publicPlan.projectFingerprint) {
      throw new Error(`Project changed after Build plan review: expected ${prepared.publicPlan.projectFingerprint}, received ${before.contentHash}.`);
    }

    const outputRoot = options.out
      ? path.resolve(options.out)
      : path.join(config.artifactRoot, path.basename(prepared.request.project));
    const targetReceipts = [];

    for (const target of prepared.publicPlan.targets) {
      const provider = services.targetRegistry.get(target.id);
      const context = prepared.targetContexts.get(target.id);
      const stage = await services.isolatedStage.create(prepared.request.project, prepared.publicPlan.id, target.id);
      const cached = await services.artifactCache.read(stage);
      if (cached?.status === "succeeded" && cached.planId === prepared.publicPlan.id) {
        targetReceipts.push(Object.freeze({ ...cached, cached: true }));
        continue;
      }
      if (target.status !== "ready") {
        targetReceipts.push(Object.freeze({
          schema: "nexusengine.build-target-receipt/1",
          planId: prepared.publicPlan.id,
          target: target.id,
          status: "blocked",
          cached: false,
          requirements: clone(target.requirements ?? target.errors ?? [target.executionSelection])
        }));
        continue;
      }
      try {
        const result = await provider.execute({
          ...context,
          plan: prepared.publicPlan,
          stage
        });
        if (!result?.ok) throw new Error(result?.error ?? `${target.id} target execution failed.`);
        const manifest = await services.artifactManifest.create({
          root: stage,
          target: target.id,
          planId: prepared.publicPlan.id,
          metadata: result
        });
        const integrity = await services.artifactIntegrity.verify(stage, manifest);
        if (!integrity.ok) throw new Error(`${target.id} artifact failed integrity validation.`);
        const validation = await services.targetValidation.validate(provider, {
          ...context,
          plan: prepared.publicPlan,
          stage,
          manifest,
          result
        });
        if (!validation.ok) throw new Error(`${target.id} target validation failed.`);
        const destination = await services.artifactOutput.publish({
          projectRoot: prepared.request.project,
          stage,
          outputRoot,
          target: target.id,
          planId: prepared.publicPlan.id,
          manifest
        });
        const targetReceipt = Object.freeze({
          schema: "nexusengine.build-target-receipt/1",
          planId: prepared.publicPlan.id,
          target: target.id,
          status: "succeeded",
          cached: false,
          artifact: manifest,
          destination,
          validation
        });
        await services.artifactCache.write(stage, targetReceipt);
        targetReceipts.push(targetReceipt);
      } catch (error) {
        targetReceipts.push(Object.freeze({
          schema: "nexusengine.build-target-receipt/1",
          planId: prepared.publicPlan.id,
          target: target.id,
          status: "failed",
          cached: false,
          error: errorRecord(error, `target:${target.id}`)
        }));
      }
    }

    const afterSource = await services.projectSource.read(prepared.request.project);
    const after = services.sourceFingerprint.fingerprint(afterSource);
    const immutability = services.projectImmutability.compare(before, after);
    if (!immutability.ok) {
      throw new Error(`Build mutated the source project: ${immutability.changes.map((change) => change.path).join(", ")}.`);
    }
    const succeeded = targetReceipts.every((receipt) => receipt.status === "succeeded");
    const receipt = Object.freeze({
      schema: BUILD_RECEIPT_SCHEMA,
      planId: prepared.publicPlan.id,
      status: succeeded ? "succeeded" : "failed",
      noOp: false,
      project: prepared.request.project,
      projectFingerprint: before.contentHash,
      targets: Object.freeze(targetReceipts),
      immutability,
      sequence: Number(existing?.sequence ?? 0) + 1
    });
    await services.buildReceipt.put(receipt);
    inMemoryReceipts.set(receipt.planId, receipt);
    return receipt;
  }

  function snapshot() {
    return Object.freeze({
      schema: BUILD_STATE_SCHEMA,
      plans: Object.freeze([...plans.values()].map((entry) => clone(entry.publicPlan)).sort((left, right) => left.id.localeCompare(right.id))),
      receipts: Object.freeze([...inMemoryReceipts.values()].map(clone).sort((left, right) => left.planId.localeCompare(right.planId)))
    });
  }

  function loadSnapshot(input) {
    if (input?.schema !== BUILD_STATE_SCHEMA) throw new TypeError("Unsupported Build snapshot.");
    plans.clear();
    for (const publicPlan of input.plans ?? []) {
      plans.set(publicPlan.id, Object.freeze({ publicPlan: Object.freeze(clone(publicPlan)), restored: true }));
    }
    inMemoryReceipts.clear();
    for (const receipt of input.receipts ?? []) inMemoryReceipts.set(receipt.planId, Object.freeze(clone(receipt)));
    return snapshot();
  }

  if (initialSnapshot) loadSnapshot(initialSnapshot);

  return Object.freeze({
    listTargets: services.targetRegistry.list,
    inspect,
    plan,
    apply,
    getReceipt,
    snapshot,
    loadSnapshot,
    reset() {
      plans.clear();
      inMemoryReceipts.clear();
      services.targetRegistry.reset();
      if (initialSnapshot) loadSnapshot(initialSnapshot);
      return snapshot();
    }
  });
}

export default createBuildExecutionService;
