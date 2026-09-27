import { createAuthoringIOKit } from "../../../contracts/io-kit.js";
import { installProjectValidation } from '../../services.js';
import manifest from './kit.manifest.js';
export function createAuthoringProjectValidationKit(config={}) { return createAuthoringIOKit(manifest, installProjectValidation, config); }
