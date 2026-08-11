# NexusEngine

![NexusEngine runtime composition](docs/assets/brand/social-card.png)

NexusEngine is the reusable deterministic Core runtime and isolated build system
for games and simulations. Runtime Core contains only atomic, idempotent,
product-neutral behavior; `n:build` owns build-time compilers, toolchains,
targets, artifacts, and proof without entering the application runtime graph.

## Start Here

1. Read the [NexusEngine Guide](docs/NexusEngine-Guide.md), or use the generated
   [PDF](docs/NexusEngine-Guide.pdf).
2. Use the [documentation router](docs/README.md) for contracts and migrations.
3. Read [Kit Ownership](docs/KIT-OWNERSHIP.md) before changing production code.
4. Read [Current Architecture](docs/CURRENT-ARCHITECTURE.md) and
   [Operations](docs/OPERATIONS.md) before release work.
5. Follow [AGENTS.md](AGENTS.md), `.agent/target.md`, and `.agent/tracker.md` for
   repository work.

## Ownership

```text
NexusEngine
  universal contracts, atomic Core behavior, and build-time n:build tooling

NexusEngine-Kits or another trusted registry
  reusable optional, niche, genre, provider, and runtime-platform behavior

Experiment and game repositories
  complete games, recipes, presets, authored content, UI, and product behavior
```

Unknown or unproven behavior stays outside Core. Tests may use minimal niche
fixtures only to prove named generic Core invariants.

## Runtime

`createEngine()` installs only the manifest-backed Runtime Lifecycle, Realtime,
and Sequence atoms by default.

```js
import { createEngine } from "nexusengine";

const engine = createEngine();
engine.tick(1 / 60);
```

Install additional Core behavior from semantic package subpaths:

```js
import { createEngine } from "nexusengine";
import { createObjectDomain } from "nexusengine/domains/object";

const engine = createEngine({ kits: createObjectDomain() });
engine.n.object.register({
  id: "crate",
  objectType: "prop",
  bounds: { min: [-1, 0, -1], max: [1, 2, 1] }
});
```

Universal behavior is installed explicitly from Core semantic subpaths.
Optional niche, genre, provider, and platform behavior comes from an approved
external registry package. Complete games consume Core and optional Kits;
neither package exports games.

## Build

Projects remain read-only. Build staging, caches, toolchains, receipts, and
default artifacts live under `~/.nexusengine`.

```bash
nexusengine inspect ./my-project
nexusengine plan ./my-project --target web-live --target web-static
nexusengine build ./my-project --target web-static --approve-plan <plan-hash>
```

Repeated `--target` flags form one sorted target set. Dependencies are retrieved
from exact verified upstream records only when selected. Native package proof
requires the real selected toolchain and target validator; runtime and headset
execution are reported separately.

## Semantic Core

Every Core implementation belongs to one manifest under
`src/core-domains/<semantic-domain>/`. The generated catalog, package exports,
ownership ledger, API reference, guide indexes, and MCP records derive from
those manifests. There is no transitional Core Kit source tree or hardcoded
Core catalog.

## 0.0.5 Development

The `0.0.5` work establishes `n:physics` and `n:render` as canonical Core
domains. Physics currently owns strict portable contracts plus explicit
installation, startup, step, shutdown, reset, and snapshot lifecycle atoms.
It also owns physical material identity, friction, restitution, SI density,
surface classification, deterministic pair-combine policy, and portable
Physics worlds with gravity, force, physical wind, time-scale, and simulation
region records. Authored weather, Runtime clocks, bodies, colliders, collision
detection, solving, queries, concrete providers, and the final
`n:simulation:physics` cutover remain separate evidence-gated packages.

Render currently owns the strict portable execution boundary: provider
obligations plus resource, frame, resolved-pass, shader-interface, and event
records. Its lifecycle atoms track provider installation identity, startup,
shutdown, reset, portable snapshots, and recovery without retaining or
executing provider code. Its Device atoms own portable device identity,
feature and limit negotiation, capability profiles, semantic memory budgets,
logical queue receipts, device acquisition state, loss records, and read-only
diagnostics. Its Resource atoms own exact execution-resource identities,
references, portable residency state, Device Memory claims, integrity proofs,
semantic cache records, and explicit provider upload and release receipts.
Its Buffer atoms own portable logical Buffer descriptors, explicit field
layouts, typed Vertex, Index, Uniform, Storage, Instance, and Indirect views,
and bounded update requests with exact provider receipts. Buffer records refer
to Resource identities and Device queue submissions; they do not retain source
bytes, allocate GPU memory, map buffers, or submit backend commands.
Its Texture atoms own portable formats, exact logical Texture records, 2D,
Cube, Array, color-target, depth, and shadow views, contiguous mip plans,
Buffer-backed stream requests, and proven subresource residency. Texture
records refer to exact Resource identities, staging Buffers, mip content, and
Device queue receipts; they do not decode images, own materials or authored
shadow policy, allocate GPU textures, generate mips, execute attachments, or
evict provider resources.
Its Shader atoms own portable language capabilities, immutable source and
include lineage, single-stage modules, linked program topology, deterministic
variants and bounded permutations, logical compile state, normalized provider
reflection, and semantic links to resident `shader-program` Resources. The
existing `shader-schema-kit` remains the single interface-schema owner under
`n:render:contracts`. Providers still own preprocessing, parsing, compilation,
linking, binary artifacts, GPU programs, backend reflection, and repair.
Its Material atoms own exact portable Shader-slot association, typed parameter
sets, resident Texture-view and sampler bindings, complete instances, Shader
variants, current composition validation, and resident semantic cache lineage.
Required Texture resource and subresource residency is rechecked during every
current resolution, so eviction invalidates dependent validation and cache use
without mutating Material state. Providers still own GPU bind groups, sampler
objects, uploads, handles, binding commands, execution, and repair.
Presentation remains the owner of visual meaning and semantic render graphs.
Host remains the owner of platform surface capabilities.
Concrete GPU handles, allocation, queue execution, WebGL, Three.js, native,
and OpenXR providers remain external evidence-gated packages.

```js
import { createEngine } from "nexusengine";
import { createPhysicsContractsDomain } from "nexusengine/domains/physics/contracts";
import { createPhysicsLifecycleDomain } from "nexusengine/domains/physics/lifecycle";
import { createPhysicsMaterialDomain } from "nexusengine/domains/physics/material";
import { createPhysicsWorldDomain } from "nexusengine/domains/physics/world";

const engine = createEngine({
  kits: [
    ...createPhysicsContractsDomain(),
    ...createPhysicsLifecycleDomain(),
    ...createPhysicsMaterialDomain(),
    ...createPhysicsWorldDomain()
  ]
});

engine.n.physicsInstallation.install({
  operationId: "physics:install:1",
  providerId: "my-provider"
});

engine.n.physicsStartup.begin({ operationId: "physics:start:begin:1" });
engine.n.physicsStartup.complete({
  operationId: "physics:start:complete:1",
  providerReceipt: { providerId: "my-provider", ready: true }
});

engine.n.physicsMaterial.defineMaterial({
  operationId: "material:define:steel",
  material: {
    id: "steel",
    friction: { staticCoefficient: 0.7, dynamicCoefficient: 0.5 },
    restitution: { coefficient: 0.2 },
    density: { kilogramsPerCubicMeter: 7850 },
    surface: { surfaceType: "metal", tags: ["solid"] }
  }
});

engine.n.physicsGravityField.defineField({
  operationId: "gravity:define:earth",
  field: { id: "gravity:earth", kind: "uniform", vector: [0, -9.81, 0] }
});

engine.n.physicsWorld.defineWorld({
  operationId: "physics-world:define:main",
  world: { id: "world:main", gravityFieldIds: ["gravity:earth"] }
});
```

```js
import { createEngine } from "nexusengine";
import { createRenderContractsDomain } from "nexusengine/domains/render/contracts";
import { createRenderLifecycleDomain } from "nexusengine/domains/render/lifecycle";
import { createRenderDeviceDomain } from "nexusengine/domains/render/device";
import { createRenderResourceDomain } from "nexusengine/domains/render/resource";
import { createRenderBufferDomain } from "nexusengine/domains/render/buffer";
import { createRenderTextureDomain } from "nexusengine/domains/render/texture";
import { createRenderShaderDomain } from "nexusengine/domains/render/shader";
import { createRenderMaterialDomain } from "nexusengine/domains/render/material";

const renderEngine = createEngine({
  kits: [
    ...createRenderContractsDomain(),
    ...createRenderLifecycleDomain(),
    ...createRenderDeviceDomain(),
    ...createRenderResourceDomain(),
    ...createRenderBufferDomain(),
    ...createRenderTextureDomain(),
    ...createRenderShaderDomain(),
    ...createRenderMaterialDomain()
  ]
});
renderEngine.n.renderInstallation.install({
  operationId: "render:install:1",
  providerId: "my-render-provider",
  providerVersion: "1.0.0"
});
renderEngine.n.renderDeviceFeatures.defineFeature({
  operationId: "render:feature:rendering",
  feature: { featureId: "rendering", category: "rendering" }
});
renderEngine.n.renderDeviceLimits.defineProfile({
  operationId: "render:limits:default",
  profile: {
    limitProfileId: "limits:default",
    limits: { maxTextureDimension2D: 8192 }
  }
});
```

These Core packages validate provider-facing records and lifecycle receipts;
they do not create a surface, invoke a provider, allocate GPU resources,
execute a queue, compile shaders, or render a frame.

## Restored Core Behaviors

`0.0.4` restores the reusable semantics from 26 removed source modules as 27
manifest-owned atoms. The historical World Physics module is intentionally
split into World Contact and Soft Respawn. Navigation, terrain, water, spatial
scale, motion, economy, operations, requests, hazards, progression, and the
other restored behaviors are available only through generated semantic
subpaths; none return as root exports.

Nine optional adapter Kits connect otherwise independent atoms, and six
composition recipes describe useful combinations without creating hidden state
owners. See the [restored behavior migration](docs/migrations/0.0.4-restored-behaviors.md)
for exact old exports, corrected defects, new imports, adapters, and proof.

## Composition And MCP

Core Composition inspects Domains and atoms and produces deterministic plans:

```js
import { createEngine } from "nexusengine";
import { createCompositionDomain } from "nexusengine/domains/composition";

const engine = createEngine({ kits: createCompositionDomain() });
const result = engine.n.composition.planning.validate({
  kits: ["object-placement-kit"]
});
```

MCP is opt-in. A host installs `nexusengine/domains/mcp`, registers approved
providers, resolves immutable trusted sources, supplies transactional
snapshot/restore behavior, and requires exact-plan approval for mutation. An
applied runtime continues when MCP disconnects.

## Breaking Cutover

`0.0.4` removes old root symbols, `n:core-*` identifiers, Core Kit subpaths,
concrete runtime hosts/providers, authored game behavior, and forwarding
exports. Reusable historical primitives return only as corrected semantic
atoms. Use the [Domain migration](docs/migrations/0.0.4-domain-cutover.md),
[restored behavior migration](docs/migrations/0.0.4-restored-behaviors.md), and
[Build migration](docs/migrations/0.0.4-build-domain.md).

## Validation

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run core:check
npm run core:contracts
npm run ownership:generate
npm run protokits:check
npm run migrations:check
npm run release:manifest
npm test
npm run test:release
npm run boundaries:check
npm run docs:check
npm pack --dry-run --json
```

See [Operations](docs/OPERATIONS.md) for expected evidence.

## Project Status

- Package metadata version: `0.0.4`
- Runtime: ESM on Node.js 18 or later
- API status: release candidate under active proof
- License: MIT
- Publication: no npm publication, Git tag, GitHub Release, deployment, or
  immutable `0.0.4` branch is implied by local validation

See [CHANGELOG.md](CHANGELOG.md), [RELEASE_0.0.4.md](RELEASE_0.0.4.md), and
[Security](SECURITY.md) for current boundaries.
