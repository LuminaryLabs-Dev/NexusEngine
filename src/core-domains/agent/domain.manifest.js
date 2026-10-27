import { defineCoreDomainManifest } from "../domain-manifest.js";
import { atomicKit, domainNode, manifestShell } from "../manifest-input.js";

const proof = ["tests/core-kits/core-agent-kit-smoke.mjs", "tests/core-kits/core-agent-loop-composition-smoke.mjs", "tests/core-kits/core-agent-loop-specialized-smoke.mjs", "tests/core-kits/core-agent-loop-coordination-smoke.mjs", "tests/core-kits/core-agent-loop-recovery-smoke.mjs", "tests/core-kits/core-agent-loop-canonical-completion-smoke.mjs"];

export const agentDomainManifest = defineCoreDomainManifest(manifestShell({
  root: domainNode({ id: "agent-domain", domainPath: "n:agent", label: "Agent", responsibility: "Own product-neutral observation, proposal, decision-cycle, execution receipt, and replay evidence contracts.", owns: ["agent observations", "action proposals", "decision cycles", "execution receipts"], forbiddenResponsibilities: ["model provider", "game AI policy", "LLM prompting", "host tool execution"], provides: ["n:agent", "agent:observation", "agent:proposal", "agent:execution-receipt"], proofReferences: proof }),
  subdomains: [
    domainNode({id:"agent-decision-domain",domainPath:"n:agent:decision",parentDomainPath:"n:agent",label:"Agent Decision",responsibility:"Own typed judgments, classification questions and evidence-bound proposal selections.",owns:["classification questions","typed judgments","decision history"],forbiddenResponsibilities:["provider transport","application policy","tool execution"],requires:["n:agent"],provides:["n:agent:decision"],proofReferences:proof}),
    domainNode({ id:"agent-loop-domain", domainPath:"n:agent:loop", parentDomainPath:"n:agent", label:"Agent Loop", responsibility:"Own portable agent-loop composition contracts.", owns:["loop capability contracts"], forbiddenResponsibilities:["tool dispatch","model hosting","host scheduling"], requires:["n:agent"], provides:["n:agent:loop"], proofReferences:proof }),
    domainNode({ id:"agent-loop-step-domain", domainPath:"n:agent:loop:step", parentDomainPath:"n:agent:loop", label:"Loop Step", responsibility:"Own step envelopes and immutable outcome transitions.", owns:["step identity","step transitions"], forbiddenResponsibilities:["LLM inference","tool execution"], requires:["n:agent:loop"], provides:["n:agent:loop:step"], proofReferences:proof }),
    domainNode({ id:"agent-loop-control-domain", domainPath:"n:agent:loop:control", parentDomainPath:"n:agent:loop", label:"Loop Control", responsibility:"Own per-loop lifecycle and continuation.", owns:["loop identity","continuation state"], forbiddenResponsibilities:["host execution","global scheduling"], requires:["n:agent:loop"], provides:["n:agent:loop:control"], proofReferences:proof }),
    domainNode({ id:"agent-loop-coordination-domain", domainPath:"n:agent:loop:coordination", parentDomainPath:"n:agent:loop", label:"Loop Coordination", responsibility:"Own parent-child relationships and join outcomes.", owns:["delegations","join state"], forbiddenResponsibilities:["worker scheduling","independent tool authority"], requires:["n:agent:loop"], provides:["n:agent:loop:coordination"], proofReferences:proof })
  ],
  publicEntry: { subpath: "./domains/agent", module: "./src/core-domains/agent/index.js" },
  publicEntries: [
    { domainPath:"n:agent:loop", subpath:"./domains/agent/loop", module:"./src/core-domains/agent/loop/index.js" },
    { domainPath:"n:agent:loop:step", subpath:"./domains/agent/loop/step", module:"./src/core-domains/agent/loop/step/index.js" },
    { domainPath:"n:agent:loop:control", subpath:"./domains/agent/loop/control", module:"./src/core-domains/agent/loop/control/index.js" },
    { domainPath:"n:agent:loop:coordination", subpath:"./domains/agent/loop/coordination", module:"./src/core-domains/agent/loop/coordination/index.js" }
  ],
  publicKits: [atomicKit({id:"agent-decision-kit",responsibility:"Validate and retain versioned typed judgments bound to Agent proposals and evidence.",domainPath:"n:agent:decision",apiName:"decision",requires:["n:agent"],provides:["n:agent:decision"],module:"./src/core-domains/agent/decision/index.js",exportName:"createAgentDecisionKit",publicSubpath:"./domains/agent/decision",proofReferences:proof}),atomicKit({ id: "agent-cycle-kit", responsibility: "Record observations, action proposals, decision cycles, and execution receipts.", domainPath: "n:agent", apiName: "agent", provides: ["n:agent", "agent:observation", "agent:proposal", "agent:execution-receipt"], module: "./src/core-domains/agent/kits/agent-kit/index.js", exportName: "createAgentKit", publicSubpath: "./domains/agent/cycle", proofReferences: proof })]
}));

export default agentDomainManifest;
