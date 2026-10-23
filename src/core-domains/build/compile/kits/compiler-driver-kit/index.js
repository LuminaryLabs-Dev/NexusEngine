import { createBuildAtomicKit } from '../../../atomic-kit.js';
import manifest from './kit.manifest.js';
import { createCompilerDriverService } from './services.js';
export * from './services.js';
export { kitManifest } from './kit.manifest.js';
export function createCompilerDriverKit(config = {}) { return createBuildAtomicKit(manifest, createCompilerDriverService, config); }
