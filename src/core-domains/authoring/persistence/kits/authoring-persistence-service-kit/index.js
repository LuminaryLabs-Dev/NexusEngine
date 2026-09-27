import { createAuthoringIOKit } from "../../../contracts/io-kit.js";
import { installPersistence } from '../../services.js';
import manifest from './kit.manifest.js';
export function createAuthoringPersistenceServiceKit(config={}) { return createAuthoringIOKit(manifest, installPersistence, config); }
