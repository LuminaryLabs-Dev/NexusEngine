export const NEXUS_BUILD_ABI_VERSION = 1;

export function createRuntimeAbiService() {
  return Object.freeze({
    numericContract(exports) {
      const functions=exports.map(record=>({module:record.modulePath,name:record.name,symbol:record.symbol,parameters:record.parameters.map(name=>({name,type:'f64'})),returns:'f64',execution:'synchronous'}));
      const descriptor={schema:'nexusengine.numeric-runtime-abi/1',version:NEXUS_BUILD_ABI_VERSION,functions,ownership:'values-copied; no object handles',supported:['numeric-synchronous-functions'],unsupported:['native-promises','native-callbacks','native-object-handles','native-events']};
      return Object.freeze({...descriptor,contentHash:contentIntegrity(stableJson(descriptor))});
    },
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
import { contentIntegrity, stableJson } from '../../../contracts.js';
