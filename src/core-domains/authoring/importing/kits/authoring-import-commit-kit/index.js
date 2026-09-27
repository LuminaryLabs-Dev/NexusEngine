import { createAuthoringIOKit } from "../../../contracts/io-kit.js";
import { installImportCommit } from '../../services.js';
import manifest from './kit.manifest.js';
export function createAuthoringImportCommitKit(config={}) { return createAuthoringIOKit(manifest, installImportCommit, config); }
