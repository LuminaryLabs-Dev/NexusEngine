import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import {createHash} from 'node:crypto';
import {resolve, join} from 'node:path';
import {buildAuthoringCapabilityLedger} from '../src/core-domains/authoring/contracts/capabilities.js';
import { createEngine } from "nexusengine";
import {
  createAuthoringDomain,
  authoringDomainManifest,
} from "nexusengine/domains/authoring";
const digest = createHash('sha256');
function fingerprintSources(directory) {
  for (const entry of readdirSync(directory,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))) {
    const path=join(directory,entry.name);
    if(entry.isDirectory()) fingerprintSources(path);
    else if(/\.(m?js|json)$/.test(entry.name)) digest.update(path+'\0').update(readFileSync(path)).update('\0');
  }
}
fingerprintSources('src');
fingerprintSources('kits/authoring');
const option = flag => {
  const index=process.argv.indexOf(flag);
  if(index<0)return null;
  const value=process.argv[index+1];
  if(!value||value.startsWith('--'))throw Error('Missing value for '+flag);
  return value;
};
const evidencePath=option('--evidence'),output=option('--output');
if(evidencePath&&(!output||resolve(output)===resolve('docs/generated/AUTHORING-CAPABILITIES.json')))throw Error('Evidence-enriched views require a separate --output path');
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
const verifierRefs=[...new Set(value.commands.flatMap(command=>command.capabilities.flatMap(capability=>capability.verifierRefs)))].sort();
for(const ref of verifierRefs){
  if(!existsSync(ref))throw Error('Missing capability verifier: '+ref);
  digest.update(ref+'\0').update(readFileSync(ref)).update('\0');
}
const implementationIdentity='sha256:'+digest.digest('hex');
value.ledger=buildAuthoringCapabilityLedger({manifest:authoringDomainManifest,commands:value.commands,implementationIdentity,
  evidence:evidencePath?JSON.parse(readFileSync(evidencePath,'utf8')):[]});
for(const capability of value.ledger.capabilities)for(const ref of capability.verifierRefs)if(!existsSync(ref))throw Error('Missing capability verifier: '+ref);
const path = output ?? "docs/generated/AUTHORING-CAPABILITIES.json",
  text = JSON.stringify(value, null, 2) + "\n";
if (process.argv.includes("--check")) {
  if (readFileSync(path, "utf8") !== text)
    throw Error("Authoring capability inventory is stale.");
} else writeFileSync(path, text);
engine.n.authoringSequence.dispose();
console.log(
  `${process.argv.includes("--check") ? "Checked" : "Generated"} Authoring: ${value.kits.length} kits, ${value.sourceKinds.length} source kinds, ${value.commands.length} commands.`,
);
