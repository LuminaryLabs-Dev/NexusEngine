import { graphicsLanguageManifest } from './render/graphics-language-kit/manifest.js';
export const OPTIONAL_KIT_CATALOG = Object.freeze([graphicsLanguageManifest]);
export async function installOptionalKit(engine, id, options = {}) {
  if (id !== graphicsLanguageManifest.id) throw Error(`Unknown optional kit: ${id}`);
  const { installGraphicsLanguage } = await import('./render/graphics-language-kit/index.js');
  const api = installGraphicsLanguage(engine, options);
  await api.ready;
  return api;
}
