import { createAuthoringIOKit } from "../../../../contracts/io-kit.js";
import { installExport } from '../../services.js';
import manifest from './kit.manifest.js';
export function createAuthoringExportServiceKit(config={}) { return createAuthoringIOKit(manifest, installExport, config); }
