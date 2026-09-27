import { createAuthoringIOKit } from "../../../contracts/io-kit.js";
import { installLoad } from '../../services.js';
import manifest from './kit.manifest.js';
export function createAuthoringLoadKit(config={}) { return createAuthoringIOKit(manifest, installLoad, config); }
