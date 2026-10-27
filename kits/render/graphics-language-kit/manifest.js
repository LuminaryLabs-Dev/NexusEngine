import { GRAPHICS_KIT_ID, GRAPHICS_LANGUAGE_SCHEMA, CAPABILITIES } from './contracts.js';
export const graphicsLanguageManifest = Object.freeze({
  id: GRAPHICS_KIT_ID,
  version: '2',
  domainPath: 'n:render',
  optional: true,
  publicSubpath: 'nexusengine/domains/render/graphics-language',
  source: 'kits/render/graphics-language-kit/index.js',
  schema: GRAPHICS_LANGUAGE_SCHEMA,
  requires: ['render:provider-contract', 'render:pass-schema', 'render:resource-identity', 'render:installation', 'render:startup', 'render:shutdown'],
  provides: ['render:graphics-language'],
  capabilities: CAPABILITIES,
  ownership: { core: 'Portable Render lifecycle status', kit: 'Resident CPU execution, bounded shadow/frame caches, host pacing and presentation adapters', application: 'Scene and gameplay state' },
  proof: ['kits/render/graphics-language-kit/tests/contract.mjs', 'kits/render/graphics-language-kit/tests/incremental.mjs', 'kits/render/graphics-language-kit/tests/frame-ownership.mjs', 'kits/render/graphics-language-kit/tests/pacing.mjs', 'kits/render/graphics-language-kit/tests/artifacts.mjs', 'kits/render/graphics-language-kit/tests/handover.mjs', 'kits/render/graphics-language-kit/tests/normals.mjs', 'kits/render/graphics-language-kit/tests/browser.mjs', 'kits/render/graphics-language-kit/tests/native-window.mjs']
});
export default graphicsLanguageManifest;
