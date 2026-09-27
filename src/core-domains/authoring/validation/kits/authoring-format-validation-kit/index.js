import { createAuthoringIOKit } from "../../../contracts/io-kit.js";
import { installFormatValidation } from '../../services.js';
import manifest from './kit.manifest.js';
export function createAuthoringFormatValidationKit(config={}) { return createAuthoringIOKit(manifest, installFormatValidation, config); }
