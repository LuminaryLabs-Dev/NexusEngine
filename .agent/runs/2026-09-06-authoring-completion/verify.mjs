import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { runDevelopmentAttempt } from '../../../../NexusEngine-Editor/src/headless/development.js';
const [id, group = 'constraints'] = process.argv.slice(2);
if (!id || !/^[a-z0-9-]+$/.test(id)) throw new Error('Supply a unique attempt id.');
const groups = {
  constraints: ['tests/core-domains/core-physics-constraints-descriptors.mjs', 'tests/core-domains/core-physics-constraints-registry.mjs', 'tests/core-domains/core-physics-constraints-integration.mjs', 'tests/core-domains/core-physics-constraints-public.mjs', 'tests/core-domains/core-physics-body-smoke.mjs', 'tests/core-domains/core-physics-shape-smoke.mjs', 'tests/core-domains/core-physics-collider-smoke.mjs', 'tests/core-domains/core-physics-detection-smoke.mjs', 'tests/core-domains/core-physics-domain-smoke.mjs'],
  contracts: ['scripts/check-manifest-execution-parity.mjs'],
  authoring: ['tests/core-domains/core-authoring-public.mjs','tests/core-domains/core-authoring-foundation.mjs','tests/core-domains/core-authoring-geometry.mjs','tests/core-domains/core-authoring-surfaces-rig.mjs','tests/core-domains/core-authoring-integration.mjs','tests/core-domains/core-authoring-modeling.mjs'],
  engine: ['tests/run-all.mjs']
};
const selected = groups[group]; if (!selected) throw new Error('Unknown check group.');
const authoringSources = group === 'authoring' ? readdirSync('src/core-domains/authoring', { recursive: true }).filter(p => p.endsWith('.js')).map(p => `src/core-domains/authoring/${p}`) : [];
const result = await runDevelopmentAttempt({ repository: process.cwd(), directory: resolve('.agent/runs/2026-09-06-authoring-completion/attempts', id), id, goal: `Verify current ${group} implementation`, sourceFiles: [...authoringSources, 'package.json', 'src/core-domains/physics/constraints/constraints-contracts.js', 'src/core-domains/physics/constraints/atomic-constraint-kit.js', 'src/core-domains/physics/constraints/kits/constraint-registry-kit/index.js', ...selected], commands: selected.map((file, i) => ({ id: `check-${i}`, executable: process.execPath, args: [file], timeoutMs: 60000, maxOutputBytes: 1048576 })) });
console.log(JSON.stringify(result)); if (!result.ok) process.exitCode = 1;
