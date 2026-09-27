import { createAuthoringIOKit } from "../../../contracts/io-kit.js";
import { installPackage } from '../../services.js';
import manifest from './kit.manifest.js';
export function createAuthoringProjectPackageKit(config={}) { return createAuthoringIOKit(manifest, installPackage, config); }
