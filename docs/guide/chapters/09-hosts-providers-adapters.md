# Hosts, Providers, And Adapters

Core owns semantic contracts. Concrete platform work belongs at a leaf boundary.

## Host

The host owns application lifecycle, package availability, executable resolution, runtime construction, persistence, and rollback. Core retains only portable host capability contracts under `n:host`.

Browser, Node, native, editor, terminal, repository, filesystem, storage, transport, and vendor SDK implementations are outside Core.

## Provider

A provider implements one Domain contract. Examples include physics solving, model inference, speech synthesis, asset retrieval, or capture rendering. Core can own request and result schemas while the provider owns vendor handles, caches, and external effects.

For Physics, `nexusengine/domains/physics/provider-contract` validates a
provider's lifecycle and execution methods without installing or executing the
provider. Provider capability metadata must be portable; backend worlds,
native handles, caches, and solver state remain provider-owned. State,
commands, events, and query records cross the boundary through the sibling
contract Kits under `n:physics:contracts`.

The provider does not become ready merely because it was selected.
`n:physics:lifecycle` emits explicit startup, step, shutdown, reset, and
snapshot requests. The provider executes the relevant operation and returns a
portable receipt. Core owns sequencing and replay; the provider owns backend
worlds, handles, solver state, and platform effects.

Physical material records cross the provider boundary as portable input. Core
owns their identity, validated coefficients, surface classification, and
deterministic pair policy. A provider may translate those records into native
backend materials, but native handles and caches never enter Core snapshots.
The provider executes the resulting contact response; `n:physics:material`
does not calculate impulses or silently map physical surfaces to renderer or
audio assets.

Physics world records also cross the provider boundary as portable input. Core
resolves world settings, gravity acceleration, generic fields, physical flow,
time scale, and simulation-region policy. A provider applies those records to
its native world, bodies, broad phase, and solver. Provider handles and cached
native field objects never enter Core snapshots.

`n:world:weather` remains the authored weather authority. A product or explicit
adapter may translate accepted weather or atmosphere descriptors into a
physical wind-field command. That translation does not transfer weather,
rendering, or gameplay ownership into `n:physics:world`.

For Render, `nexusengine/domains/render/provider-contract` validates resource
and frame execution methods without installing or invoking the provider.
Portable resource, frame, resolved-pass, shader-interface, and event records
cross the sibling contract Kits under `n:render:contracts`. Native devices,
GPU handles, compiled shaders, command encoders, caches, and platform surfaces
remain provider- or host-owned.

`n:render:lifecycle` records which provider composition is selected and tracks
its startup, shutdown, reset, snapshot, and recovery receipts. It never retains
the provider object or invokes its methods. A ready recovery receipt may return
the lifecycle to `ready`; a nonready receipt returns it to `installed`, after
which the provider must complete a new startup. Runtime lifecycle remains the
owner of engine ticking and generic Kit installation.

`n:render:device` records the portable identity and accepted capabilities of a
device returned by that provider. Separate atoms own feature declarations,
numeric limits, capability profiles, semantic memory reservations, logical
queue submissions, acquisition state, loss records, and read-only diagnostics.
Provider receipts are explicit command inputs. GPU handles, real allocation,
command encoding, queue execution, and repair never enter these Core records.

`n:render:resource` records exact execution-resource identities, references,
portable residency, integrity evidence, accounting, and provider operation
receipts. `n:render:buffer` builds portable logical Buffer descriptors,
explicit layouts, and typed views over those exact identities. Buffer updates
refer to Device queue submissions and accept explicit provider receipts; Core
never retains source bytes or performs allocation, mapping, transfer, command
submission, or repair.

`n:render:texture` builds portable Texture formats, exact Texture records,
typed subresource views, mip plans, stream requests, and residency evidence on
those Resource and Buffer contracts. A stream names the exact source-provided
mip content, a bounded copy-source staging Buffer range, and one Device queue
submission. Completion records a matching provider receipt; only completed
streams may establish resident subresources. Asset still owns source content
and decoding, Presentation owns visual and authored shadow meaning, Pipeline
and Frame own attachment execution, and providers own allocation, upload, mip
generation, eviction, repair, and backend format mapping.

`n:render:shader` records portable language capabilities, immutable source and
include revisions, module and program topology, deterministic variants,
bounded permutations, logical compile state, normalized reflection, and cache
links to resident `shader-program` Resources. Compile requests name an exact
SHA-256 module/source/include closure and a matching Device queue submission;
completion accepts only an explicit provider receipt for the same device,
submission, and compile identity. The existing Shader interface schema remains
under `n:render:contracts`. Core does not preprocess, parse, compile, link,
retain binaries or GPU programs, execute backend reflection, or repair source.

`n:render:material` associates exact portable Material slots with Shader
interfaces, typed parameter values, resident Texture views and subresources,
sampler descriptors, complete instances, and Shader variants. Validation names
one completed compile and matching reflection record, while cache records point
to resident `material` Resources with the same composition hash. Current
resolution always rechecks Texture lifecycle and subresource residency, so an
eviction makes dependent validation and cache use stale without changing stored
Material state. Presentation still owns authored visual meaning, and providers
own GPU bind groups, sampler objects, uploads, binding commands, execution, and
repair.

A Presentation render-layer graph expresses visual meaning and ordering policy.
It is not a GPU command graph. A later explicit bridge resolves an accepted
Presentation graph into strict Render pass records; the Render Pass contract
does not silently take ownership of semantic layers or reorder them.

## Adapter

An adapter translates two public contracts without becoming the state owner of either. Its manifest names both requirements and the capability it provides. Adapters import public semantic subpaths, never private sibling files.

The restored behavior graph uses nine optional adapters:

- locomotion contact response
- camera world occlusion
- vehicle water response
- lifecycle economy
- lifecycle facility
- facility economy
- occupant request
- transport request
- request economy

Each atom remains useful without its adapters. Installing an adapter never
installs another atom and never turns a read-only query into a hidden mutation.

## Presentation Boundary

Presentation Core contains renderer-neutral descriptors and policies. Three.js objects, WebGL resources, browser audio, native widgets, and authored presets belong in renderer, host, Kit, or product repositories.

## Example Ownership Decisions

- Generic sky descriptors: `n:presentation:sky`.
- Authored sunset preset: recipe or product data.
- Speech request lifecycle: `n:presentation:speech`.
- PocketTTS implementation: external provider Kit.
- Motion trajectory: `n:simulation:motion`.
- Animation clip descriptor: `n:presentation:animation`.
- Two-bone pose solving: `n:simulation:motion`.
