import { createAuthoringIOKit } from "../../../contracts/io-kit.js";
import { installDeliveryValidation } from '../../services.js';
import manifest from './kit.manifest.js';
export function createAuthoringDeliveryValidationKit(config={}) { return createAuthoringIOKit(manifest, installDeliveryValidation, config); }
