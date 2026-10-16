import {createCamelRuntimeKit} from './kits/runtime-kit/index.js';
export {createCamelRuntimeKit} from './kits/runtime-kit/index.js';
export {createCamelRuntime} from './execution/runtime.js';
export function createCamelDomain(config={}){return [createCamelRuntimeKit(config)];}
export default createCamelDomain;
