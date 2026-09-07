import { readFileSync, writeFileSync } from "node:fs";
import { createEngine } from "nexusengine";
import {
  createAuthoringDomain,
  authoringDomainManifest,
} from "nexusengine/domains/authoring";
const engine = createEngine({ kits: createAuthoringDomain() }),
  project = engine.n.authoringProject;
const value = {
  schema: "nexusengine.authoring-capabilities/1",
  domainPath: "n:authoring",
  guide: "AUTHORING.md",
  sourceKinds: project.kinds(),
  kits: authoringDomainManifest.publicKits.map((k) => ({
    id: k.id,
    domainPath: k.domainPath,
    apiName: k.apiName,
    source: k.source ?? null,
    proofReferences: k.proof.references,
    declaredProofStatus: k.proof.status,
  })),
  commands: project.tools(),
};
const path = "docs/generated/AUTHORING-CAPABILITIES.json",
  text = JSON.stringify(value, null, 2) + "\n";
if (process.argv.includes("--check")) {
  if (readFileSync(path, "utf8") !== text)
    throw Error("Authoring capability inventory is stale.");
} else writeFileSync(path, text);
engine.n.authoringSequence.dispose();
console.log(
  `${process.argv.includes("--check") ? "Checked" : "Generated"} Authoring: ${value.kits.length} kits, ${value.sourceKinds.length} source kinds, ${value.commands.length} commands.`,
);
