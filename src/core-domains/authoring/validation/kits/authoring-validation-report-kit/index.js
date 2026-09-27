import { createAuthoringIOKit } from "../../../contracts/io-kit.js";
import { installValidationReport } from '../../services.js';
import manifest from './kit.manifest.js';
export function createAuthoringValidationReportKit(config={}) { return createAuthoringIOKit(manifest, installValidationReport, config); }
