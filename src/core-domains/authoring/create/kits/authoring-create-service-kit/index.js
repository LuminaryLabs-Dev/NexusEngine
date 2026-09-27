import { createAuthoringIOKit } from "../../../contracts/io-kit.js";
import { installCreate } from '../../services.js';
import manifest from './kit.manifest.js';
export function createAuthoringCreateServiceKit(config={}) { return createAuthoringIOKit(manifest, installCreate, config); }
