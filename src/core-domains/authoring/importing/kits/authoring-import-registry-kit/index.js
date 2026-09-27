import { createAuthoringIOKit } from "../../../contracts/io-kit.js";
import { installImportRegistry } from '../../services.js';
import manifest from './kit.manifest.js';
export function createAuthoringImportRegistryKit(config={}) { return createAuthoringIOKit(manifest, installImportRegistry, config); }
