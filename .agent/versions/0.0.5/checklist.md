# NexusEngine 0.0.5 Physics and Render Completion Checklist

## 1. Master Goal Contract

Master goal: Add canonical Core domains n:physics and n:render, implement and prove the supplied Kit inventory, validate the complete path in The Open Above, publish an immutable 0.0.5 branch from the approved release commit, and leave main as the active line for progress toward 0.0.6.

ID: goal-nexusengine-0.0.5-physics-render  
Required: yes  
Owner: unassigned  
Stakeholders: NexusEngine, NexusEngine-Kits, The Open Above, release reviewers  
Source/context: supplied two-domain tree at ${CODEX_HOME}/attachments/75fadd03-de67-4485-aa68-1845b40814f7/pasted-text.txt  
Status: proposed  
Approval: needed before implementation, consumer mutation, main push, or release-branch creation  
Delivery: unscheduled  
Scope: only n:physics, n:render, their Kits/providers, existing-domain integration, candidate proof in The Open Above, immutable 0.0.5 branch publication, and The Open Above main-tracking validation  
Non-goals: no unrelated domain redesign, no game-logic extraction, no 0.0.4 change, no npm publication, no deployment, no Google Drive mutation, no unapproved hardware work  
Current status: proposed; no implementation is claimed complete by this checklist  
Next action: approve or revise the two canonical domains and the supplied Kit inventory  
Blocker: public paths, exact provider scope, and final Kit dispositions are not frozen  
Risk: the supplied names are a planning inventory, not proof that every Kit needs independent implementation

Master Definition of Done: Every retained Kit has a validated manifest, one semantic responsibility, implementation, lifecycle proof, direct proof, composition/provider proof, generated public surface, and consumer evidence; both domains work in The Open Above; all final checks pass; approved release commit A reaches main and immutable origin/0.0.5; main remains the mutable next-development line; and The Open Above tracks main through exact lock-resolved validation receipts.

## 2. Goal Hierarchy

~~~text
goal-nexusengine-0.0.5-physics-render
|-- goal-physics-domain
|   |-- contracts and lifecycle
|   |-- bodies, shapes, colliders, materials
|   |-- detection, contacts, solver, constraints
|   |-- queries, surfaces, integration, execution
|   |-- determinism, recovery, providers, diagnostics
|-- goal-render-domain
|   |-- contracts, lifecycle, device, surface, resources
|   |-- buffers, textures, geometry, shaders, materials
|   |-- lighting, pipeline, frame, scene, visibility
|   |-- camera, animation, effects, postprocess
|   |-- bridges, providers, capture, XR, diagnostics
|-- goal-existing-domain-integration
|-- goal-open-above-proof
|-- goal-open-above-main-continuation
|-- goal-documentation-and-generated-registry
|-- goal-version-freeze-and-main-continuation
~~~

## 3. Shared Kit Definition of Done

Every Kit row in Section 5 is a required Kit goal and inherits the metadata below. The seven checkbox columns are separate actions for every Kit.

Shared metadata: Required yes; Owner unassigned; Status proposed; Approval needed; Delivery unscheduled; no Kit is currently marked done.

### KIT-C: Contract and ownership

- [ ] Define stable Kit ID, domain path, parent path, responsibility, API, requires, and provides.
  - Done when: the manifest validates and the Kit owns one semantic responsibility.
  - Evidence: kit.manifest.js, domain manifest, ownership ledger.
  - Validation: manifest and ownership checks.

### KIT-I: Implementation

- [ ] Implement behavior without private sibling imports, hidden installation, product rules, or unapproved technology leakage.
  - Done when: valid behavior works and unsupported input fails before mutation.
  - Evidence: source module and implementation tests.
  - Validation: boundary check and direct contract test.

### KIT-L: Lifecycle

- [ ] Implement install, duplicate install, state, snapshot, load, reset, and operation idempotency.
  - Done when: install twice, reset twice, snapshot/load twice, and changed-content conflict are proven.
  - Evidence: lifecycle tests and JSON-portable snapshots.
  - Validation: lifecycle regression suite.

### KIT-P: Direct proof

- [ ] Test valid behavior, invalid input, rollback, boundaries, deterministic output, and failure receipts.
  - Done when: declared invariants pass without a consumer.
  - Evidence: targeted Kit test report.
  - Validation: direct test command.

### KIT-G: Composition/provider proof

- [ ] Prove requires/provides, dependency order, missing provider, collision, cycle, duplicate apply, and provider capability behavior.
  - Done when: valid composition installs and invalid composition fails closed.
  - Evidence: plan, graph, receipt, provider report.
  - Validation: composition and provider tests.

### KIT-D: Documentation and exports

- [ ] Generate README/API/MCP/catalog/export/migration entries.
  - Done when: public documentation matches the manifest registry hash.
  - Evidence: generated files and docs report.
  - Validation: docs, links, drift, and pack checks.

### KIT-R: Release integrity

- [ ] Prove clean packaging, exact dependencies, no symlink/private path, reproducible output, and consumer availability.
  - Done when: clean install and consumer proof pass from committed sources.
  - Evidence: tarball, lockfile, hashes, consumer receipt.
  - Validation: clean-install and release gates.

## 4. Domain and Release Gates

### Physics domain

- [ ] Create canonical n:physics manifest and decide migration from the current physics contract path.
- [ ] Reconcile existing Simulation, Object, Spatial, Actor, and World contracts without forwarding exports.
- [ ] Prove body, shape, collider, detection, contact, solver, constraint, query, surface, deterministic, and recovery behavior.
- [ ] Prove at least one reference provider and one independent consumer.

Done when: the physics provider produces deterministic collision and solver results through public Core contracts.

### Render domain

- [ ] Create canonical n:render manifest separate from n:presentation.
- [ ] Keep Presentation as visual intent and Render as execution.
- [ ] Prove device, surface, resource, buffer, texture, geometry, shader, material, lighting, pipeline, frame, scene, visibility, effects, capture, and diagnostics behavior.
- [ ] Prove a headless provider and one browser provider.

Done when: existing Object, World, Asset, and Presentation state produces visible frames through public Core contracts.

### Existing-domain integration

- [ ] Define every cross-domain capability edge and one owner for every state field.
- [ ] Prove Runtime scheduling, Composition planning, MCP approval, Build packaging, and public exports.
- [ ] Prove no private sibling imports or hidden provider installation.

Done when: the generated graph has no undeclared edge, cycle, or duplicate owner.

### The Open Above

- [ ] Install exact Engine and provider commits without symlinks.
- [ ] Compose both domains through public APIs.
- [ ] Prove physics-driven visible movement, restart, replay, duplicate no-op apply, MCP disconnection, Playwright, Human View, and clean console.

Done when: The Open Above is a clean consumer proof, not a local checkout proof.

### Version freeze and main continuation

- [ ] Regenerate catalogs, exports, docs, Guide/PDF, and release metadata.
- [ ] Run clean Engine, Kits, provider, consumer, and hosted checks.
- [ ] Obtain exact-SHA approval and fast-forward main to release commit A.
- [ ] Obtain exact release approval, create immutable origin/0.0.5 at A without force, verify both refs resolve to A, and prove fresh Git HTTPS plus jsDelivr `@0.0.5` imports.

Done when: approved release commit A is usable from main and immutable origin/0.0.5 through Git HTTPS and jsDelivr, origin/0.0.4 is unchanged, and main remains the default mutable line for progress toward 0.0.6.

### The Open Above main validation loop

- [ ] Track NexusEngine through an HTTPS `#main` dependency while every lockfile and validation receipt records the exact resolved Engine SHA.
- [ ] Exercise every retained released Physics and Render capability in The Open Above, using visible gameplay proof for user-facing behavior and explicit nonvisual assertions for contract-only atoms.
- [ ] Run the clean install, build, restart, replay, MCP-disconnection, Playwright, Human View, and clean-console loop twice at the same Engine SHA and again whenever the resolved main SHA changes.

Done when: The Open Above can repeatedly rebuild against the current Engine main without symlinks or hidden local source, every released feature has direct coverage, and each run is reproducible from its recorded SHA and receipt.

## 5. Full Kit Checklist Register

Each row has seven required checklist items: C contract; I implementation; L lifecycle; P direct proof; G composition/provider proof; D docs/exports; R release integrity.
| Parent | Kit | Dependency | C | I | L | P | G | D | R |
|---|---|---|---|---|---|---|---|---|---|
| n:physics/contracts | physics-domain-contract-kit | none | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/contracts | physics-provider-contract-kit | none | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/contracts | physics-state-schema-kit | none | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/contracts | physics-command-schema-kit | none | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/contracts | physics-event-schema-kit | none | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/contracts | physics-query-schema-kit | none | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/lifecycle | physics-installation-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/lifecycle | physics-startup-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/lifecycle | physics-step-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/lifecycle | physics-shutdown-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/lifecycle | physics-reset-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/lifecycle | physics-snapshot-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/world | physics-world-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/world | physics-world-settings-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/world | gravity-field-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/world | force-field-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/world | wind-field-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/world | time-scale-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/world | simulation-region-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/body | body-registry-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/body | body-identity-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/body | body-state-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/body | body-type-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/body | body-pose-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/body | body-velocity-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/body | body-force-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/body | body-mass-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/body | body-inertia-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/body | body-damping-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/body | body-sleep-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/body | body-wake-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/body | body-lifecycle-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/shape | shape-registry-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/shape | shape-identity-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/shape | shape-validation-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/shape | sphere-shape-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/shape | box-shape-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/shape | capsule-shape-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/shape | cylinder-shape-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/shape | cone-shape-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/shape | plane-shape-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/shape | convex-shape-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/shape | triangle-mesh-shape-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/shape | heightfield-shape-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/shape | compound-shape-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/shape | scaled-shape-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/collider | collider-registry-kit | body+shape | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/collider | collider-identity-kit | body+shape | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/collider | collider-attachment-kit | body+shape | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/collider | collider-pose-kit | body+shape | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/collider | collider-material-kit | body+shape | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/collider | collider-filter-kit | body+shape | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/collider | collision-layer-kit | body+shape | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/collider | collision-mask-kit | body+shape | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/collider | collision-group-kit | body+shape | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/collider | sensor-collider-kit | body+shape | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/collider | trigger-collider-kit | body+shape | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/collider | collider-lifecycle-kit | body+shape | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/material | physics-material-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/material | friction-material-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/material | restitution-material-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/material | density-material-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/material | surface-material-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/material | material-combine-policy-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/detection | broad-phase-kit | shape+collider | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/detection | spatial-partition-kit | shape+collider | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/detection | dynamic-tree-kit | shape+collider | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/detection | sweep-and-prune-kit | shape+collider | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/detection | broad-phase-pair-kit | shape+collider | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/detection | narrow-phase-kit | shape+collider | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/detection | shape-intersection-kit | shape+collider | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/detection | gjk-detection-kit | shape+collider | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/detection | epa-penetration-kit | shape+collider | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/detection | continuous-collision-kit | shape+collider | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/detection | collision-detection-result-kit | shape+collider | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/contact | contact-pair-kit | detection | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/contact | contact-point-kit | detection | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/contact | contact-normal-kit | detection | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/contact | contact-manifold-kit | detection | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/contact | contact-persistence-kit | detection | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/contact | contact-impulse-kit | detection | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/contact | contact-enter-kit | detection | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/contact | contact-stay-kit | detection | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/contact | contact-exit-kit | detection | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/contact | sensor-enter-kit | detection | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/contact | sensor-stay-kit | detection | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/contact | sensor-exit-kit | detection | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/solver | fixed-step-solver-kit | body+contact+constraints | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/solver | accumulator-kit | body+contact+constraints | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/solver | solver-iteration-kit | body+contact+constraints | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/solver | island-solver-kit | body+contact+constraints | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/solver | constraint-solver-kit | body+contact+constraints | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/solver | impulse-solver-kit | body+contact+constraints | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/solver | sequential-impulse-kit | body+contact+constraints | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/solver | contact-resolution-kit | body+contact+constraints | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/solver | positional-correction-kit | body+contact+constraints | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/solver | friction-solver-kit | body+contact+constraints | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/solver | restitution-solver-kit | body+contact+constraints | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/solver | stabilization-kit | body+contact+constraints | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/solver | solver-convergence-kit | body+contact+constraints | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/constraints | constraint-registry-kit | body | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/constraints | distance-constraint-kit | body | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/constraints | fixed-constraint-kit | body | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/constraints | hinge-constraint-kit | body | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/constraints | slider-constraint-kit | body | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/constraints | ball-socket-constraint-kit | body | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/constraints | cone-twist-constraint-kit | body | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/constraints | spring-constraint-kit | body | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/constraints | limit-constraint-kit | body | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/constraints | motor-constraint-kit | body | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/constraints | drive-constraint-kit | body | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/constraints | constraint-break-kit | body | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/articulation | articulation-registry-kit | body+constraints | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/articulation | articulation-tree-kit | body+constraints | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/articulation | joint-state-kit | body+constraints | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/articulation | joint-limit-kit | body+constraints | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/articulation | joint-motor-kit | body+constraints | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/articulation | articulated-body-kit | body+constraints | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/articulation | inverse-dynamics-kit | body+constraints | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/articulation | articulated-drive-kit | body+constraints | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/surfaces | ground-contact-kit | body+shape+world | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/surfaces | slope-contact-kit | body+shape+world | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/surfaces | terrain-collision-kit | body+shape+world | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/surfaces | heightfield-collision-kit | body+shape+world | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/surfaces | mesh-surface-contact-kit | body+shape+world | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/surfaces | water-contact-kit | body+shape+world | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/surfaces | buoyancy-query-kit | body+shape+world | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/surfaces | drag-response-kit | body+shape+world | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/surfaces | surface-classification-kit | body+shape+world | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/queries | raycast-kit | detection+spatial | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/queries | multi-raycast-kit | detection+spatial | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/queries | shapecast-kit | detection+spatial | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/queries | sweep-query-kit | detection+spatial | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/queries | overlap-query-kit | detection+spatial | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/queries | point-query-kit | detection+spatial | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/queries | closest-point-query-kit | detection+spatial | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/queries | distance-query-kit | detection+spatial | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/queries | visibility-query-kit | detection+spatial | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/queries | ground-query-kit | detection+spatial | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/queries | query-filter-kit | detection+spatial | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/integration | spatial-transform-sync-kit | body+shape+existing domains | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/integration | object-shape-sync-kit | body+shape+existing domains | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/integration | actor-body-sync-kit | body+shape+existing domains | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/integration | motion-intent-sync-kit | body+shape+existing domains | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/integration | world-surface-sync-kit | body+shape+existing domains | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/integration | terrain-collider-sync-kit | body+shape+existing domains | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/integration | physics-output-state-kit | body+shape+existing domains | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/execution | physics-command-buffer-kit | solver | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/execution | physics-event-buffer-kit | solver | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/execution | physics-job-kit | solver | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/execution | physics-island-kit | solver | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/execution | physics-worker-kit | solver | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/execution | physics-scheduling-kit | solver | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/execution | physics-parallel-dispatch-kit | solver | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/execution | physics-barrier-kit | solver | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/determinism | deterministic-seed-kit | execution+state | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/determinism | deterministic-order-kit | execution+state | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/determinism | deterministic-math-kit | execution+state | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/determinism | physics-replay-kit | execution+state | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/determinism | physics-checkpoint-kit | execution+state | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/determinism | physics-rollback-kit | execution+state | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/determinism | physics-state-hash-kit | execution+state | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/determinism | physics-parity-kit | execution+state | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/recovery | invalid-state-detection-kit | contact+world+actor | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/recovery | kill-boundary-kit | contact+world+actor | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/recovery | soft-respawn-contract-kit | contact+world+actor | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/recovery | contact-recovery-kit | contact+world+actor | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/recovery | physics-failure-receipt-kit | contact+world+actor | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/provider | physics-provider-contract-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/provider | physics-provider-registry-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/provider | physics-provider-selection-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/provider | physics-provider-health-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/provider | physics-provider-capability-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/provider | physics-provider-fallback-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/diagnostics | physics-capability-report-kit | execution+provider | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/diagnostics | physics-body-report-kit | execution+provider | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/diagnostics | physics-contact-report-kit | execution+provider | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/diagnostics | physics-query-report-kit | execution+provider | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/diagnostics | physics-step-report-kit | execution+provider | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/diagnostics | physics-performance-kit | execution+provider | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/diagnostics | physics-debug-descriptor-kit | execution+provider | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:physics/diagnostics | physics-error-report-kit | execution+provider | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/contracts | render-domain-contract-kit | none | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/contracts | render-provider-contract-kit | none | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/contracts | render-resource-schema-kit | none | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/contracts | render-frame-schema-kit | none | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/contracts | render-pass-schema-kit | none | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/contracts | shader-schema-kit | none | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/contracts | render-event-schema-kit | none | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/lifecycle | render-installation-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/lifecycle | render-startup-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/lifecycle | render-shutdown-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/lifecycle | render-reset-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/lifecycle | render-snapshot-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/lifecycle | render-recovery-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/device | render-device-contract-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/device | device-capability-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/device | device-feature-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/device | device-limit-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/device | device-memory-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/device | device-queue-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/device | device-lifecycle-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/device | device-loss-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/device | device-diagnostics-kit | contracts | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/surface | render-surface-kit | device | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/surface | window-surface-kit | device | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/surface | offscreen-surface-kit | device | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/surface | swapchain-surface-kit | device | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/surface | viewport-kit | device | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/surface | scissor-kit | device | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/surface | resize-kit | device | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/surface | fullscreen-kit | device | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/surface | surface-format-kit | device | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/resource | render-resource-contract-kit | device | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/resource | resource-identity-kit | device | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/resource | resource-reference-kit | device | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/resource | resource-state-kit | device | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/resource | resource-lifecycle-kit | device | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/resource | resource-cache-kit | device | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/resource | resource-budget-kit | device | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/resource | resource-upload-kit | device | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/resource | resource-release-kit | device | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/resource | resource-integrity-kit | device | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/buffer | buffer-resource-kit | resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/buffer | vertex-buffer-kit | resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/buffer | index-buffer-kit | resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/buffer | uniform-buffer-kit | resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/buffer | storage-buffer-kit | resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/buffer | instance-buffer-kit | resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/buffer | indirect-buffer-kit | resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/buffer | buffer-layout-kit | resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/texture | texture-resource-kit | resource | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| n:render/texture | texture-2d-kit | resource | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| n:render/texture | texture-cube-kit | resource | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| n:render/texture | texture-array-kit | resource | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| n:render/texture | render-target-texture-kit | resource | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| n:render/texture | depth-texture-kit | resource | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| n:render/texture | shadow-texture-kit | resource | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| n:render/texture | texture-format-kit | resource | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| n:render/texture | mipmap-kit | resource | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| n:render/texture | texture-stream-kit | resource | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| n:render/texture | texture-residency-kit | resource | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| n:render/geometry | mesh-resource-kit | buffer+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/geometry | vertex-layout-kit | buffer+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/geometry | index-layout-kit | buffer+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/geometry | submesh-kit | buffer+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/geometry | morph-target-kit | buffer+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/geometry | skinning-buffer-kit | buffer+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/geometry | instance-geometry-kit | buffer+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/geometry | terrain-geometry-kit | buffer+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/geometry | geometry-validation-kit | buffer+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/shader | shader-contract-kit | device+resource | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| n:render/shader | shader-source-kit | device+resource | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| n:render/shader | shader-language-kit | device+resource | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| n:render/shader | shader-module-kit | device+resource | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| n:render/shader | shader-program-kit | device+resource | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| n:render/shader | shader-schema-kit | device+resource | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| n:render/shader | shader-reflection-kit | device+resource | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| n:render/shader | shader-variant-kit | device+resource | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| n:render/shader | shader-permutation-kit | device+resource | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| n:render/shader | shader-include-kit | device+resource | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| n:render/shader | shader-cache-kit | device+resource | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| n:render/shader | shader-compile-kit | device+resource | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| n:render/shader | shader-error-kit | device+resource | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| n:render/material | material-contract-kit | shader+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/material | material-binding-kit | shader+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/material | material-instance-kit | shader+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/material | material-parameter-kit | shader+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/material | texture-binding-kit | shader+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/material | sampler-binding-kit | shader+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/material | material-variant-kit | shader+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/material | material-validation-kit | shader+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/material | material-cache-kit | shader+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/lighting | light-binding-kit | material+pipeline | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/lighting | directional-light-kit | material+pipeline | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/lighting | point-light-kit | material+pipeline | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/lighting | spot-light-kit | material+pipeline | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/lighting | area-light-kit | material+pipeline | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/lighting | ambient-light-kit | material+pipeline | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/lighting | light-cluster-kit | material+pipeline | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/lighting | shadow-caster-kit | material+pipeline | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/lighting | shadow-map-kit | material+pipeline | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/lighting | cascaded-shadow-kit | material+pipeline | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/lighting | contact-shadow-kit | material+pipeline | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/lighting | light-culling-kit | material+pipeline | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/pipeline | render-pass-kit | resource+shader+material | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/pipeline | render-graph-kit | resource+shader+material | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/pipeline | render-graph-validation-kit | resource+shader+material | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/pipeline | render-attachment-kit | resource+shader+material | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/pipeline | color-attachment-kit | resource+shader+material | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/pipeline | depth-attachment-kit | resource+shader+material | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/pipeline | stencil-attachment-kit | resource+shader+material | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/pipeline | resolve-attachment-kit | resource+shader+material | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/pipeline | pipeline-state-kit | resource+shader+material | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/pipeline | depth-state-kit | resource+shader+material | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/pipeline | stencil-state-kit | resource+shader+material | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/pipeline | blend-state-kit | resource+shader+material | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/pipeline | raster-state-kit | resource+shader+material | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/pipeline | culling-state-kit | resource+shader+material | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/pipeline | polygon-offset-kit | resource+shader+material | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/pipeline | pipeline-cache-kit | resource+shader+material | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/frame | frame-lifecycle-kit | device+surface+pipeline | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/frame | frame-request-kit | device+surface+pipeline | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/frame | frame-context-kit | device+surface+pipeline | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/frame | frame-command-kit | device+surface+pipeline | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/frame | frame-timing-kit | device+surface+pipeline | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/frame | frame-pacing-kit | device+surface+pipeline | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/frame | frame-budget-kit | device+surface+pipeline | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/frame | frame-fence-kit | device+surface+pipeline | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/frame | frame-submit-kit | device+surface+pipeline | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/frame | frame-present-kit | device+surface+pipeline | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/frame | context-loss-kit | device+surface+pipeline | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/frame | frame-recovery-kit | device+surface+pipeline | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/scene | scene-render-state-kit | geometry+material+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/scene | scene-instance-kit | geometry+material+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/scene | scene-layer-kit | geometry+material+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/scene | scene-sort-kit | geometry+material+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/scene | scene-batch-kit | geometry+material+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/scene | instance-batch-kit | geometry+material+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/scene | static-batch-kit | geometry+material+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/scene | dynamic-batch-kit | geometry+material+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/scene | transparent-sort-kit | geometry+material+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/scene | opaque-sort-kit | geometry+material+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/scene | render-order-kit | geometry+material+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/visibility | visibility-query-kit | scene+camera | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/visibility | frustum-culling-kit | scene+camera | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/visibility | occlusion-culling-kit | scene+camera | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/visibility | portal-culling-kit | scene+camera | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/visibility | distance-culling-kit | scene+camera | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/visibility | layer-culling-kit | scene+camera | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/visibility | lod-selection-kit | scene+camera | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/visibility | impostor-selection-kit | scene+camera | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/visibility | visibility-cache-kit | scene+camera | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/camera | camera-binding-kit | presentation+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/camera | camera-projection-kit | presentation+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/camera | camera-view-kit | presentation+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/camera | stereo-camera-kit | presentation+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/camera | multiview-camera-kit | presentation+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/camera | camera-jitter-kit | presentation+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/camera | camera-reprojection-kit | presentation+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/camera | camera-viewport-kit | presentation+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/animation | animation-render-state-kit | geometry+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/animation | pose-upload-kit | geometry+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/animation | skinning-render-kit | geometry+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/animation | skeletal-buffer-kit | geometry+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/animation | morph-render-kit | geometry+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/animation | blend-render-kit | geometry+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/animation | gpu-animation-kit | geometry+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/animation | animation-culling-kit | geometry+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/effects | particle-render-kit | pipeline+material+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/effects | trail-render-kit | pipeline+material+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/effects | decal-render-kit | pipeline+material+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/effects | billboard-render-kit | pipeline+material+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/effects | foliage-render-kit | pipeline+material+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/effects | volumetric-render-kit | pipeline+material+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/effects | fog-render-kit | pipeline+material+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/effects | cloud-render-kit | pipeline+material+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/effects | water-render-kit | pipeline+material+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/effects | terrain-render-kit | pipeline+material+resource | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/postprocess | postprocess-graph-kit | pipeline+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/postprocess | tone-map-kit | pipeline+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/postprocess | color-grade-kit | pipeline+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/postprocess | bloom-kit | pipeline+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/postprocess | ambient-occlusion-kit | pipeline+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/postprocess | screen-space-reflection-kit | pipeline+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/postprocess | motion-blur-kit | pipeline+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/postprocess | depth-of-field-kit | pipeline+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/postprocess | temporal-upscale-kit | pipeline+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/postprocess | anti-aliasing-kit | pipeline+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/postprocess | postprocess-debug-kit | pipeline+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/bridge | presentation-render-bridge-kit | object+world+asset+presentation | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/bridge | object-render-bridge-kit | object+world+asset+presentation | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/bridge | world-render-bridge-kit | object+world+asset+presentation | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/bridge | asset-render-bridge-kit | object+world+asset+presentation | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/bridge | camera-render-bridge-kit | object+world+asset+presentation | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/bridge | animation-render-bridge-kit | object+world+asset+presentation | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/bridge | lighting-render-bridge-kit | object+world+asset+presentation | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/bridge | sky-render-bridge-kit | object+world+asset+presentation | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/bridge | terrain-render-bridge-kit | object+world+asset+presentation | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/bridge | water-render-bridge-kit | object+world+asset+presentation | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/provider | render-provider-registry-kit | contracts+device | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/provider | render-provider-selection-kit | contracts+device | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/provider | render-provider-capability-kit | contracts+device | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/provider | render-provider-health-kit | contracts+device | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/provider | render-provider-fallback-kit | contracts+device | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/provider | render-provider-version-kit | contracts+device | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/provider | render-provider-integrity-kit | contracts+device | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/capture | render-capture-kit | frame+surface | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/capture | screenshot-kit | frame+surface | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/capture | video-frame-kit | frame+surface | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/capture | multi-view-capture-kit | frame+surface | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/capture | render-readback-kit | frame+surface | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/capture | capture-integrity-kit | frame+surface | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/xr | xr-render-device-kit | device+surface+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/xr | xr-view-kit | device+surface+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/xr | xr-swapchain-kit | device+surface+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/xr | xr-frame-timing-kit | device+surface+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/xr | xr-compositor-kit | device+surface+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/xr | xr-foveation-kit | device+surface+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/xr | xr-multiview-kit | device+surface+frame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/diagnostics | render-capability-report-kit | frame+provider | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/diagnostics | render-device-report-kit | frame+provider | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/diagnostics | render-resource-report-kit | frame+provider | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/diagnostics | render-frame-proof-kit | frame+provider | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/diagnostics | render-pass-report-kit | frame+provider | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/diagnostics | render-shader-report-kit | frame+provider | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/diagnostics | render-memory-report-kit | frame+provider | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/diagnostics | render-performance-kit | frame+provider | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/diagnostics | render-gpu-timing-kit | frame+provider | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/diagnostics | render-error-report-kit | frame+provider | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| n:render/diagnostics | render-debug-draw-kit | frame+provider | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:physics/reference | reference-physics-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:physics/reference | reference-collision-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:physics/reference | reference-solver-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:physics/reference | reference-query-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:physics/rapier | rapier-physics-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:physics/rapier | rapier-collision-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:physics/rapier | rapier-solver-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:physics/rapier | rapier-query-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:physics/rapier | rapier-debug-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:physics/physx | physx-physics-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:physics/physx | physx-collision-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:physics/physx | physx-solver-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:physics/physx | physx-query-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:physics/physx | physx-debug-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/headless | headless-render-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/headless | headless-resource-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/headless | headless-shader-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/headless | headless-frame-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/headless | render-golden-output-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/webgl2 | webgl2-device-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/webgl2 | webgl2-resource-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/webgl2 | webgl2-shader-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/webgl2 | webgl2-material-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/webgl2 | webgl2-pipeline-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/webgl2 | webgl2-scene-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/webgl2 | webgl2-frame-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/threejs | threejs-scene-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/threejs | threejs-resource-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/threejs | threejs-material-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/threejs | threejs-camera-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/threejs | threejs-light-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/threejs | threejs-effect-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/threejs | threejs-frame-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/openxr | openxr-device-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/openxr | openxr-resource-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/openxr | openxr-shader-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/openxr | openxr-swapchain-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/openxr | openxr-view-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/openxr | openxr-compositor-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/openxr | openxr-frame-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/android-xr | android-xr-device-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/android-xr | android-xr-surface-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/android-xr | android-xr-resource-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/android-xr | android-xr-compositor-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/android-xr | android-xr-frame-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/pcvr | pcvr-device-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/pcvr | pcvr-surface-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/pcvr | pcvr-resource-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/pcvr | pcvr-compositor-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| NexusEngine-Kits/n:render/pcvr | pcvr-frame-provider-kit | canonical provider contract | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
## 6. Evidence Register

| Evidence | Required location or proof |
|---|---|
| Domain ownership | domain.manifest.js, subdomain.manifest.js, generated ownership ledger |
| Kit contract | kit.manifest.js, source, public export, requires/provides tokens |
| Lifecycle | install/reset/snapshot/load/idempotency test report |
| Physics | collision, solver, queries, constraints, deterministic replay, provider report |
| Render | resource, shader, material, pipeline, frame, capture, browser/headless report |
| Composition | capability graph, plan hash, approval, receipt, repeat-apply report |
| Consumer | The Open Above lockfiles, screenshots/traces, clean-console and Human View report |
| Generated surfaces | catalog, package exports, MCP resources, Guide/PDF, migration map |
| Release | clean status, exact SHA, hosted checks, main and immutable 0.0.5 ref receipt |

## 7. Current-State Reconciliation

- Supplied Kit entries: 461.
- n:physics entries: 182.
- n:render entries: 229.
- NexusEngine-Kits provider entries: 50.
- Completed by this checklist: none.
- Repository implementation changes made: none.
- Main pushed by this checklist: no.
- 0.0.5 branch created: no.
- Current blocker: scope, public paths, and provider selection require approval before implementation.
- Environmental blockers: native provider proof requires the relevant SDKs, runners, and hardware where applicable.
- Next smallest action: approve or revise the canonical n:physics/n:render paths and the 461-entry inventory.

## 8. Final Completion Gate

- [ ] Every required domain and subdomain manifest validates.
- [ ] Every supplied Kit is implemented, merged with recorded rationale, or rejected with evidence.
- [ ] Every retained Kit has all seven columns complete.
- [ ] No duplicate semantic owner, private import, undeclared dependency, or forwarding export remains.
- [ ] Physics provider passes deterministic collision, solver, query, replay, restart, and failure gates.
- [ ] Render provider passes resource, shader, material, pipeline, frame, capture, resize, and recovery gates.
- [ ] The Open Above passes clean install, visible rendering, physical interaction, MCP composition, restart, disconnection, Playwright, Human View, clean-console, full released-feature coverage, and repeatable main-tracking rebuild proof.
- [ ] Generated registry, package exports, MCP, docs, PDF, and migration records agree.
- [ ] Final committed-SHA gates pass.
- [ ] Exact push approval is received.
- [ ] Approved SHA is fast-forwarded to main.
- [ ] Exact release approval is received; immutable origin/0.0.5 is created at the approved release SHA; Git HTTPS and jsDelivr `@0.0.5` imports pass.
- [ ] Main remains the default mutable development line, ready for work toward 0.0.6, while origin/0.0.5 remains frozen.
- [ ] 0.0.4 remains unchanged.

Master status: proposed, not complete.

Next required action: approve or revise the 461-entry scope before implementation.
