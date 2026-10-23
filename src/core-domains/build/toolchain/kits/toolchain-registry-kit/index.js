import { createBuildAtomicKit } from '../../../atomic-kit.js';
import manifest from './kit.manifest.js';
import { createToolchainRegistryService } from './services.js';
export * from './services.js';
export { kitManifest } from './kit.manifest.js';
export function createToolchainRegistryKit(config = {}) { return createBuildAtomicKit(manifest, createToolchainRegistryService, config); }
