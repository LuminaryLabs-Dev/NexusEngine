import { createAuthoringIOKit } from "../../../contracts/io-kit.js";
import { installImportValidation } from '../../services.js';
import manifest from './kit.manifest.js';
export function createAuthoringImportValidationKit(config={}) { return createAuthoringIOKit(manifest, installImportValidation, config); }
