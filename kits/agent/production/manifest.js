export const productionProviderManifest = Object.freeze({
 id:"agent-production-provider", version:"0.4.0", kind:"optional-host-provider",
 publicEntry:"nexusengine/kits/agent/production",
 owns:["workspace binding","durable production receipts","host orchestration","inspection provider"],
 domainOwners:["n:agent","n:authoring","n:runtime","n:composition","n:asset","n:build","n:mcp"],
 requiresHost:["node-filesystem"], optionalHost:["playwright","three"],
 coreDefaultImport:false
});
