import { createAuthoringIOKit } from "../../../contracts/io-kit.js";
import { installSave } from '../../services.js';
import manifest from './kit.manifest.js';
export function createAuthoringSaveKit(config={}) { return createAuthoringIOKit(manifest, installSave, config); }
