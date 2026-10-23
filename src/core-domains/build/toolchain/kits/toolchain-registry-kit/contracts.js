import { stableJson } from '../../../contracts.js';
export const TOOLCHAIN_SCHEMA = 'nexusengine.toolchain/1';
export function normalizeToolchain(input) {
    const fields = ['id', 'roles', 'languages', 'hosts', 'targets', 'command', 'arguments', 'probeArguments', 'driver', 'runtimeDependencies', 'capabilities', 'sourceId', 'version'];
    if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some(k => !fields.includes(k)))
        throw new TypeError('Invalid toolchain record');
    const text = (v, k) => { if (typeof v !== 'string' || !v.trim() || v !== v.trim() || /[\x00-\x1f]/.test(v))
        throw new TypeError('Invalid ' + k); return v; };
    const list = (v, k) => { if (!Array.isArray(v) || v.length > 128)
        throw new TypeError('Invalid ' + k); return [...new Set(v.map(x => text(x, k)))].sort(); };
    const argv = v => { if (!Array.isArray(v) || v.length > 128 || v.some(x => typeof x !== 'string' || x.includes('\0')))
        throw new TypeError('Invalid arguments'); return [...v]; };
    const r = { id: text(input.id, 'id'), roles: list(input.roles, 'roles'), languages: list(input.languages, 'languages'), hosts: list(input.hosts, 'hosts'), targets: list(input.targets, 'targets'), command: input.command == null ? null : text(input.command, 'command'), arguments: argv(input.arguments ?? []), probeArguments: argv(input.probeArguments ?? ['--version']), driver: input.driver == null ? null : text(input.driver, 'driver'), runtimeDependencies: list(input.runtimeDependencies ?? [], 'runtimeDependencies'), capabilities: list(input.capabilities ?? [], 'capabilities'), sourceId: input.sourceId == null ? null : text(input.sourceId, 'sourceId'), version: input.version == null ? null : text(input.version, 'version') };
    if (!r.roles.length || !r.hosts.length || !r.targets.length || r.roles.some(x => !['compiler', 'interpreter', 'runtime', 'language-server', 'debugger'].includes(x)))
        throw new TypeError('Invalid toolchain capabilities');
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$/.test(r.id))
        throw new TypeError('Invalid toolchain ID');
    return JSON.parse(stableJson(r));
}
