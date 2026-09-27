import { createAuthoringIOKit } from "../../../contracts/io-kit.js";
import { installDocumentValidation } from '../../services.js';
import manifest from './kit.manifest.js';
export function createAuthoringDocumentValidationKit(config={}) { return createAuthoringIOKit(manifest, installDocumentValidation, config); }
