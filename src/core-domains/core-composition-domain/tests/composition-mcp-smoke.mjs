import assert from "node:assert/strict";
import { createEngine } from "../../../engine.js";
import { createCoreMcpDomain } from "../../core-mcp-domain/index.js";
import {
  createCoreObjectKit,
  createObjectPlacementKit
} from "../../core-object-domain/index.js";
import {
  createCompositionApplyController,
  createCompositionMcpProvider,
  createCoreCompositionDomain
} from "../index.js";

const controlEngine = createEngine({
  kits: [
    ...createCoreCompositionDomain(),
    ...createCoreMcpDomain()
  ]
});
const factories = new Map([
  ["n-core-object-kit", createCoreObjectKit],
  ["n-core-object-placement-kit", createObjectPlacementKit]
]);
let applyCount = 0;
let activeRuntime = null;

const host = {
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
        executableFingerprint: `${kit.source.contentHash}:${kit.source.exportName}`
      })),
      staged: { factories }
    };
  },
  apply({ prepared, staged }) {
    applyCount += 1;
    activeRuntime = createEngine({
      kits: prepared.kits.map((kit) => staged.factories.get(kit.kitId)(kit.config))
    });
    const object = activeRuntime.n.coreObject.register({
      id: "composition-crate",
      objectType: "fixture",
      bounds: { min: [-1, 0, -1], max: [1, 2, 1] },
      pivot: [0, 1, 0],
      groundAnchor: [0, 0, 0]
    });
    const placement = activeRuntime.n.objectPlacement.create({
      id: "composition-crate-placement",
      objectId: object.id
    });
    return {
      ok: true,
      appliedAt: "2026-07-29T00:00:00.000Z",
      receipt: {
        objectId: object.id,
        placementId: placement.id,
        installOrder: prepared.kits.map(({ kitId }) => kitId)
      }
    };
  }
};

const controller = createCompositionApplyController({
  composition: controlEngine.n.coreComposition,
  host
});
const provider = createCompositionMcpProvider({
  composition: controlEngine.n.coreComposition,
  controller
});
controlEngine.n.coreMcp.registerProvider(provider);

const domains = (await controlEngine.n.coreMcp.callTool("domains_list")).structuredContent.domains;
assert.ok(domains.some(({ id }) => id === "core-object-domain"));
const placementDomain = (await controlEngine.n.coreMcp.callTool("domain_get", {
  id: "domain-object-placement"
})).structuredContent.domain;
assert.equal(placementDomain.domainPath, "n:object:placement");
const placementKits = (await controlEngine.n.coreMcp.callTool("kits_list", {
  domainId: "domain-object-placement"
})).structuredContent.kits;
assert.deepEqual(placementKits.map(({ id }) => id), ["n-core-object-placement-kit"]);
const explanation = (await controlEngine.n.coreMcp.callTool("kit_explain", {
  id: "n-core-object-placement-kit"
})).structuredContent.explanation;
assert.ok(explanation.dependencies.some(({ token }) => token === "n:object"));

const request = { kits: ["n-core-object-placement-kit"] };
const prepared = (await controlEngine.n.coreMcp.callTool(
  "composition_plan",
  request
)).structuredContent;
assert.equal(prepared.ok, true);
assert.deepEqual(
  prepared.kits.map(({ kitId }) => kitId),
  ["n-core-object-kit", "n-core-object-placement-kit"]
);

await assert.rejects(
  controlEngine.n.coreMcp.callTool("composition_apply", {
    ...request,
    expectedPlanId: prepared.planId
  }),
  /requires explicit authorization/
);
const receipt = (await controlEngine.n.coreMcp.callTool("composition_apply", {
  ...request,
  expectedPlanId: prepared.planId
}, {
  authorize: () => true
})).structuredContent;
const replayedReceipt = (await controlEngine.n.coreMcp.callTool("composition_apply", {
  ...request,
  expectedPlanId: prepared.planId
}, {
  authorize: () => true
})).structuredContent;
assert.deepEqual(replayedReceipt, receipt, "replaying a reviewed plan returns the original receipt");
assert.equal(applyCount, 1, "replaying a plan must not invoke the host twice");
assert.equal(activeRuntime.n.objectPlacement.get("composition-crate-placement").objectId, "composition-crate");

const conflictingRequest = {
  kits: ["n-core-object-placement-kit"],
  configs: {
    "n-core-object-placement-kit": {
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

const restartedController = createCompositionApplyController({
  composition: controlEngine.n.coreComposition,
  host,
  initialSnapshot: controller.getSnapshot()
});
assert.deepEqual(
  await restartedController.apply(request, { expectedPlanId: prepared.planId }),
  receipt,
  "loaded receipt state preserves exactly-once behavior across restart"
);
assert.equal(applyCount, 1);

assert.equal(controlEngine.n.coreMcp.removeProvider(provider.id), true);
const frameBeforeDisconnect = activeRuntime.clock.frame;
activeRuntime.tick(1 / 60);
assert.equal(activeRuntime.clock.frame, frameBeforeDisconnect + 1, "runtime continues after MCP provider disconnect");

console.log("Core Composition MCP exactly-once smoke ok");
