import { createBuildAtomicKit } from '../../../atomic-kit.js';
import manifest from './kit.manifest.js';
import { createToolchainResolutionService } from './services.js';
export * from './services.js';
export { kitManifest } from './kit.manifest.js';
export function createToolchainResolutionKit(config = {}) { return createBuildAtomicKit(manifest, createToolchainResolutionService, config); }
