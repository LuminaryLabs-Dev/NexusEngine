import assert from "node:assert/strict";
import { authoringDomainManifest } from "nexusengine/domains/authoring";
import {
  createAuthoringAgentGuidance,
  reviewAuthoringAgentEvidence,
} from "nexusengine/domains/authoring/agent";
import { runAssignedWorker } from "nexusengine/kits/agent/loop-host";

for (const { id, source } of authoringDomainManifest.publicKits) {
  const entry = await import(`nexusengine/${source.publicSubpath.slice(2)}`);
  assert.equal(typeof entry[source.exportName], "function", id);
  assert.equal(entry[source.exportName]().id, id);
}
assert.equal(typeof createAuthoringAgentGuidance, "function");
assert.equal(typeof reviewAuthoringAgentEvidence, "function");
assert.equal(typeof runAssignedWorker, "function");
console.log("All Authoring factory imports, Agent helpers, and the Worker entry loaded.");
