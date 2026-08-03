import assert from "node:assert/strict";
import { createEngine } from "../../../engine.js";
import { createMcpDomain } from "../../mcp/index.js";
import {
  createObjectRegistryKit,
  createObjectPlacementKit
} from "../../object/index.js";
import {
  COMPOSITION_REGISTRY_SCHEMA,
  createCompositionApplyController,
  createCompositionMcpProvider,
  createCompositionDomain
} from "../index.js";

const controlEngine = createEngine({
  kits: [
    ...createCompositionDomain(),
    ...createMcpDomain()
  ]
});
const factories = new Map([
  ["object-registry-kit", createObjectRegistryKit],
  ["object-placement-kit", createObjectPlacementKit]
]);
let applyCount = 0;
let activeRuntime = null;
let failNextApply = false;
let persistedState = null;

const host = {
  captureSnapshot() {
    return { applyCount, activeRuntime };
  },
  restoreSnapshot(snapshot) {
    applyCount = snapshot.applyCount;
    activeRuntime = snapshot.activeRuntime;
    return { restored: true };
  },
  preflight({ kits }) {
    for (const kit of kits) {
      if (!factories.has(kit.kitId)) {
        return { ok: false, error: `No trusted factory for ${kit.kitId}.` };
      }
    }
    return {
      ok: true,
      resolvedKits: kits.map((kit) => ({
        kitId: kit.kitId,
        executableFingerprint: `${kit.source.sourceCommit}:${kit.source.integrity}:${kit.source.subpath}:${kit.source.exportName}`
      })),
      staged: { factories }
    };
  },
  apply({ prepared, staged }) {
    applyCount += 1;
    activeRuntime = createEngine({
      kits: prepared.kits.map((kit) => staged.factories.get(kit.kitId)(kit.config))
    });
    if (failNextApply) {
      failNextApply = false;
      throw new Error("fixture apply failure after mutation");
    }
    const object = activeRuntime.n.object.register({
      id: "composition-crate",
      objectType: "fixture",
      bounds: { min: [-1, 0, -1], max: [1, 2, 1] },
      pivot: [0, 1, 0],
      groundAnchor: [0, 0, 0]
    });
    const placement = activeRuntime.n.objectPlacement?.create({
      id: "composition-crate-placement",
      objectId: object.id
    }) ?? null;
    return {
      ok: true,
      appliedAt: "2026-07-29T00:00:00.000Z",
      receipt: {
        objectId: object.id,
        placementId: placement?.id ?? null,
        installOrder: prepared.kits.map(({ kitId }) => kitId)
      }
    };
  }
};

const controller = createCompositionApplyController({
  composition: controlEngine.n.composition,
  host,
  persist(snapshot) {
    persistedState = snapshot;
  }
});
const provider = createCompositionMcpProvider({
  composition: controlEngine.n.composition,
  controller,
  guideChapters: [{
    id: "start-here",
    title: "Start Here",
    contentHash: "sha256:fixture",
    markdown: "# Start Here\n\nUse the semantic Domain catalog.\n"
  }]
});
controlEngine.n.mcp.registerProvider(provider);

const domains = (await controlEngine.n.mcp.callTool("domains_list")).structuredContent.domains;
assert.ok(domains.some(({ id }) => id === "object-domain"));
const placementDomain = (await controlEngine.n.mcp.callTool("domain_get", {
  id: "object-placement-domain"
})).structuredContent.domain;
assert.equal(placementDomain.domainPath, "n:object:placement");
const placementKits = (await controlEngine.n.mcp.callTool("kits_list", {
  domainId: "object-placement-domain"
})).structuredContent.kits;
assert.deepEqual(placementKits.map(({ id }) => id), ["object-placement-kit"]);
const explanation = (await controlEngine.n.mcp.callTool("kit_explain", {
  id: "object-placement-kit"
})).structuredContent.explanation;
assert.ok(explanation.dependencies.some(({ token }) => token === "object:descriptor-contract"));

const atomPage = (await controlEngine.n.mcp.callTool("atoms_list", {
  domainPath: "n:object",
  limit: 1
})).structuredContent;
assert.equal(atomPage.atoms.length, 1);
assert.equal(atomPage.total >= 2, true);
assert.equal(typeof atomPage.nextCursor, "string");
const nextAtomPage = (await controlEngine.n.mcp.callTool("atoms_list", {
  domainPath: "n:object",
  cursor: atomPage.nextCursor,
  limit: 100
})).structuredContent;
assert.equal(nextAtomPage.atoms.some(({ id }) => id === atomPage.atoms[0].id), false);
const placementAtom = (await controlEngine.n.mcp.callTool("atom_get", {
  id: "object-placement-kit"
})).structuredContent;
assert.equal(placementAtom.atom.domainPath, "n:object:placement");

controlEngine.n.composition.registry.registerRecipe({
  id: "object-placement-recipe",
  label: "Object Placement",
  kits: ["object-placement-kit"],
  domains: []
});
const recipes = (await controlEngine.n.mcp.callTool("recipes_list", { limit: 10 })).structuredContent;
assert.deepEqual(recipes.recipes.map(({ id }) => id), [
  "hazard-pursuit",
  "management-operations",
  "object-placement-recipe",
  "procedural-navigation",
  "spatial-guidance",
  "terrain-character-traversal",
  "vehicle-rescue-logistics"
]);
assert.equal(
  (await controlEngine.n.mcp.callTool("recipe_get", { id: "object-placement-recipe" }))
    .structuredContent.recipe.kits[0],
  "object-placement-kit"
);
const sources = (await controlEngine.n.mcp.callTool("registry_sources_list", { limit: 10 }))
  .structuredContent;
assert.equal(sources.sources.some(({ registryId }) => registryId === "nexusengine-core"), true);

const validation = (await controlEngine.n.mcp.callTool("composition_validate", {
  recipes: ["object-placement-recipe"]
})).structuredContent;
assert.equal(validation.ok, true);
assert.equal(validation.validation.order.includes("object-placement-kit"), true);

await assert.rejects(
  controlEngine.n.mcp.callTool("composition_validate", { bundles: ["retired"] }),
  /not allowed/
);

const request = { kits: ["object-placement-kit"] };
const prepared = (await controlEngine.n.mcp.callTool(
  "composition_plan",
  request
)).structuredContent;
assert.equal(prepared.ok, true);
assert.deepEqual(
  prepared.kits.map(({ kitId }) => kitId),
  ["object-registry-kit", "object-placement-kit"]
);

await assert.rejects(
  controlEngine.n.mcp.callTool("composition_apply", {
    ...request,
    expectedPlanId: prepared.planId
  }),
  /requires explicit authorization/
);
const receipt = (await controlEngine.n.mcp.callTool("composition_apply", {
  ...request,
  expectedPlanId: prepared.planId
}, {
  authorize: () => true
})).structuredContent;
const replayedReceipt = (await controlEngine.n.mcp.callTool("composition_apply", {
  ...request,
  expectedPlanId: prepared.planId
}, {
  authorize: () => true
})).structuredContent;
assert.deepEqual(replayedReceipt, receipt, "replaying a reviewed plan returns the original receipt");
assert.equal(applyCount, 1, "replaying a plan must not invoke the host twice");
assert.equal(activeRuntime.n.objectPlacement.get("composition-crate-placement").objectId, "composition-crate");
assert.deepEqual(persistedState, controller.getSnapshot(), "successful apply persists the receipt state");
assert.equal(receipt.registryContentHash, prepared.registryContentHash);
assert.ok(receipt.capabilityChanges.provides.includes("n:object:placement"));

const conflictingRequest = {
  kits: ["object-placement-kit"],
  configs: {
    "object-placement-kit": {
      defaults: { overlapTolerance: 0.5 }
    }
  }
};
const conflictingPlan = await controller.prepare(conflictingRequest);
await assert.rejects(
  controller.apply(conflictingRequest, { expectedPlanId: conflictingPlan.planId }),
  /fingerprint conflicts/
);
assert.equal(applyCount, 1, "fingerprint conflicts must fail before host mutation");

const rollbackRequest = { kits: ["object-registry-kit"] };
const rollbackPlan = await controller.prepare(rollbackRequest);
const runtimeBeforeFailedApply = activeRuntime;
failNextApply = true;
await assert.rejects(
  controller.apply(rollbackRequest, { expectedPlanId: rollbackPlan.planId }),
  /fixture apply failure/
);
assert.equal(applyCount, 1, "failed host mutation restores the host snapshot");
assert.equal(activeRuntime, runtimeBeforeFailedApply, "failed host mutation restores the prior runtime");
assert.equal(controller.getReceipt(rollbackPlan.planId), null, "failed apply stores no receipt");

controlEngine.n.composition.registry.registerRegistry({
  schema: COMPOSITION_REGISTRY_SCHEMA,
  revision: 1,
  registryId: "fixture-metadata-registry",
  sources: [{
    registryId: "fixture-metadata-registry",
    package: "@fixture/uninstalled-kit",
    version: "1.2.3",
    sourceCommit: "a".repeat(40),
    integrity: `sha256:${"b".repeat(64)}`,
    status: "metadata-only",
    environments: ["node"],
    permissions: []
  }],
  domains: [],
  kits: [{
    id: "uninstalled-fixture-kit",
    version: "1.2.3",
    domainPath: "n:object",
    requires: [],
    provides: ["fixture:uninstalled"],
    source: {
      registryId: "fixture-metadata-registry",
      installable: false,
      environments: [],
      permissions: []
    }
  }],
  recipes: []
});
const missingPackagePlan = (await controlEngine.n.mcp.callTool("composition_plan", {
  kits: ["uninstalled-fixture-kit"]
})).structuredContent;
assert.equal(missingPackagePlan.ok, false);
assert.equal(missingPackagePlan.installReceipt.status, "installation-required");
assert.deepEqual(missingPackagePlan.installReceipt.packages[0], {
  kitId: "uninstalled-fixture-kit",
  package: "@fixture/uninstalled-kit",
  version: "1.2.3",
  subpath: null,
  exportName: null,
  sourceCommit: "a".repeat(40),
  integrity: `sha256:${"b".repeat(64)}`
});
assert.equal(applyCount, 1, "missing packages return a receipt before host mutation");

const restartedController = createCompositionApplyController({
  composition: controlEngine.n.composition,
  host,
  initialSnapshot: controller.getSnapshot()
});
assert.deepEqual(
  await restartedController.apply(request, { expectedPlanId: prepared.planId }),
  receipt,
  "loaded receipt state preserves exactly-once behavior across restart"
);
assert.equal(applyCount, 1);

assert.deepEqual(
  controlEngine.n.mcp.listPrompts().map(({ name }) => name),
  ["inspect-and-plan", "review-and-apply"]
);
assert.match(
  (await controlEngine.n.mcp.getPrompt("review-and-apply", {
    expectedPlanId: prepared.planId
  })).messages[0].content.text,
  new RegExp(prepared.planId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
);
const atomResource = JSON.parse(
  (await controlEngine.n.mcp.readResource("nexus-composition://registry/atoms/object-placement-kit"))
    .contents[0].text
);
assert.equal(atomResource.id, "object-placement-kit");
assert.match(
  (await controlEngine.n.mcp.readResource("nexus-guide://chapters/start-here")).contents[0].text,
  /semantic Domain catalog/
);

assert.equal(controlEngine.n.mcp.removeProvider(provider.id), true);
const frameBeforeDisconnect = activeRuntime.clock.frame;
activeRuntime.tick(1 / 60);
assert.equal(activeRuntime.clock.frame, frameBeforeDisconnect + 1, "runtime continues after MCP provider disconnect");

console.log("Core Composition MCP exactly-once smoke ok");
