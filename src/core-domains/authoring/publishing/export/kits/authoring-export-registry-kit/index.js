import { createAuthoringIOKit } from "../../../../contracts/io-kit.js";
import { installExportRegistry } from '../../services.js';
import manifest from './kit.manifest.js';
export function createAuthoringExportRegistryKit(config={}) { return createAuthoringIOKit(manifest, installExportRegistry, config); }
