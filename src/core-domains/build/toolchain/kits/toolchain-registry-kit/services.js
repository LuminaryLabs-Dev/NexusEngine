import { normalizeToolchain } from './contracts.js';
import { stableJson } from '../../../contracts.js';
const copy = v => structuredClone(v);
export function createToolchainRegistryService(config = {}) {
    let entries = new Map();
    function register(input) { const next = normalizeToolchain(input), prior = entries.get(next.id); if (prior && stableJson(prior) !== stableJson(next))
        throw new Error('Toolchain identity collision: ' + next.id); entries.set(next.id, next); return copy(next); }
    for (const r of config.entries ?? [])
        register(r);
    const baseline = copy([...entries.values()]);
    function loadSnapshot(value) { if (value?.schema !== 'nexusengine.toolchain-registry/1' || !Array.isArray(value.entries))
        throw new TypeError('Invalid registry snapshot'); const next = new Map(); for (const input of value.entries) {
        const r = normalizeToolchain(input);
        if (next.has(r.id))
            throw new Error('Duplicate toolchain');
        next.set(r.id, r);
    } entries = next; return getSnapshot(); }
    function getSnapshot() { return { schema: 'nexusengine.toolchain-registry/1', entries: [...entries.values()].sort((a, b) => a.id.localeCompare(b.id)).map(copy) }; }
    return Object.freeze({ register, list: () => getSnapshot().entries, get: id => copy(entries.get(id) ?? null), getSnapshot, loadSnapshot, reset: () => loadSnapshot({ schema: 'nexusengine.toolchain-registry/1', entries: baseline }) });
}
export default createToolchainRegistryService;
