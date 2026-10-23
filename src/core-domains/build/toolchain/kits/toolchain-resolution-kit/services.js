import { contentIntegrity, stableJson } from '../../../contracts.js';
export function createToolchainResolutionService({ registry, discovery } = {}) {
    function resolve(request) {
        if (!request || typeof request.language !== 'string' || typeof request.host !== 'string' || typeof request.target !== 'string')
            throw new TypeError('Language, host and target are required');
        const role = request.role ?? 'compiler', requirements = [], selected = [], visited = new Set(), active = new Set();
        if (!['compiler', 'interpreter', 'runtime', 'language-server', 'debugger'].includes(role))
            throw new TypeError('Invalid tool role');
        const compatible = r => r.hosts.some(x => x === '*' || x === request.host) && r.targets.some(x => x === '*' || x === request.target);
        function visit(r) {
            if (active.has(r.id)) {
                requirements.push({ code: 'runtime-dependency-cycle', id: r.id });
                return;
            }
            if (visited.has(r.id))
                return;
            active.add(r.id);
            if (!compatible(r))
                requirements.push({ code: 'toolchain-target-incompatible', id: r.id });
            const probe = discovery?.inspectTool(r) ?? { available: false, error: 'discovery-provider-unavailable' };
            if (!probe.available)
                requirements.push({ code: 'toolchain-unavailable', id: r.id, error: probe.error });
            if (r.version && probe.version !== r.version)
                requirements.push({ code: 'toolchain-version-mismatch', id: r.id, expected: r.version, actual: probe.version });
            selected.push({ toolchain: r, probe });
            for (const id of r.runtimeDependencies) {
                const dep = registry.get(id);
                if (!dep)
                    requirements.push({ code: 'runtime-dependency-missing', id });
                else if (!dep.roles.includes('runtime'))
                    requirements.push({ code: 'runtime-role-required', id });
                else
                    visit(dep);
            }
            active.delete(r.id);
            visited.add(r.id);
        }
        const candidates = registry.list().filter(r => r.roles.includes(role) && r.languages.includes(request.language) && compatible(r) && (!request.toolchainId || r.id === request.toolchainId));
        if (!candidates.length)
            requirements.push({ code: 'no-compatible-toolchain', language: request.language, role, target: request.target });
        else if (candidates.length > 1 && !request.toolchainId)
            requirements.push({ code: 'toolchain-selection-ambiguous', candidates: candidates.map(r => r.id) });
        else
            visit(candidates[0]);
        const payload = { schema: 'nexusengine.toolchain-resolution/1', request: structuredClone(request), status: requirements.length ? 'blocked' : 'ready', selected, requirements };
        return Object.freeze({ ...payload, id: contentIntegrity(stableJson(payload)) });
    }
    return Object.freeze({ resolve });
}
export default createToolchainResolutionService;
