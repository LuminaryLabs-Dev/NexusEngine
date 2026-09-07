# Authoring implementation ledger

The attached plan is the task contract. Steps 01–10 record history, not new proof. The current run reconstructs source from the inspected baselines; old reported tests are not reused as current evidence. Step-level details below identify the implemented owner and the actual proof location. Publication steps remain pending until exact remote SHAs are verified.

| Step | Plan item | Current implementation / evidence |
| --- | --- | --- |
| 01 | Established the desired outcome | Historical context; current source-identity.json and baseline attempt records supersede old local results. |
| 02 | Defined Authoring as a Core domain | Historical context; current source-identity.json and baseline attempt records supersede old local results. |
| 03 | Examined reusable workflow patterns | Historical context; current source-identity.json and baseline attempt records supersede old local results. |
| 04 | Found the Physics Constraints prerequisite problem | Historical context; current source-identity.json and baseline attempt records supersede old local results. |
| 05 | Built stricter local development tooling | Historical context; current source-identity.json and baseline attempt records supersede old local results. |
| 06 | Built and tested an Authoring foundation locally | Historical context; current source-identity.json and baseline attempt records supersede old local results. |
| 07 | Proved a diagnostic GLB toolchain locally | Historical context; current source-identity.json and baseline attempt records supersede old local results. |
| 08 | Identified release blockers | Historical context; current source-identity.json and baseline attempt records supersede old local results. |
| 09 | Corrected the product focus | Historical context; current source-identity.json and baseline attempt records supersede old local results. |
| 10 | Lost access to the unpushed local checkout | Historical context; current source-identity.json and baseline attempt records supersede old local results. |
| 11 | Bind the repositories | Three exact main baselines, attached plan, ownership.md, goal.md and finite development harness attempts. |
| 12 | Freeze mutation boundaries | Three exact main baselines, attached plan, ownership.md, goal.md and finite development harness attempts. |
| 13 | Define the completion boundary | Three exact main baselines, attached plan, ownership.md, goal.md and finite development harness attempts. |
| 14 | Recover or reconstruct the earlier implementation | Three exact main baselines, attached plan, ownership.md, goal.md and finite development harness attempts. |
| 15 | Establish a target-specific development record | Three exact main baselines, attached plan, ownership.md, goal.md and finite development harness attempts. |
| 16 | Reproduce baseline failures before repair | Three exact main baselines, attached plan, ownership.md, goal.md and finite development harness attempts. |
| 17 | Restore and prove Physics Constraints | Physics Constraints contract, four new tests and five preserved Physics tests; constraints-reconstructed-1 nine-stage attempt. |
| 18 | Repair the concrete WebGPU ownership violation | Four external GPU providers in Kits; preserved provider fixtures; Core portable contracts; provider-contract.md. |
| 19 | Resolve browser and PDF prerequisites early | Actual Chromium 140 and regenerated 22-chapter PDF; explicit executable configuration. |
| 20 | Reconcile the obsolete Physics path assertion | Physics assertion already used canonical paths; obsolete Render path assertions repaired and tested. |
| 21 | Freeze one owner for each responsibility | src/core-domains/authoring: 19 kits, 18 children, Project source authority; generated capability ledger and public lifecycle proof. |
| 22 | Avoid a new general Workspace Core domain | src/core-domains/authoring: 19 kits, 18 children, Project source authority; generated capability ledger and public lifecycle proof. |
| 23 | Establish the common source layout | src/core-domains/authoring: 19 kits, 18 children, Project source authority; generated capability ledger and public lifecycle proof. |
| 24 | Preserve or reconstruct the four foundation identities | src/core-domains/authoring: 19 kits, 18 children, Project source authority; generated capability ledger and public lifecycle proof. |
| 25 | Create a capability ledger before expanding the implementation | src/core-domains/authoring: 19 kits, 18 children, Project source authority; generated capability ledger and public lifecycle proof. |
| 26 | Put the user entry point in the Engine README | README.md → AUTHORING.md → examples/authoring/first-edit.mjs; generated guide chapter. |
| 27 | Write root AUTHORING.md as the canonical usage guide | README.md → AUTHORING.md → examples/authoring/first-edit.mjs; generated guide chapter. |
| 28 | Rebuild the strict development harness | Editor src/headless/strict.js, development.js, tests/headless-strict.mjs; real nine-stage source/evidence verification. |
| 29 | Add the default Authoring host | Editor host, filesystem and browser stores, command router/stdio, Three provider; host/render/UI/CLI tests. |
| 30 | Keep Authoring off the Editor fallback runtime | Editor host, filesystem and browser stores, command router/stdio, Three provider; host/render/UI/CLI tests. |
| 31 | Add portable project storage through adapters | Editor host, filesystem and browser stores, command router/stdio, Three provider; host/render/UI/CLI tests. |
| 32 | Connect an actual preview | Editor host, filesystem and browser stores, command router/stdio, Three provider; host/render/UI/CLI tests. |
| 33 | Prove the first usable lifecycle | Editor host, filesystem and browser stores, command router/stdio, Three provider; host/render/UI/CLI tests. |
| 34 | Harden document identities and references | Project transactions/revisions/receipts/recovery; immutable mesh sharing and document-version persistence; foundation/public/host tests. |
| 35 | Complete command discovery and receipts | Project transactions/revisions/receipts/recovery; immutable mesh sharing and document-version persistence; foundation/public/host tests. |
| 36 | Complete transactions and dependency-safe edits | Project transactions/revisions/receipts/recovery; immutable mesh sharing and document-version persistence; foundation/public/host tests. |
| 37 | Replace full-document copying on hot paths | Project transactions/revisions/receipts/recovery; immutable mesh sharing and document-version persistence; foundation/public/host tests. |
| 38 | Implement Workspace and Editing context | Project transactions/revisions/receipts/recovery; immutable mesh sharing and document-version persistence; foundation/public/host tests. |
| 39 | Implement recovery and migration | Project transactions/revisions/receipts/recovery; immutable mesh sharing and document-version persistence; foundation/public/host tests. |
| 40 | Establish topology and attribute contracts | Mesh primitives/topology/stable attributes/evaluated geometry; geometry, integration and modeling tests. |
| 41 | Complete primitives and transforms | Mesh primitives/topology/stable attributes/evaluated geometry; geometry, integration and modeling tests. |
| 42 | Implement topology tools in dependency order | Mesh primitives/topology/stable attributes/evaluated geometry; geometry, integration and modeling tests. |
| 43 | Implement normals and evaluated mesh output | Mesh primitives/topology/stable attributes/evaluated geometry; geometry, integration and modeling tests. |
| 44 | Add meaningful mesh proof fixtures | Mesh primitives/topology/stable attributes/evaluated geometry; geometry, integration and modeling tests. |
| 45 | Implement curves and sweeps | Curve point edits, adaptive Bézier, parallel-transport sweeps; geometry tests and organic recipe. |
| 46 | Implement modifier documents and evaluation | Ten modifier algorithms and atomic apply; analytical CSG/BVH/modeling tests; worker stale-result tests. |
| 47 | Implement common brush mechanics | Brush/sculpt sampling, falloff, symmetry, masks and fixed-topology edits; geometry/modeling tests and donut recipe. |
| 48 | Implement sculpting | Brush/sculpt sampling, falloff, symmetry, masks and fixed-topology edits; geometry/modeling tests and donut recipe. |
| 49 | Implement UV authoring | UV/PBR/tiled paint, procedural color/normal bake; surfaces/modeling tests; five-role byte-checked PNG/GLB delivery. |
| 50 | Implement material authoring | UV/PBR/tiled paint, procedural color/normal bake; surfaces/modeling tests; five-role byte-checked PNG/GLB delivery. |
| 51 | Implement painting and baking | UV/PBR/tiled paint, procedural color/normal bake; surfaces/modeling tests; five-role byte-checked PNG/GLB delivery. |
| 52 | Implement rig documents | Rig/skin/animation source, constraints, weights, retarget/bake, shape keys; analytical and independent hierarchical Three deformation tests. |
| 53 | Implement skin documents and binding | Rig/skin/animation source, constraints, weights, retarget/bake, shape keys; analytical and independent hierarchical Three deformation tests. |
| 54 | Prove deformation | Rig/skin/animation source, constraints, weights, retarget/bake, shape keys; analytical and independent hierarchical Three deformation tests. |
| 55 | Implement animation documents | Rig/skin/animation source, constraints, weights, retarget/bake, shape keys; analytical and independent hierarchical Three deformation tests. |
| 56 | Implement poses, shape keys and clip arrangement | Rig/skin/animation source, constraints, weights, retarget/bake, shape keys; analytical and independent hierarchical Three deformation tests. |
| 57 | Implement retargeting and baking | Rig/skin/animation source, constraints, weights, retarget/bake, shape keys; analytical and independent hierarchical Three deformation tests. |
| 58 | Implement assembly authoring | Assembly shared assets/variants/camera/light/scatter and public trusted Composition trees; integration and recipes. |
| 59 | Implement domain-composition authoring | Assembly shared assets/variants/camera/light/scatter and public trusted Composition trees; integration and recipes. |
| 60 | Implement sequence authoring against current execution APIs | Finite Before/During/After Runtime sequence source and real receipt acknowledgement; direct and journal/reopen host proof; donut foundation sequence. |
| 61 | Compose bounded authoring workflows | Finite Before/During/After Runtime sequence source and real receipt acknowledgement; direct and journal/reopen host proof; donut foundation sequence. |
| 62 | Define the evaluated delivery packet | Immutable Publishing packet; actual GLB/PNG adapters, staging/sync/source guard; Khronos + independent Three/texture/deformation checks. |
| 63 | Complete the GLB adapter | Immutable Publishing packet; actual GLB/PNG adapters, staging/sync/source guard; Khronos + independent Three/texture/deformation checks. |
| 64 | Preserve textures and export provenance | Immutable Publishing packet; actual GLB/PNG adapters, staging/sync/source guard; Khronos + independent Three/texture/deformation checks. |
| 65 | Publish artifacts atomically | Immutable Publishing packet; actual GLB/PNG adapters, staging/sync/source guard; Khronos + independent Three/texture/deformation checks. |
| 66 | Verify output independently | Immutable Publishing packet; actual GLB/PNG adapters, staging/sync/source guard; Khronos + independent Three/texture/deformation checks. |
| 67 | Build the donut entirely through installed Authoring operations | 26-document donut, 180 seeded sprinkles, 17,408-vertex icing, fixed exact-artifact views; Editor asset/render evidence and review. |
| 68 | Implement deterministic surface scattering | 26-document donut, 180 seeded sprinkles, 17,408-vertex icing, fixed exact-artifact views; Editor asset/render evidence and review. |
| 69 | Review the donut using fixed evidence | 26-document donut, 180 seeded sprinkles, 17,408-vertex icing, fixed exact-artifact views; Editor asset/render evidence and review. |
| 70 | Build the additional proof assets | Mechanical and organic source recipes, exports, actual views and independent joint/shape sampling. |
| 71 | Add a minimal visual Authoring client | Canvas Presentation client invokes Core source commands; UI creation, selection, transforms, material, history, save/export, new/open/reopen tests. |
| 72 | Measure representative workloads | 15 fresh-process workloads and nine preview load/update repetitions; Editor performance JSON and docs/AUTHORING-PERFORMANCE.md. |
| 73 | Implement background work and stale-result protection | Bounded worker queue, cancellation, termination/restart, source guards and close; tests/authoring-jobs.mjs. |
| 74 | Prove batch generation separately | 1/10/100-job torus batch with five injected failures, 95 resume hits and distinct hashes/bounds; explicit structural/visual/global-intersection limits. |
| 75 | Check diversity and quality | 1/10/100-job torus batch with five injected failures, 95 resume hits and distinct hashes/bounds; explicit structural/visual/global-intersection limits. |
| 76 | Integrate tests into actual runners | Core 122-test runner, Editor nine Authoring groups plus headless/legacy suites, Kits provider tests all integrated. |
| 77 | Reconcile public manifests and generated records | Generated manifests/catalogs/ownership/public surfaces/guide/PDF, root AUTHORING guides, changelogs and provider lineage. |
| 78 | Finish documentation from tested behavior | Generated manifests/catalogs/ownership/public surfaces/guide/PDF, root AUTHORING guides, changelogs and provider lineage. |
| 79 | Run the complete Engine gate set | Final repository gates, source-boundary review and clean packed-consumer proof; see validation evidence captured at closure. |
| 80 | Run Editor and provider gates | Final repository gates, source-boundary review and clean packed-consumer proof; see validation evidence captured at closure. |
| 81 | Perform an architectural audit | Final repository gates, source-boundary review and clean packed-consumer proof; see validation evidence captured at closure. |
| 82 | Prove clean consumers before remote publication | Final repository gates, source-boundary review and clean packed-consumer proof; see validation evidence captured at closure. |
| 83 | Prepare the final commits and dependency order | Pending final commit order Engine A → Kits B → Editor C, fast-forward push and remote identity/consumer verification. |
| 84 | Publish Engine | Pending final commit order Engine A → Kits B → Editor C, fast-forward push and remote identity/consumer verification. |
| 85 | Publish provider migration | Pending final commit order Engine A → Kits B → Editor C, fast-forward push and remote identity/consumer verification. |
| 86 | Publish Editor integration | Pending final commit order Engine A → Kits B → Editor C, fast-forward push and remote identity/consumer verification. |
| 87 | Verify the delivered result | Pending final commit order Engine A → Kits B → Editor C, fast-forward push and remote identity/consumer verification. |
