import { createAuthoringIOKit } from "../../../contracts/io-kit.js";
import { installStorageRegistry } from '../../services.js';
import manifest from './kit.manifest.js';
export function createAuthoringStorageProviderRegistryKit(config={}) { return createAuthoringIOKit(manifest, installStorageRegistry, config); }
