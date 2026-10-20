import { defineDomainServiceKit } from 'nexusengine/domain-service-kit';
import { sha256Integrity } from 'nexusengine/foundation';
import { createRenderContractsDomain } from 'nexusengine/domains/render/contracts';
import { createRenderLifecycleDomain } from 'nexusengine/domains/render/lifecycle';
import { createRenderDeviceContractKit } from 'nexusengine/domains/render/device/contract';
import { createRenderResourceContractKit, createResourceIdentityKit } from 'nexusengine/domains/render/resource';
import { createGraphicsSession } from './session.js';
import { createCanvasHost, createNativeWindowHost } from './hosts.js';
import { graphicsLanguageManifest } from './manifest.js';
import { record } from './contracts.js';

export { graphicsLanguageManifest } from './manifest.js';
export { CAPABILITIES, GRAPHICS_LANGUAGE_SCHEMA, normalizeResource, normalizeFrame, normalizeDraw, graphicsResourceDescriptor, graphicsFrameDescriptor } from './contracts.js';
export { createNexusGLProvider } from './provider.js';
export { createFrameHost, createCanvasHost, createNativeWindowHost } from './hosts.js';
export { materialResource } from './material.js';

const installed = new WeakMap();
const optionIdentities = new WeakMap();
let optionSerial = 0;
function configurationFingerprint(options) {
  return sha256Integrity(JSON.stringify(Object.entries(options).sort(([a],[b])=>a.localeCompare(b)).map(([key,value])=>{
    if (value && (typeof value === 'object' || typeof value === 'function')) {
      if (!optionIdentities.has(value)) optionIdentities.set(value,++optionSerial);
      value = { reference: optionIdentities.get(value) };
    }
    return [key,value];
  })));
}
function sameOptions(a, b) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].every(k => Object.is(a[k], b[k]));
}
export function createGraphicsLanguageKit(config = {}) {
  record(config,['host','canvas','nativeWindow','surfaceOptions','surfaceId','selection','backend','memoryBudgetBytes','maxResourceBytes','maxFragments','handoverBudgetBytes','handoverTimeoutMs','xr'],'Graphics Language Kit options');
  const options = { ...config };
  return defineDomainServiceKit({
    id: graphicsLanguageManifest.id,
    domain: 'graphics-language', domainPath: 'n:render:graphics-language', parentDomainPath: 'n:render',
    apiName: 'graphicsLanguage', version: '1', stability: 'experimental',
    requires: graphicsLanguageManifest.requires, provides: graphicsLanguageManifest.provides,
    serializableState: false,
    metadata: { optional: true, providerOwnedExternally: true, contentFingerprint: configurationFingerprint(options) },
    createApi({ engine }) {
      if (engine.n.renderInstallation?.getPhase() !== 'uninstalled') throw Error('Render installation is already owned by another composition');
      if ([options.host,options.canvas,options.nativeWindow].filter(Boolean).length>1) throw TypeError('Supply only one presentation surface');
      const host = options.host ?? (options.canvas ? createCanvasHost(options.canvas, options.surfaceOptions) : options.nativeWindow ? createNativeWindowHost(options.nativeWindow === true ? {} : options.nativeWindow) : undefined);
      let api;
      try { api = createGraphicsSession(engine, { ...options, host }); }
      catch (error) { host?.dispose(); throw error; }
      api.ready = api.initialize();
      installed.set(engine, { options, api });
      return api;
    }
  });
}
// These are existing Core contracts and lifecycle atoms; the executable provider is
// installed last. Ordinary Core imports neither load nor initialize NexusGL.
export function createGraphicsLanguageDomain(config = {}) {
  return [...createRenderContractsDomain(), createRenderDeviceContractKit(), createRenderResourceContractKit(), createResourceIdentityKit(), ...createRenderLifecycleDomain(), createGraphicsLanguageKit(config)];
}
export function installGraphicsLanguage(engine, config = {}) {
  const previous = installed.get(engine);
  if (previous) {
    if (!sameOptions(previous.options, config)) throw Error('Graphics Language Kit is already installed with different options');
    return previous.api;
  }
  for (const kit of createGraphicsLanguageDomain(config)) engine.installKit(kit);
  return engine.n.graphicsLanguage;
}
