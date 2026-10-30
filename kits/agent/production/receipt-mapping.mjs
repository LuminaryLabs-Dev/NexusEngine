import { createHash } from 'node:crypto';
export const ENGINE_REVISION = 'nexusengine@0.0.4+authoring-fbx.1';
export const digest = bytes => 'sha256:' + createHash('sha256').update(bytes).digest('hex');
export function receipt(requestId, action, result, before, after) {
  return { schema: 'nexus-engine-kit.execution/1', requestId, action, ok: true,
    engineRevision: ENGINE_REVISION, before, after, result };
}
export const errorResult = error => ({ ok: false, code: error.code ?? error.name, message: error.message });
