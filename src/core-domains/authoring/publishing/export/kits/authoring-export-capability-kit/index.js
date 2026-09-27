import { createAuthoringIOKit } from "../../../../contracts/io-kit.js";
import { installExportCapability } from '../../services.js';
import manifest from './kit.manifest.js';
export function createAuthoringExportCapabilityKit(config={}) { return createAuthoringIOKit(manifest, installExportCapability, config); }
