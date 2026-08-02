import { createDomainKit } from "../domain-kit.js";

function domainSlug(domainPath) {
  return String(domainPath).split(":").slice(1).join("-");
}

export function createBuildAtomicKit(manifest, createServices, config = {}) {
  if (!manifest?.id || !manifest?.domainPath) {
    throw new TypeError("Build atomic Kit requires its manifest.");
  }
  return createDomainKit({
    manifestId: manifest.id,
    id: manifest.id,
    domain: domainSlug(manifest.domainPath),
    domainPath: manifest.domainPath,
    parentDomainPath: manifest.parentDomainPath ?? undefined,
    apiName: manifest.apiName,
    purpose: manifest.responsibility,
    owns: [manifest.responsibility],
    doesNotOwn: ["application runtime execution", "project source mutation"],
    initialState: {
      installed: true,
      serviceId: manifest.id
    },
    createApi(context) {
      return typeof createServices === "function" ? createServices(config, context) : {};
    },
    metadata: {
      buildTimeOnly: true,
      runtimeComposition: false,
      atomicManifest: manifest,
      ...(config.metadata ?? {})
    }
  });
}
