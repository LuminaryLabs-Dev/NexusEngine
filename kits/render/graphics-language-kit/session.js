import { validateRenderProvider } from 'nexusengine/domains/render/provider-contract';
import { normalizeResource, normalizeResourceUpdate, normalizeFrame, normalizeDraw, graphicsFrameDescriptor, integer, text, record, GRAPHICS_LANGUAGE_SCHEMA } from './contracts.js';
import { createNexusGLProvider } from './provider.js';
import { createFrameHost } from './hosts.js';

const receipt = (p, ready = true) => ({ providerId: p.id, providerVersion: p.version ?? null, ready,
  details: { backend: p.getDiagnostics?.().backend ?? 'custom' } });
const uploadOrder = { texture: 0, material: 1, geometry: 2 };
const ordered = resources => [...resources.values()].sort((a, b) => uploadOrder[a.kind] - uploadOrder[b.kind]);
function requirements(resources, frame) {
  const shading = new Set(), alphaModes = new Set(), resourceKinds = new Set();
  for (const r of resources.values()) {
    resourceKinds.add(r.kind);
    if (r.kind === 'material') { shading.add(r.data.shading ?? 'reference'); alphaModes.add(r.data.alphaMode ?? 'opaque'); }
  }
  return { shading, alphaModes, resourceKinds, frame };
}
function compatible(p, required) {
  validateRenderProvider(p);
  const c = p.capabilities;
  if (c?.presentation !== 'rgba8') throw Error('Provider requires an incompatible presentation host');
  for (const key of ['shading', 'alphaModes', 'resourceKinds']) {
    for (const value of required[key]) if (!c[key]?.includes(value)) throw Error(`Provider ${p.id} does not support ${key}: ${value}`);
  }
  const f = required.frame;
  if (!c.qualityModes?.includes(f.quality) || f.width > c.maxDimension || f.height > c.maxDimension || f.width * f.height > c.maxPixels) {
    throw Error('Provider does not support the submitted frame');
  }
}
function defaultSelection(backend, config) {
  return { provider: createNexusGLProvider({ ...config, backend }),
    reservationBytes: (config.memoryBudgetBytes ?? 128 * 1024 ** 2) + 3 * (config.maxResourceBytes ?? 32 * 1024 ** 2) + 32 * 1024 ** 2 };
}
function verifyReferences(resources) {
  for (const r of resources.values()) if (r.kind === 'material') {
    for (const key of ['colorTexture', 'normalTexture']) {
      if (r.data[key] && resources.get(r.data[key])?.kind !== 'texture') throw Error(`Missing texture: ${r.data[key]}`);
      if (r.data[key] && resources.get(r.data[key]).data.normalMap !== (key === 'normalTexture')) throw Error(`Texture color space does not match ${key}`);
    }
  }
}
function checkedSelection(selection) {
  if (!selection?.provider) throw TypeError('Renderer selection requires a provider and reservationBytes');
  integer(selection.reservationBytes, 'provider reservationBytes', 1);
  validateRenderProvider(selection.provider);
  if (typeof selection.provider.getCompletedFrame !== 'function') throw TypeError('Provider requires getCompletedFrame');
  return selection;
}
function synchronous(value) {
  if (value && typeof value.then === 'function') {
    value.catch?.(() => {});
    throw TypeError('Host commit and rollback must be synchronous');
  }
  return value;
}

export function createGraphicsSession(engine, config = {}) {
  const host = config.host ?? createFrameHost();
  for (const key of ['prepare', 'commit', 'rollback', 'capture', 'dispose']) {
    if (typeof host[key] !== 'function') throw TypeError(`Host requires ${key}`);
  }
  if (host.kind !== 'rgba8' || config.xr) throw TypeError('This kit requires a non-XR RGBA8 presentation host');
  const installation = engine.n.renderInstallation, startup = engine.n.renderStartup;
  const timeoutMs = integer(config.handoverTimeoutMs ?? 15000, 'handover timeout', 10);
  const memoryLimit = integer(config.handoverBudgetBytes ?? 768 * 1024 ** 2, 'handover memory budget', 1024 ** 2);
  let active = null, activeReservation = 0, resources = new Map(), lastSpec = null;
  let flight = null, write = null, barrier = false, candidate = null, closed = false, operation = 0;
  let initialization = null, handover = null, disposal = null;
  const retired = new Set();
  const identities = engine.n.renderResourceIdentities;
  const resourceSetId = 'graphics-language:portable-resources';
  const revision = () => identities.getCurrent(resourceSetId)?.resource.revision ?? 0;
  // Core owns identity/revision lineage. The kit retains execution declarations,
  // not a second logical registry. Only a digest enters historical Core records.
  function recordResources(next) {
    const previous = identities.getCurrent(resourceSetId);
    const resource = { schema: 'nexusengine.render-resource/1', resourceId: resourceSetId,
      kind: 'graphics-declarations', revision: previous ? previous.resource.revision + 1 : 0,
      descriptor: { resources: ordered(next) } };
    const contentHash = engine.n.renderResourceContract.createIdentity(resource).descriptorHash;
    resource.descriptor = { schema: GRAPHICS_LANGUAGE_SCHEMA, contentHash };
    identities.register({ operationId: op('resources'), resource });
  }
  async function assignResources(next, action) {
    verifyReferences(next);
    await action();
    try { recordResources(next); }
    catch (error) { await active.replaceResources?.([...resources.values()]); throw error; }
    resources = next;
  }

  const op = label => `graphics:${label}:${++operation}`;
  const available = () => {
    if (closed) throw Error('Graphics session disposed');
    if (!active || installation.getPhase() !== 'ready' || installation.getInstallation()?.providerId !== active.id) {
      throw Error('Graphics session is not ready; lifecycle state must be controlled through the installed kit');
    }
  };
  const mutable = () => { available(); if (flight || write || barrier) throw Error('Rendering submission barrier is active'); };
  const tokenFor = (operationId, provider) => {
    let rejectStop;
    const token = { operationId, provider, cancelled: false, committing: false, abandoned: false,
      deadline: Date.now() + timeoutMs, stop: new Promise((_, reject) => { rejectStop = reject; }) };
    token.stop.catch(() => {});
    token.abort = () => {
      if (token.committing || token.cancelled) return false;
      token.cancelled = true;
      rejectStop(Error('Renderer handover cancelled'));
      return true;
    };
    return token;
  };
  async function bounded(task, token) {
    let timer;
    const pending = Promise.resolve(task);
    // A provider must honor disposal even when initialization or upload settles late.
    pending.then(() => { if (token.abandoned) return token.provider.dispose(); }, () => {}).catch(() => {});
    const timed = new Promise((_, reject) => { timer = setTimeout(() => reject(Error('Renderer handover timed out')), Math.max(0, token.deadline - Date.now())); });
    try {
      const result = await Promise.race([pending, timed, token.stop]);
      if (Date.now() > token.deadline) throw Error('Renderer handover timed out');
      if (token.cancelled || (closed && !token.allowClosed)) throw Error('Renderer handover cancelled');
      return result;
    } finally { clearTimeout(timer); }
  }
  async function disposeProvider(provider) {
    const cleanup = tokenFor(op('dispose'), provider);
    cleanup.allowClosed = true;
    try { await bounded(Promise.resolve().then(() => provider.dispose()), cleanup); retired.delete(provider); }
    catch (error) { retired.add(provider); throw error; }
  }
  async function runFrame(provider, spec) {
    const contract = spec.contract ?? graphicsFrameDescriptor(spec.frame);
    await provider.beginFrame(contract);
    try {
      await provider.executePass({ frameId: spec.frame.frameId, passId: contract.passIds?.[0] ?? spec.frame.frameId + ':scene', sequence: 0, kind: 'render', metadata:{graphicsLanguage:{draws:spec.draws}} });
      await provider.submitFrame(spec.frame.frameId);
      const frame = await provider.getCompletedFrame();
      if (frame?.frameId !== spec.frame.frameId) throw Error('Provider returned a stale frame');
      if (frame.width !== spec.frame.width || frame.height !== spec.frame.height) throw Error('Provider returned an incomplete frame extent');
      return frame;
    } catch (error) { await provider.cancelFrame?.(); throw error; }
  }
  function checkSpec(input) {
    if (!Array.isArray(input.draws)) throw TypeError('Frame draws must be an array');
    const frame = normalizeFrame(input.frame), draws = input.draws.map(normalizeDraw);
    for (const d of draws) if (resources.get(d.geometryId)?.kind !== 'geometry' || d.materialId && resources.get(d.materialId)?.kind !== 'material') {
      throw Error('Frame references an unknown rendering resource');
    }
    verifyReferences(resources);
    if (input.frame?.surfaceId && input.frame.surfaceId !== (config.surfaceId ?? 'graphics-language:surface')) throw Error('Frame targets an incompatible surface');
    if (input.frame?.schema === 'nexusengine.render-frame/1' && input.frame.passIds?.length > 1) throw Error('The Graphics Language command path resolves one scene pass');
    return { frame, draws, ...(input.frame?.schema === 'nexusengine.render-frame/1' ? {contract:structuredClone(input.frame)} : {}) };
  }
  function mutation(action) {
    mutable();
    const pending = Promise.resolve().then(action);
    write = pending;
    pending.finally(() => { if (write === pending) write = null; }).catch(() => {});
    return pending;
  }
  const session = {
    initialize() {
      if (initialization) return initialization;
      initialization = (async () => {
        if (closed) throw Error('Graphics session disposed');
        if (installation.getPhase() !== 'uninstalled') throw Error('Render installation is already owned by another composition');
        const selected = checkedSelection(config.selection ?? defaultSelection(config.backend ?? 'auto', config));
        const token = tokenFor(op('startup'), selected.provider);
        try {
          installation.install({ operationId: op('install'), providerId: selected.provider.id, providerVersion: selected.provider.version ?? null });
          startup.begin({ operationId: token.operationId });
          if (selected.reservationBytes + (host.reservationBytes ?? 0) > memoryLimit) throw Error('Initial renderer exceeds memory budget');
          await bounded(selected.provider.initialize(), token);
          await bounded(host.ready, token);
          recordResources(resources);
          startup.complete({ operationId: op('ready'), providerReceipt: receipt(selected.provider) });
          active = selected.provider; activeReservation = selected.reservationBytes;
          return session;
        } catch (error) {
          token.abandoned = true;
          if (startup.getStatus() === 'starting') startup.fail({ operationId: op('startup-failed'), failure: { code: 'graphics.startup', message: error.message } });
          host.dispose();
          try { await disposeProvider(selected.provider); } catch (cleanup) { error.message += `; startup cleanup failed: ${cleanup.message}`; }
          throw error;
        }
      })();
      initialization.catch(() => {});
      return initialization;
    },
    createResource(input) {
      const r = normalizeResource(input);
      return mutation(async () => {
        if (resources.has(r.id)) throw Error(`Duplicate resource: ${r.id}`);
        const next = new Map(resources); next.set(r.id, r);
        await assignResources(next, () => active.createResource(r));
        return { resourceId: r.id, revision: revision() };
      });
    },
    updateResource(input) {
      const admitted = normalizeResource(input);
      return mutation(async () => {
        const r = normalizeResourceUpdate(admitted, resources.get(admitted.id));
        if (JSON.stringify(resources.get(r.id)) !== JSON.stringify(r)) {
          const next = new Map(resources); next.set(r.id, r);
          await assignResources(next, () => active.updateResource(r));
        }
        return { resourceId: r.id, revision: revision() };
      });
    },
    releaseResource(id) {
      return mutation(async () => {
        if (!resources.has(id)) throw Error(`Unknown resource: ${id}`);
        for (const r of resources.values()) if (r.kind === 'material' && (r.data.colorTexture === id || r.data.normalTexture === id)) throw Error(`Resource ${id} is still referenced`);
        const next = new Map(resources); next.delete(id);
        await assignResources(next, () => active.releaseResource(id));
        return { resourceId: id, revision: revision() };
      });
    },
    render(input) {
      mutable();
      const spec = checkSpec(input), provider = active, generation = installation.getState().generation;
      compatible(provider, requirements(resources, spec.frame));
      const pending = (async () => {
        const frame = await runFrame(provider, spec);
        if (closed || active !== provider || installation.getPhase() !== 'ready' || installation.getState().generation !== generation) throw Error('Stale renderer result');
        const stage = await host.prepare(frame, { generation, operationId: op('frame') });
        if (closed || active !== provider || installation.getPhase() !== 'ready' || installation.getState().generation !== generation) throw Error('Stale renderer result');
        synchronous(host.commit(stage));
        lastSpec = structuredClone(spec);
        return { frameId: frame.frameId, generation, presented: true };
      })();
      flight = pending;
      pending.finally(() => { if (flight === pending) flight = null; }).catch(() => {});
      return pending;
    },
    switchRenderer(request = {}) {
      record(request,['operationId','selection','backend','signal'],'Renderer handover');
      if (request.selection && request.backend) throw TypeError('Supply a provider selection or backend');
      available();
      if (candidate || retired.size) throw Error('A renderer candidate or retired provider is still active');
      if (!lastSpec) throw Error('Present an initial frame before switching');
      const operationId = text(request.operationId, 'operationId');
      if (installation.getState().operationReceipts[operationId]) throw Error('Renderer operation ID has already been used');
      const selection = checkedSelection(request.selection ?? defaultSelection(request.backend ?? 'wasm', config));
      if (selection.provider === active) throw Error('Candidate must be a separate provider instance');
      const token = tokenFor(operationId, selection.provider);
      candidate = token;
      const abort = () => token.abort();
      request.signal?.addEventListener('abort', abort, { once: true });
      if (request.signal?.aborted) abort();
      const pending = (async () => {
        let begun = false, committed = false;
        try {
          installation.beginHandover({ operationId, candidate: { providerId: selection.provider.id, providerVersion: selection.provider.version ?? null }, resourceRevision: revision() });
          begun = true;
          if (token.cancelled) throw Error('Renderer handover cancelled');
          compatible(selection.provider, requirements(resources, lastSpec.frame));
          // Each provider reserves renderer storage plus portable resources and runtime
          // overhead. Four RGBA copies cover completed, prepared, rollback and presentation.
          const frameBytes = lastSpec.frame.width * lastSpec.frame.height * 4;
          if (activeReservation + selection.reservationBytes + frameBytes * 4 + (host.reservationBytes ?? 0) > memoryLimit) {
            throw Error('Both renderers exceed the handover memory budget');
          }
          await bounded(selection.provider.initialize(), token);
          // Active frames and updates remain allowed during initialization.
          barrier = true;
          if (write) await bounded(write.catch(() => {}), token);
          if (flight) await bounded(flight.catch(() => {}), token);
          const capturedRevision = revision(), spec = structuredClone(lastSpec);
          compatible(selection.provider, requirements(resources, spec.frame));
          if (activeReservation + selection.reservationBytes + spec.frame.width * spec.frame.height * 16 + (host.reservationBytes ?? 0) > memoryLimit) throw Error('Updated frame exceeds the handover memory budget');
          verifyReferences(resources);
          for (const r of ordered(resources)) await bounded(selection.provider.createResource(structuredClone(r)), token);
          if (capturedRevision !== revision()) throw Error('Resources changed during the submission barrier');
          const first = await bounded(runFrame(selection.provider, spec), token);
          const generation = installation.getState().generation + 1;
          const stage = await bounded(host.prepare(first, { generation, operationId }), token);
          if (capturedRevision !== revision()) throw Error('Resources changed before presentation commit');
          installation.prepareHandover({ operationId: op('prepared'), handoverId: operationId, resourceRevision: capturedRevision });
          if (token.cancelled || closed) throw Error('Renderer handover cancelled');
          const previous = host.capture();
          token.committing = true;
          try {
            const presented = synchronous(host.commit(stage));
            if (presented?.presented !== true) throw Error('Host did not confirm presentation');
            installation.commitHandover({ operationId: op('commit'), handoverId: operationId, resourceRevision: capturedRevision, providerReceipt: receipt(selection.provider) });
          } catch (error) {
            synchronous(host.rollback(previous, { generation: generation - 1, operationId }));
            throw error;
          }
          const old = active;
          active = selection.provider; activeReservation = selection.reservationBytes; committed = true;
          retired.add(old);
          let cleanupError = null;
          try { await bounded(old.waitIdle?.() ?? undefined, tokenFor(op('drain'), old)); await disposeProvider(old); }
          catch (error) { cleanupError = error.message; }
          return { operationId, generation, providerId: active.id, backend: active.getDiagnostics?.().backend ?? 'custom', presented: true, cleanupError };
        } catch (error) {
          if (!committed) {
            token.abandoned = true;
            try { await disposeProvider(selection.provider); } catch (cleanup) { error.message += `; candidate cleanup failed: ${cleanup.message}`; }
            if (begun) installation.abortHandover({ operationId: op('abort'), handoverId: operationId, cancelled: token.cancelled, reason: error.message });
          }
          throw error;
        } finally {
          barrier = false;
          if (candidate === token) candidate = null;
          request.signal?.removeEventListener('abort', abort);
        }
      })();
      handover = pending;
      pending.finally(() => { if (handover === pending) handover = null; }).catch(() => {});
      return pending;
    },
    cancelHandover(operationId) { return candidate?.operationId === operationId ? candidate.abort() : false; },
    getSnapshot() {
      mutable();
      if (candidate) throw Error('Cannot snapshot unfinished handover work');
      return { schema: 'nexusengine.graphics-resources/1', revision: revision(), resources: structuredClone([...resources.values()]) };
    },
    loadSnapshot(snapshot) {
      if (candidate) throw Error('Cannot restore during handover');
      if (snapshot?.schema !== 'nexusengine.graphics-resources/1' || !Array.isArray(snapshot.resources)) throw Error('Unsupported resource snapshot');
      const list = snapshot.resources.map(normalizeResource), next = new Map(list.map(r => [r.id, r]));
      if (next.size !== list.length) throw Error('Duplicate resource IDs');
      verifyReferences(next);
      return mutation(async () => {
        if (typeof active.replaceResources !== 'function') throw Error('Provider does not support atomic resource restoration');
        await assignResources(next, () => active.replaceResources(list));
        lastSpec = null;
        return { restored: true };
      });
    },
    reset() {
      if (candidate) throw Error('Cannot reset during handover');
      return mutation(async () => { await assignResources(new Map(), () => active.reset()); lastSpec = null; return { reset: true }; });
    },
    getState() {
      return { status: closed ? 'disposed' : active ? 'ready' : startup.getStatus() === 'failed' ? 'failed' : initialization ? 'starting' : 'installed',
        ...installation.getState(), resourceRevision: revision(), barrier, retiredProviders: retired.size, diagnostics: active?.getDiagnostics?.() ?? null };
    },
    capture: () => host.capture(),
    getSurfaceState() {
      if (closed) return { width: 0, height: 0, closed: true };
      if (host.getWindowState) { const {width,height,closed} = host.getWindowState(); return {width,height,closed}; }
      const surface = host.getSurface?.();
      return { width: surface?.width ?? lastSpec?.frame.width ?? 0, height: surface?.height ?? lastSpec?.frame.height ?? 0, closed: false };
    },
    dispose() {
      if (disposal) return disposal;
      closed = true;
      candidate?.abort();
      disposal = (async () => {
        if (initialization) await initialization.catch(() => {});
        if (handover) await handover.catch(() => {});
        if (write) await write.catch(() => {});
        if (flight) await flight.catch(() => {});
        if (active) {
          const p = active;
          if (['ready','failed'].includes(installation.getPhase())) engine.n.renderShutdown.begin({ operationId: op('shutdown') });
          await disposeProvider(p);
          if (installation.getPhase() === 'stopping') engine.n.renderShutdown.complete({ operationId: op('stopped'), providerReceipt: receipt(p, false) });
          active = null;
        }
        for (const p of [...retired]) await disposeProvider(p);
        retired.clear();
        host.dispose(); resources.clear();
      })();
      return disposal;
    }
  };
  return session;
}
