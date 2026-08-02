import { contentIntegrity, requireText } from "../../../../contracts.js";

export function createToolchainProvisionService(config = {}) {
  const cache = config.cache;
  if (!cache) throw new TypeError("Toolchain provision service requires a source cache.");

  return Object.freeze({
    async provision(record, options = {}) {
      if (record.resolutionStatus === "resolved" && record.integrity && await cache.has(record.integrity)) {
        return Object.freeze({ status: "cached", record, path: cache.root });
      }
      if (options.allowNetwork !== true) {
        return Object.freeze({ status: "approval-required", record, reason: "network-provisioning-disabled" });
      }
      if (!record.license || !(options.acceptedLicenses ?? []).includes(record.license)) {
        return Object.freeze({ status: "license-approval-required", record, license: record.license });
      }
      if (typeof config.fetchSource !== "function") {
        return Object.freeze({ status: "provider-required", record, reason: "no-canonical-source-fetcher" });
      }
      const result = await config.fetchSource(record, options);
      const bytes = result?.bytes;
      if (!(bytes instanceof Uint8Array)) throw new TypeError(`Source provider returned no bytes for ${record.id}.`);
      const actualIntegrity = contentIntegrity(bytes);
      const expectedIntegrity = requireText(result.integrity ?? record.integrity, `Resolved ${record.id} integrity`);
      if (actualIntegrity !== expectedIntegrity) throw new Error(`Resolved source integrity mismatch for ${record.id}.`);
      const cached = await cache.put(bytes, expectedIntegrity);
      return Object.freeze({ status: "provisioned", record: { ...record, integrity: expectedIntegrity, resolutionStatus: "resolved" }, path: cached.path });
    }
  });
}

export default createToolchainProvisionService;
