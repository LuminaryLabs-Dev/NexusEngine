import { createAuthoringIOKit } from "../../../../contracts/io-kit.js";
import { installExportValidation } from '../../services.js';
import manifest from './kit.manifest.js';
export function createAuthoringExportValidationKit(config={}) { return createAuthoringIOKit(manifest, installExportValidation, config); }
