export const NEXUS_BUILD_ABI_VERSION = 1;

export function createRuntimeAbiService() {
  return Object.freeze({
    describe() {
      return Object.freeze({
        schema: "nexusengine.runtime-abi/1",
        version: NEXUS_BUILD_ABI_VERSION,
        handles: "u64",
        batchEncoding: "length-prefixed-json-v1",
        operations: Object.freeze(["capability.call", "event.emit", "resource.get", "resource.set"]),
        ambientApis: Object.freeze([])
      });
    }
  });
}

export default createRuntimeAbiService;
