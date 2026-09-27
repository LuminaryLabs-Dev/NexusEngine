import { createAuthoringIOKit } from "../../../contracts/io-kit.js";
import { installImport } from '../../services.js';
import manifest from './kit.manifest.js';
export function createAuthoringImportServiceKit(config={}) { return createAuthoringIOKit(manifest, installImport, config); }
