SUMMARY — COMPLETE, VALIDATE AND DELIVER NEXUS AUTHORING

Goal
  Make Authoring easy to discover, start, operate, extend and embed.

  A person or agent should be able to:
    1. Find Authoring from the Engine README.
    2. Follow root AUTHORING.md.
    3. Start the real NexusEngine with the required Authoring kits.
    4. Create or open an editable project.
    5. Discover tools and execute domain commands.
    6. Inspect geometry, materials, dependencies and command results.
    7. Preview actual changes.
    8. Undo, redo, save, close and reopen.
    9. Build detailed assets through reusable operations.
   10. Export textured assets, rigs and animation to verified GLBs.
   11. Repeat workflows through authored sequences.
   12. Use the same operations from scripts and a visual editor.

Delivery
  Finish implementation, regression checks, documentation, packaging and
  exact-commit consumer proof before pushing the tested commits to main.

Execution policy
  Work continuously through the ordered packages below.
  Do not stop after scaffolding, manifests, a diagnostic exporter or one cube.
  Do not ask again for routine implementation choices covered by the plan.
  Repair failures inside the declared scope and rerun the affected checks.

  An uninterrupted successful delivery cannot be guaranteed in advance:
  inaccessible source, denied writes, unavailable required execution environments
  or unresolved incompatible changes remain real blockers. Record them honestly;
  never convert a failed or missing check into a pass to reach the push step.


PART 1 — WHAT WE HAVE ALREADY DONE, IN ORDER

01. Established the desired outcome
    Decision:
      Build attractive, editable 3D assets through Nexus domain tools.

    Direction selected:
      Portable JavaScript Authoring logic in NexusEngine.
      External providers for rendering, codecs, filesystem and native execution.

    Superseded option:
      A Blender worker was discussed initially.
      Blender execution is not the foundation of the selected native
      Authoring implementation.

02. Defined Authoring as a Core domain
    Proposed root:
      n:authoring

    Responsibilities:
      Editable documents and domain-specific editing operations.

    Intended capability families:
      Project, Editing, Mesh, Curve, Modifier, Brush, Sculpt, UV,
      Material, Paint, Rig, Skin, Animation, Domain Composition,
      Sequence Authoring, Assembly and Publishing.

    Later discussion:
      Workspace behavior may be a narrow Authoring child.
      No decision requires a separate root n:workspace domain.
      SimSpace was rejected as unnecessary terminology.

03. Examined reusable workflow patterns
    NexusGameKit:
      Tool discovery, bounded plans, revision checks, ordered execution,
      compact results and independent read-back validation.

    NexusSimulator:
      External headless adapter, isolated run folders and result artifacts.

    NexusEngine-Editor:
      Existing nine-stage finite evidence harness.

    Boundary:
      These patterns organize execution and evidence.
      They do not implement mesh editing, skinning or material authoring.

04. Found the Physics Constraints prerequisite problem
    Existing package:
      src/core-domains/physics/constraints/

    Scope:
      Ten constraint descriptors, break policy and registry lifecycle.

    Earlier local repair:
      Descriptor validation, numerical normalization, retry handling,
      registry mutations, body references, snapshots and proof manifests.

    Recorded earlier:
      Focused Constraints tests passed.
      The full Engine suite advanced to other existing failures.

    Current GitHub:
      The Constraints subdomain still declares pending proof.
      The earlier repair was not pushed.

05. Built stricter local development tooling
    Earlier local files:
      NexusEngine-Editor/src/headless/strict.js
      NexusEngine-Editor/src/headless/development.js
      NexusEngine-Editor/tests/headless-strict.mjs
      NexusEngine-Editor/tests/headless-development.mjs

    Behavior:
      Require real adapter methods and checks.
      Track actual submissions and results.
      Record command logs and source hashes.
      Reject missing verification or unverified claims.

    Current GitHub:
      These additions are absent.
      The original src/headless/index.js remains available.

06. Built and tested an Authoring foundation locally
    Four kit identities:
      authoring-domain-contract-kit
      authoring-project-document-kit
      authoring-mesh-document-kit
      authoring-editing-session-kit

    Recorded functionality:
      Documents, identities, revisions and content hashes.
      Atomic staged transactions.
      Retry receipts and stale-request rejection.
      Undo/redo and source serialization.
      Cube creation, selection and basic transforms.
      Geometry validation and disposable preview data.
      Public exports and manifest integration.

    Recorded limitations:
      Full snapshot copies.
      Bounded history and receipt retention.
      Initial 10,000-vertex / 20,000-face mesh profile.
      No advanced modeling, rig authoring or publishing workflow.

07. Proved a diagnostic GLB toolchain locally
    Earlier adapter:
      NexusEngine-Editor/src/authoring/glb-export.js

    Earlier test:
      NexusEngine-Editor/tests/authoring-export-spike.mjs

    Fixture:
      Four-vertex checker ribbon.
      Two joints.
      One bend animation.
      Embedded PNG texture.

    Recorded result:
      2,888-byte GLB.
      Zero Khronos validator errors and warnings.
      Independent Three.js loading and deformation check.
      Actual rest and bent renders.

    Boundary:
      The test supplied its own rig, weights and animation.
      It did not prove Authoring could create them.
      It was not a high-fidelity proof asset.

08. Identified release blockers
    Previously observed:
      Three concrete WebGPU implementations inside Engine Core.
      Editor browser environment unavailable.
      Current guide PDF could not be regenerated.
      Full clean-consumer and release validation incomplete.

09. Corrected the product focus
    Priority:
      Make Authoring usable.

    Required navigation:
      Engine README.md -> root AUTHORING.md -> working example.

    Required execution:
      Small default host starts the real runtime and installs selected kits.

    Required separation:
      Authoring owns editable source.
      Other domains retain their existing authority.
      The host supplies environment access.

10. Lost access to the unpushed local checkout
    Cause:
      Automated workspace maintenance.

    Current evidence:
      GitHub branches remain at their earlier commits.
      No Authoring folder exists in the inspected Engine tree.
      The current attachment contains discussion and inventory, not source code.
      Initial recovery searches did not establish a recoverable source archive.

    Consequence:
      Historical test results guide reconstruction.
      They cannot certify newly reconstructed code.


PART 2 — EXACT TARGETS AND SCOPE

11. Bind the repositories

    PRIMARY IMPLEMENTATION
      Repository: LuminaryLabs-Dev/NexusEngine
      Branch: main
      Inspected commit:
        bacc8fc0073bf92910e26776a6695d2b8ec45858
      Package metadata:
        nexusengine 0.0.4

      Changes:
        Authoring Core.
        Public contracts and exports.
        Constraints prerequisite repair.
        Removal of misplaced concrete provider ownership.
        Integration tests, examples, documentation and generated records.

    EDITOR AND LOCAL EXECUTION
      Repository: LuminaryLabs-Dev/NexusEngine-Editor
      Branch: main
      Inspected commit:
        2c87650436c332324f6c74d87f774a152e3aa8a2

      Changes:
        Real Authoring startup.
        Command transport.
        Project storage adapters.
        Strict development harness.
        Preview and export integration.
        Visual Authoring client.
        Exact Engine/provider dependency pins.

    PROVIDER OWNERSHIP REPAIR
      Repository: LuminaryLabs-Dev/NexusEngine-Kits
      Branch: main
      Inspected commit:
        2ef76f03c9f9713415bf9cc22757319058a0ef47

      Reason this repository is included:
        Engine's current ownership rules place concrete runtime providers here.
        Moving WebGPU execution here is a real prerequisite repair, not an
        exception added to the boundary checker.

      Changes:
        Narrow provider implementation and public export additions.
        Provider lifecycle and compatibility tests.
        Relevant package/catalog/documentation integration.

    READ-ONLY REFERENCES
      LuminaryLabs-Dev/NexusSimulator
        82ef06fc4e1c45ccf90d1b81b3e0aa44444786c9

      LuminaryLabs-Dev/NexusGameKit
        8bd8e704a867a3eccc14d4202e105cfb2e6f5586

12. Freeze mutation boundaries

    Include:
      The implementation, prerequisite repairs, integration, documentation,
      tests and final main-branch pushes described in this plan.

    Preserve:
      Existing compatible Engine and Editor behavior.
      Editor project format 0.4.0 import compatibility.
      Existing Composition registry contracts.
      Existing game-building/export workflows.
      Historical release records and frozen refs.

    Exclude:
      Google Drive changes.
      New GitHub Actions workflows.
      Test branches or pull requests.
      Tags, npm publication or GitHub Releases.
      Rewriting frozen 0.0.4 or creating a release branch.
      Unrelated Physics, Render or game-feature expansion.
      Blanket replacement of the existing Editor.

    Git delivery:
      One final commit per changed repository.
      Normal fast-forward pushes to main.
      No force pushes.
      Announce the exact repository and action immediately before each push.

13. Define the completion boundary

    Required in this delivery:
      All Authoring capability families listed in this plan.
      Explicit supported operation profiles.
      Headless startup and public APIs.
      Minimal usable visual Authoring workflow.
      Donut workflow.
      Detailed mechanical and organic/rigged proof assets.
      Textured, rigged, animated GLB output.
      Recovery, cancellation, replay and batch evidence.
      README/AUTHORING.md usability.
      Passing applicable repository gates.
      Verified remote commits.

    Separate future tracks:
      Full Blender interface parity.
      Arbitrary Blender shader/node compatibility.
      Real-time multi-user editing and conflict merging.
      Production deployment for hundreds of thousands of scenes.
      Independently verified FBX support.

    These remain visible roadmap items.
    Completing this delivery must not imply those future tracks are complete.


PART 3 — RECOVERY AND EARLY PREREQUISITES

14. Recover or reconstruct the earlier implementation

    Actions:
      Search for the exact earlier source archives, patches and evidence.
      Inspect relevant surviving task artifacts before rebuilding.
      Compare recovered files against their recorded base commits.
      Preserve recovered source independently from newly reconstructed files.

    If source is unavailable:
      Reconstruct from the known contracts and regression cases.
      Label it reconstructed.
      Generate fresh evidence for every claimed behavior.

    Restore/rebuild:
      Constraints repair and tests.
      Strict headless harness and development adapter.
      Four-kit Authoring foundation.
      Diagnostic GLB adapter and test.

    Done when:
      Every recovered/rebuilt component has readable source, a known base,
      a current file inventory and fresh passing focused tests.

15. Establish a target-specific development record

    Use:
      .agent/runs/<authoring-completion-run>/

    Record:
      goal.md
      plan.md
      ownership.md
      capability-ledger.json
      source-identity.json
      validation-plan.json
      attempts/
      report.md

    Identity:
      Repository SHAs.
      Package and lockfile hashes.
      Node version.
      Renderer and browser versions.
      Dependency provenance.
      Input proposal identity.

    Preserve:
      Existing global target and historical tracker records.
      Do not relabel the old 0.0.4 finalization tracker as Authoring evidence.

    Workflow:
      Use the user-approved finite headless harness.
      Do not make the unavailable persistent controller a new prerequisite.

    Checkpoints:
      Retain source hashes, changes and evidence after each completed package.
      Before any unavoidable pause, produce a recoverable checkpoint using
      an available authorized durable mechanism; never assume scratch survives.

16. Reproduce baseline failures before repair

    Engine:
      npm ci --ignore-scripts --no-audit --no-fund
      npm test
      npm run core:check
      npm run core:contracts
      npm run boundaries:check
      npm run docs:check

    Editor:
      npm ci --ignore-scripts --no-audit --no-fund
      npm run smoke:intent
      npm run build
      npm run smoke:playwright

    Kits:
      Run its existing dependency, generated-catalog, ownership and test checks.

    Record:
      Exact command, exit status, relevant log and changed files.

    Do not:
      Claim historical failures were reproduced without running them.
      Delete tests or loosen assertions to produce a green baseline.

17. Restore and prove Physics Constraints

    Production scope:
      src/core-domains/physics/constraints/constraints-contracts.js
      src/core-domains/physics/constraints/atomic-constraint-kit.js
      src/core-domains/physics/constraints/kits/
      src/core-domains/physics/constraints/subdomain.manifest.js

    Required proof:
      Ball-socket and fixed attachment frames.
      Hinge/slider axes and ordered limits.
      Cone-twist ranges.
      Distance boundaries.
      Spring stiffness, damping and mode.
      Limit ranges and mode.
      Motor/drive targets and force or torque.
      Break thresholds and terminal broken state.
      Registry lifecycle, revisions, retries and recovery.

    Regression cases:
      Nonfinite input and normalization overflow.
      Sparse arrays.
      Unsafe integer counters.
      Missing/identical body references.
      Unusual record IDs.
      Conflicting request IDs.
      Stale revisions.
      Invalid mutations preserving state.
      Malformed snapshots preserving current state.
      Raw inherited mutation bypasses.

    Tests to recover or recreate:
      tests/core-domains/core-physics-constraints-descriptors.mjs
      tests/core-domains/core-physics-constraints-registry.mjs
      tests/core-domains/core-physics-constraints-integration.mjs
      tests/core-domains/core-physics-constraints-public.mjs
      tests/helpers/physics-constraints-fixture.mjs

    Documentation:
      src/core-domains/physics/constraints/CONTRACT.md

    Boundaries:
      Constraints owns data and lifecycle rules, not motion solving.
      Keep the explicit body-detachment guard accurately documented.

    Done when:
      All twelve kits have passing focused evidence.
      Relevant existing Physics tests pass.
      Proof references point to tests in the actual runner.
      Catalog generation succeeds.

18. Repair the concrete WebGPU ownership violation

    Existing Engine files requiring disposition:
      src/core-domains/host/gpu/webgpu/index.js
      src/core-domains/render/execution/gpu/webgpu/index.js
      src/core-domains/render/execution/gpu/webgpu/frame-executor.js

    Verified behavior in these files:
      Browser GPU access.
      Buffer/texture allocation.
      Shader and pipeline creation.
      Command encoding and queue submission.

    Actions:
      Inventory every import, export, test and consumer before moving code.
      Retain portable Host/Render contracts in Engine.
      Move concrete implementation into NexusEngine-Kits.
      Require explicit provider injection where Core currently constructs one.
      Update affected tests and consumers to public provider imports.
      Document changed source-level integration points.

    Proposed provider locations:
      adapters/gpu/webgpu/host-provider.js
      adapters/gpu/webgpu/render-provider.js
      adapters/gpu/webgpu/frame-executor.js

    Proposed public provider entry:
      @luminarylabs/nexusengine-kits/providers/webgpu

    These locations and this entry are planned additions.
    They are not existing public APIs.

    Proof:
      Existing GPU behavior remains covered after relocation.
      Shared resource ownership remains correct.
      Start, dispose, device loss and supported recovery work.
      Core boundary check passes without new exclusions.
      Provider swaps do not mutate authoritative Authoring documents.

    Relevant existing tests to inspect:
      tests/core-domains/core-gpu-host-smoke.mjs
      tests/core-domains/core-gpu-shared-resource-smoke.mjs
      tests/core-domains/core-gpu-unified-frame-smoke.mjs

19. Resolve browser and PDF prerequisites early

    Actions:
      Install the browser version required by the selected Playwright version.
      Prove browser launch and a localhost smoke before depending on it.
      Prepare headless Three.js and its selected rendering backend.
      Prove a real image render.
      Prove guide PDF generation with the supported browser.

    Historical diagnostic pins to evaluate:
      three 0.180.0
      @gltf-transform/core 4.5.0
      gltf-validator 2.0.0-dev.3.10
      pngjs 7.0.0
      @headless-three/renderer 0.4.0

    Rule:
      Reuse these versions only after dependency and compatibility checks.
      Record any replacement versions and rerun the relevant proof.

    Failure handling:
      Missing browser binaries can be installed.
      A process/socket restriction is an environment limitation.
      Native rendering success does not count as browser success.
      An old PDF passing a structural check does not make its content current.

20. Reconcile the obsolete Physics path assertion

    Existing test:
      tests/core-domains/core-physics-canonical-domain-contract-smoke.mjs

    Earlier mismatch:
      Expected /physics/subdomains/contracts/kits/
      Actual /physics/contracts/kits/

    Action:
      Inspect its intended contract against the current manifests.
      Correct obsolete path expectations only if the current source confirms
      they are stale.
      Preserve the behavioral assertions.
      Record whether the test belongs in the normal runner.

    Done when:
      The test validates the intended public contract rather than an obsolete
      source-tree arrangement.


PART 4 — AUTHORING OWNERSHIP AND FILE STRUCTURE

21. Freeze one owner for each responsibility

    Authoring Project:
      Authoritative editable documents.
      Atomic document commits.
      Document revisions and content identities.
      Cross-document change journal.

    Authoring Workspace:
      Open-document references.
      Active document.
      Editing context.
      References to named views and tool settings.
      No duplicate mesh/material/rig contents.

    Authoring Editing:
      Selection, active tools, previews and user edit operations.
      Submit document changes through Project.

    Specialized Authoring children:
      Own schemas, algorithms, validation and typed operations for their
      document kinds.

    Runtime:
      Engine installation and execution lifecycle.
      Existing generic data, transaction and persistence contracts.

    Composition:
      Existing kit discovery, dependency and composition validation.

    Sequence execution:
      Current n:runtime:sequence.
      Authoring edits definitions and supplies registered operation leaves.

    Asset:
      Published content identities, dependencies and asset contracts.

    Object:
      Published object identity, placement and runtime representation.

    Presentation:
      Visible meaning, materials, cameras, lights and UI descriptors.

    Render/Host/providers:
      Portable execution boundaries and concrete realization.

    Editor:
      Environment startup, transport, storage adapters and interface.
      No competing authoritative Authoring document store.

22. Avoid a new general Workspace Core domain

    Selected initial direction:
      n:authoring:workspace

    Decision:
      Workspace is a narrow Authoring capability in this plan.
      No SimSpace abstraction.
      No separate runtime owned by Workspace.
      No requirement to create a new root n:workspace.

    Validation:
      Opening another document changes workspace state.
      It does not duplicate or rewrite the document.
      Workspace restoration validates all referenced documents.

23. Establish the common source layout

    Engine root additions:
      AUTHORING.md
      docs/authoring/architecture.md
      docs/authoring/commands.md
      docs/authoring/documents.md
      docs/authoring/compatibility.md
      docs/authoring/validation.md
      docs/authoring/limits.md

    Engine root updates:
      README.md
      docs/README.md
      CHANGELOG.md
      package.json
      src/core-domains/index.js
      tests/run-all.mjs
      Relevant guide source chapters and book configuration.

    Authoring root:
      src/core-domains/authoring/AGENTS.md
      src/core-domains/authoring/domain.manifest.js
      src/core-domains/authoring/index.js
      src/core-domains/authoring/contracts/
      src/core-domains/authoring/kits/authoring-domain-contract-kit/

    Children:
      project/
      workspace/
      editing/
      mesh/
      curve/
      modifier/
      brush/
      sculpt/
      uv/
      material/
      paint/
      rig/
      skin/
      animation/
      assembly/
      domain-composition/
      sequence/
      publishing/

    Each child:
      index.js
      subdomain.manifest.js
      contracts for its supported data
      implementation modules grouped by actual responsibility
      kits/<atomic-kit-id>/index.js
      kits/<atomic-kit-id>/kit.manifest.js

    Do not:
      Create empty state/provider/adapter folders for appearance.
      Put every operation in one giant manager.
      Mark a family implemented merely because its folder exists.

    Manifest rule:
      Every public kit declares owner, dependencies, API identity,
      public subpath and relevant passing proof.

24. Preserve or reconstruct the four foundation identities

    Root:
      authoring-domain-contract-kit
      createAuthoringDomainContractKit
      n:authoring
      engine.n.authoring

    Project:
      authoring-project-document-kit
      createAuthoringProjectDocumentKit
      n:authoring:project
      engine.n.authoringProject

    Mesh:
      authoring-mesh-document-kit
      createAuthoringMeshDocumentKit
      n:authoring:mesh
      engine.n.authoringMesh

    Editing:
      authoring-editing-session-kit
      createAuthoringEditingSessionKit
      n:authoring:editing
      engine.n.authoringEditing

    Proposed public installation:
      nexusengine/domains/authoring

    Proposed selected imports:
      nexusengine/domains/authoring/contract
      nexusengine/domains/authoring/project
      nexusengine/domains/authoring/mesh
      nexusengine/domains/authoring/editing

    Status:
      These were earlier local identities.
      They are absent from the inspected published repository tree.

25. Create a capability ledger before expanding the implementation

    One row per actual capability:
      ID.
      Owning domain.
      Kit and public import.
      Command/query name.
      Input/output schema.
      Dependencies.
      Supported cases.
      Unsupported cases.
      Source files.
      Tests.
      Example.
      Maturity.
      Current evidence identity.

    Distinguish:
      Planned.
      Implemented but unverified.
      Verified in a declared profile.
      Unsupported.
      Blocked.

    Prohibit:
      Whole-domain "complete" labels derived from aggregate folder counts.


PART 5 — MAKE AUTHORING DISCOVERABLE AND RUNNABLE

26. Put the user entry point in the Engine README

    Update:
      README.md -> Start Here

    Add:
      A prominent "Create and edit with Authoring" link to AUTHORING.md.
      A short description of headless and embedded use.
      Link to the tested startup example.

    Preserve:
      Existing runtime, build, ownership and release navigation.

    Done when:
      A new reader can reach a working Authoring example in one link.

27. Write root AUTHORING.md as the canonical usage guide

    Sections:
      What Authoring does.
      Current supported capabilities.
      Install and version requirements.
      Quickstart.
      Start with the default local host.
      Embed with createEngine.
      Discover tools.
      Create/open projects.
      Select and edit objects and mesh elements.
      Read receipts and validation failures.
      Preview.
      Undo/redo.
      Save/reopen.
      Export GLB.
      Compose domains and author sequences.
      Extend with another kit.
      Limits and troubleshooting.
      Links to detailed docs and proof examples.

    Rules:
      All commands must be exercised by tests.
      Every example uses public package imports.
      Proposed or unsupported features must be labeled.
      Include AUTHORING.md in package.json files.
      Redirect or consolidate the old docs/AUTHORING.md location if recovered.

28. Rebuild the strict development harness

    Restore:
      src/headless/strict.js
      src/headless/development.js
      tests/headless-strict.mjs
      tests/headless-development.mjs
      docs/HEADLESS-DEVELOPMENT.md

    Keep existing:
      src/headless/index.js

    Required acceptance:
      All required stages execute.
      Mutation mode submits real commands.
      Verification mode runs declared checks.
      Execution and observation refer to the same attempt.
      No missing required checks.
      No failed checks.
      No unverified completion claims.
      Final differences are inspected.

    Negative proof:
      Empty adapter.
      Missing verification.
      Failed command.
      Stale source hash.
      Conflicting attempt reuse.
      Missing evidence.
      Interrupted execution.

29. Add the default Authoring host

    Proposed Editor files:
      src/authoring/index.js
      src/authoring/host.js
      src/authoring/runtime-composition.js
      src/authoring/command-router.js
      src/authoring/transports/stdio.js
      scripts/nexus-authoring.mjs

    Proposed package export:
      @luminarylabs/nexusengine-editor/authoring

    Proposed executable:
      nexus-authoring

    Proposed CLI surface:
      nexus-authoring init <directory>
      nexus-authoring open <directory> --stdio
      nexus-authoring tools <directory>
      nexus-authoring run <directory> --commands <file>
      nexus-authoring preview <directory>
      nexus-authoring export <directory> --format glb --output <directory>
      nexus-authoring doctor <directory>

    These are implementation targets, not current commands.

    Startup:
      Import real createEngine from nexusengine.
      Install explicitly selected, manifest-backed kits.
      Assert required domain paths, API owners and methods.
      Connect selected providers.
      Load and validate project source.
      Return a readiness receipt.

    Lifecycle:
      New/open -> ready -> operating -> closing -> closed.
      Failed startup releases resources already acquired.
      Closing rejects new commands, cancels or finishes permitted jobs,
      saves only according to the explicit save policy and disposes resources.

    Do not:
      Install every optional capability by default.
      Start a perpetual tick loop for static editing.
      Require a server for in-process or stdio operation.

30. Keep Authoring off the Editor fallback runtime

    Existing file:
      src/nexus-engine-editor-runtime.js

    Existing issue:
      createFallbackNexusEngine supplies an alternative engine-shaped object.
      An existing intent test expects fallback:compatible-nexusengine.

    Action:
      Make the Authoring path require the canonical installed Engine.
      An unavailable/incompatible Engine produces a clear startup failure.
      Do not silently enter the fallback.

    Existing Editor:
      Preserve its unrelated behavior while migrating shared paths deliberately.
      Update fallback-related assertions only where the tested behavior actually
      changes to canonical runtime execution.

    Also reconcile:
      The old hardcoded CDN Engine SHA.
      The package dependency SHA.
      The lockfile resolution.
      The build's vendored/runtime source identity.

    Done when:
      A causal test proves the real Engine owns Authoring mutations.
      Removing the canonical dependency makes startup fail clearly.
      Existing legacy workflows still pass their preservation checks.

31. Add portable project storage through adapters

    Proposed files:
      src/authoring/storage/file-project.js
      src/authoring/storage/browser-project.js
      src/authoring/storage/project-package.js

    Proposed on-disk package:
      project.json
      documents/<stable-document-id>.json
      blobs/<content-hash>
      checkpoints/<checkpoint-id>.json
      journal/
      exports/

    project.json:
      Format version.
      Project ID.
      Document index.
      Content references.
      Required kit identities and compatible versions.
      Saved workspace reference.
      Units and coordinate convention.
      Latest durable checkpoint identity.

    File adapter:
      Validate and stage complete writes.
      Publish a new manifest only after referenced content is durable.
      Preserve the previous valid manifest during failure.
      Prevent concurrent writers from silently overwriting each other.
      Validate resolved paths remain inside the selected project boundary.

    Browser adapter:
      Use a declared persistent store.
      Report quota/permission failures.
      Do not silently report a memory-only fallback as saved.

    Proof:
      Close/reopen equivalence.
      Crash during staged save.
      Missing/corrupt blob.
      Truncated manifest.
      Conflicting writers.
      Unsupported newer project schema.

32. Connect an actual preview

    Proposed files:
      src/authoring/preview/project-preview.js
      src/authoring/preview/localhost-server.js
      tests/authoring-preview.mjs

    Flow:
      Authoring document revision
      -> evaluated geometry/material data
      -> existing Object/Asset/Presentation contracts
      -> immutable provider packet
      -> actual rendered frame and receipt

    Rules:
      Provider receives no full Engine or mutable Project object.
      Camera, lights and materials come from descriptors.
      Preview caches identify their source revisions.
      Stale evaluation results never replace newer output.

    Local verification:
      Run exact local source on localhost.
      Use headless Three.js to render that local build.
      Capture dimensions, camera, source revision and artifact hash.

33. Prove the first usable lifecycle

    Example:
      examples/authoring/first-edit.mjs

    Tests:
      Engine: tests/core-domains/core-authoring-foundation.mjs
      Editor: tests/authoring-host.mjs
      Editor: tests/authoring-project-storage.mjs

    Required workflow:
      Start.
      Create cube.
      Select top face.
      Move it.
      Inspect resulting bounds.
      Undo.
      Redo.
      Save.
      Close.
      Reopen.
      Verify geometry and references.
      Render.
      Dispose.

    Done when:
      The README/guide instructions reproduce this workflow in a clean consumer.


PART 6 — COMPLETE DOCUMENT, COMMAND AND WORKSPACE CONTRACTS

34. Harden document identities and references

    Document envelope:
      Document ID and kind.
      Schema version.
      Revision.
      Content hash.
      Typed content or content-addressed chunk references.
      Dependencies with explicit latest/exact revision policy.

    Rules:
      Stable identity survives editing.
      Revisions do not become valid again after undo, reset or restore.
      Hashes are canonical and exclude irrelevant timestamps.
      Nonfinite data, sparse arrays and unsafe counters reject.
      Unusual IDs cannot invoke object-prototype behavior.

    Dependencies:
      Detect missing documents and cycles where prohibited.
      Track reverse dependencies.
      Invalidate only affected evaluated results.
      Rebase exact references deliberately during restoration.

35. Complete command discovery and receipts

    Each operation describes:
      Domain path.
      Operation ID and schema version.
      Parameters and defaults.
      Target document kinds.
      Required kits.
      Expected revisions.
      Read/write effects.
      Supported profile.
      Cost category.
      Cancellation behavior.
      Result schema and errors.

    Each receipt records:
      Request ID and canonical input hash.
      Accepted/executing/completed/failed/cancelled state.
      Before/after revisions.
      Changed elements and attribute mappings.
      Validation results.
      Evidence references.
      Recovery/checkpoint reference.
      Explicit warnings.

    Transport:
      Match every reply to its request.
      Preserve structured errors.
      Bound input size and queued work.
      Keep large geometry and images out of routine receipts.

36. Complete transactions and dependency-safe edits

    Actions:
      Validate all required source revisions.
      Stage all document changes.
      Validate the complete prospective state.
      Commit once.
      Emit committed facts only after success.

    Cross-document examples:
      Mesh topology and skin remapping.
      Rig hierarchy and animation references.
      Material assignment and texture references.
      Assembly deletion and dependent selection cleanup.

    Proof:
      Failure in the second operation leaves the first unapplied.
      No receipt/history/event implies success after rollback.
      Concurrent stale work rejects before commit.

37. Replace full-document copying on hot paths

    Actions:
      Use immutable/chunked geometry and image content where beneficial.
      Store edit deltas and periodic checkpoints.
      Read compact summaries without cloning complete projects.
      Transfer worker payloads through explicit ownership contracts.
      Bound history and receipt retention by policy.

    Retry retention:
      Do not silently evict a request and later apply it again.
      Use explicit session epochs, archival receipts or retention errors.

    Proof:
      A small edit does not copy all unrelated documents or textures.
      Undo/redo restores content and maintains revision safety.
      Memory behavior is measured.

38. Implement Workspace and Editing context

    Workspace operations:
      Open/close document reference.
      Set active document.
      Set editing mode.
      Store named view references.
      Query dirty/save state through the owning document/store.
      Restore supported workspace preferences.

    Editing operations:
      Object/vertex/edge/face selection.
      Add/remove/toggle selection.
      Selection expansion, contraction, loops and connected regions.
      Active tool and explicit target.
      Preview/accept/cancel.

    Preview acceptance:
      Compare against the revision used to create the preview.
      Reject stale acceptance.
      Publish through normal Project transactions.

    Proof:
      Multiple documents remain independent.
      Closing a view does not delete source.
      Selection survives supported topology mappings or becomes explicitly invalid.

39. Implement recovery and migration

    Required:
      Versioned source formats.
      Explicit migration steps.
      Validation before current state replacement.
      Recovery from the last complete checkpoint plus validated journal.
      Deterministic replay where declared.

    Tests:
      Old supported schema.
      Unsupported future schema.
      Corrupt journal.
      Missing references.
      Duplicated operations after restart.
      Revision overflow.
      Recovery after cancellation.


PART 7 — COMPLETE MESH AUTHORING

40. Establish topology and attribute contracts

    Mesh:
      Stable vertices, edges, faces and corners/loops.
      Ordered face boundaries.
      Boundary and adjacency queries.
      Declared handling of manifold/open/nonmanifold inputs.

    Attributes:
      Vertex: positions, colors, masks, skin influences, shape-key data.
      Edge: crease and seam data.
      Face: material assignment and face sets.
      Corner: UVs and split-normal/tangent-related data.

    Topology result:
      Created, retained and removed element IDs.
      Source-to-result mapping.
      Attribute interpolation/copy/removal rules.
      Affected dependency IDs.

    Rule:
      A topology operation must not silently discard UVs, weights or shape keys.
      If a mapping is unsupported, reject before mutation with a precise reason.

41. Complete primitives and transforms

    Required primitives:
      Plane/grid.
      Box.
      Circle/disc.
      Cylinder/cone.
      Sphere.
      Torus.

    Transform tools:
      Translation.
      Quaternion/axis rotation.
      Scale.
      Pivot and coordinate frame.
      Object/local/world interpretation.
      Proportional falloff.
      Explicit mirrored/negative-scale winding behavior.
      Singular-transform rejection.

    Tests:
      Analytical counts/bounds.
      Expected orientation.
      Attribute preservation.
      Direct/installed equivalence.
      Deterministic IDs.

42. Implement topology tools in dependency order

    First:
      Delete.
      Duplicate/extract.
      Split.
      Merge/weld.
      Fill.
      Triangulate.

    Then:
      Extrude.
      Inset.
      Bridge.
      Edge subdivision.
      Loop cut.

    Then:
      Dissolve.
      Knife/cut.
      Bevel.

    Each operation:
      Define supported input topology.
      Validate geometric degeneracy and self-intersection risks.
      Preserve or remap attributes.
      Provide deterministic output.
      Support undo/redo.
      Return compact changed-element evidence.

    Do not:
      Implement triangulation only for convex polygons and label it general.
      Implement one-edge bevel and claim unrestricted bevel support.
      Substitute hardcoded donut meshes for missing operations.

43. Implement normals and evaluated mesh output

    Required:
      Face normals.
      Smooth/sharp boundaries.
      Split corner normals.
      Winding repair within an explicit profile.
      Tangent generation compatible with the selected normal-map convention.
      Render/export vertex splitting at UV, normal and material boundaries.

    Proof:
      Shared source vertices can produce distinct evaluated corner vertices.
      Seams and hard edges survive export.
      Tangent orientation is checked on mirrored UV fixtures.

44. Add meaningful mesh proof fixtures

    Tests:
      tests/core-domains/core-authoring-mesh-topology.mjs
      tests/core-domains/core-authoring-mesh-attributes.mjs
      tests/core-domains/core-authoring-mesh-operations.mjs

    Fixtures:
      Closed cube.
      Open grid.
      Concave polygon.
      Holed/boundary geometry within declared support.
      UV seam.
      Multiple materials.
      Weighted mesh.
      Invalid nonmanifold and self-intersecting cases.

    Done when:
      Every advertised mesh operation has direct, installed, history and
      dependent-attribute proof.


PART 8 — CURVES, MODIFIERS, SCULPTING AND SURFACES

45. Implement curves and sweeps

    Required:
      Polyline and cubic Bézier source.
      Control-point and handle editing.
      Open/closed curves.
      Resolution/tolerance-controlled evaluation.
      Profile sweep.
      Stable frames along a path.
      Caps and UV generation.

    Proof:
      Straight, bent, closed and near-degenerate paths.
      No unexpected frame flips.
      Deterministic evaluated meshes.

46. Implement modifier documents and evaluation

    Source:
      Ordered modifier stack.
      Typed parameters.
      Referenced documents.
      Enabled state.
      Source revisions and evaluation keys.

    Operations:
      Add/remove/reorder/configure.
      Evaluate.
      Apply to source through a transaction.
      Preserve source when only previewing.

    Required modifiers:
      Mirror with seam merge.
      Array.
      Subdivision.
      Solidify.
      Smoothing.
      Shrinkwrap/surface fitting.
      Deformation.
      Boolean.
      Decimation.
      Remeshing.

    Implementation standards:
      Specify the algorithm and supported profile per modifier.
      Test boundary rules and attribute propagation.
      For subdivision, explicitly define crease and boundary behavior.
      For Boolean/remeshing, define tolerance and topology limits.
      Do not relabel bounding-box approximations as real mesh operations.

47. Implement common brush mechanics

    Shared behavior:
      Stroke samples.
      Spacing.
      Radius and strength.
      Pressure.
      Falloff.
      Symmetry.
      Masks.
      Affected-region queries.
      Deterministic stroke replay.

    Ownership:
      One shared Brush vocabulary.
      Sculpt, texture paint and weight paint consume it.
      Avoid three independent stroke engines.

48. Implement sculpting

    Required brushes:
      Grab.
      Inflate/deflate.
      Smooth.
      Flatten.
      Mask.

    Required source behavior:
      Sculpt layers or explicit reversible deltas.
      Layer strength.
      Commit/cancel.
      Mesh revision validation.
      Defined treatment of normals and dependent attributes.

    Proof:
      Localized edits.
      Symmetry.
      Mask preservation.
      Replayed stroke equivalence.
      Stale stroke rejection.
      Undo restores source.

49. Implement UV authoring

    Required:
      Per-corner UV storage.
      Seam marking.
      Planar, cylindrical and spherical projection.
      Seam-based unwrapping for the declared mesh profile.
      Island detection.
      Island transforms.
      Deterministic packing with padding.
      Stretch/overlap diagnostics.

    Proof:
      Known checker texture.
      Seam discontinuity preserved.
      Padding measured in texels at declared output resolution.
      Intentional overlaps distinguished from accidental overlaps.

50. Implement material authoring

    Required material model:
      Base color.
      Metallic.
      Roughness.
      Normal map.
      Occlusion.
      Emissive.
      Alpha mode and cutoff.
      Double-sided policy.
      Texture sampler and UV-set references.

    Procedural source:
      Typed material graph for the supported node subset.
      Graph validation and dependency tracking.
      Deterministic evaluation/baking.

    Boundaries:
      Source material graph remains editable.
      Publishing converts supported semantics to delivery materials.
      Unsupported nodes produce explicit errors or a declared bake operation.
      No claim of arbitrary Blender-node compatibility.

51. Implement painting and baking

    Required:
      Image documents.
      Layers and blend modes.
      Fill.
      Brush paint.
      Clone/source sampling.
      Vertex colors.
      Masks.
      Base-color and supported material-channel baking.
      Standalone texture output.

    Image contracts:
      Dimensions.
      Channel format.
      Color-space meaning.
      Tile/chunk identity.
      Layer order.
      Dirty regions.

    Proof:
      Exact brush footprints on analytical fixtures.
      Color-space-aware blending.
      UV seam handling.
      Deterministic bake results.
      Cancellation leaves source and published output unchanged.


PART 9 — RIGGING, SKINNING AND ANIMATION

52. Implement rig documents

    Required:
      Stable bone IDs.
      Parent hierarchy.
      Rest transforms.
      Bone creation, deletion, rename and reparent.
      Local/global transform conversion.
      Cycle and invalid-reference rejection.

    Controls/constraints:
      Transform limits.
      Copy-transform constraints.
      Look-at.
      A bounded IK implementation with documented chain support.

    Boundary:
      Rig constraints are deformation/pose semantics.
      Do not mix them with n:physics:constraints.

53. Implement skin documents and binding

    Required:
      Mesh and rig references.
      Bind transforms.
      Inverse bind matrices.
      Sparse source influences.
      Weight validation and normalization.
      Explicit unweighted-vertex policy.

    Editing:
      Assign/remove influence.
      Normalize.
      Smooth.
      Mirror.
      Lock influences.
      Brush-based weight editing.

    Automatic weighting:
      Provide a real deterministic algorithm.
      Name its method and limitations.
      Validate it on more than one rig shape.
      Do not claim production-quality automatic weights from nearest-bone
      assignment alone.

    Publishing:
      Source can retain more influences than a delivery profile permits.
      Influence reduction is explicit, measured and reported.

54. Prove deformation

    Test:
      Bind pose.
      Elbow/knee bend.
      Shoulder/hip rotation.
      Twist.
      Mirrored joints.
      Nonuniform parent scale where supported.
      Missing/deleted bone.
      Topology edits after binding.

    Measurements:
      Weight sums.
      Finite positions.
      Bind-pose agreement.
      Expected analytical vertex movement.
      Bounding boxes.
      Visual deformation at difficult poses.

    Rule:
      Topology edits must remap skin data or reject before commit.

55. Implement animation documents

    Required:
      Clips.
      Track targets.
      Keyframes.
      Insert/update/delete keys.
      Time ordering.
      Translation, rotation and scale tracks.
      Step and linear interpolation.
      Quaternion interpolation.
      Supported cubic interpolation with explicit tangent semantics.
      Clip duration and time units.

    Source and preview:
      Pose changes can be previewed without overwriting rest state.
      Key insertion is an explicit source edit.
      Runtime playback state remains separate from the authored clip.

56. Implement poses, shape keys and clip arrangement

    Required:
      Named poses.
      Pose blending.
      Relative shape-key deltas.
      Shape-key weights and animation.
      Clip trimming, offset, speed and arrangement within a declared model.

    Proof:
      Keyframe samples match expected values.
      Shape keys survive supported topology mappings.
      Rest state survives playback.
      Undo/redo restores authored tracks.

57. Implement retargeting and baking

    Required:
      Explicit source/target bone mapping.
      Rest-pose alignment.
      Scale policy.
      Missing-bone diagnostics.
      Fixed-sample or adaptive baking.
      Constraint-driven pose bake.
      Error measurement against the source evaluation.

    Proposed acceptance:
      Rotation bake error <= 0.1 degree on named fixtures.
      Position/deformation error <= 0.1% of fixture diagonal.
      Any profile exceeding tolerance fails or reports unsupported.

    Do not:
      Infer animation compatibility from clip names alone.


PART 10 — ASSEMBLY, DOMAIN COMPOSITION AND SEQUENCES

58. Implement assembly authoring

    Required:
      Object hierarchy.
      Local transforms.
      Mesh/material/rig/clip assignments.
      Reusable instances.
      Variants.
      Collections/groups.
      Visibility and export inclusion.
      Dependency-safe duplicate/delete.

    Units:
      Explicit project units.
      Defined up axis and handedness.
      One documented conversion into runtime and export conventions.

    Proof:
      Nested transforms.
      Shared asset references.
      Independent instances.
      Cyclic hierarchy rejection.
      Exported world transforms match authored transforms.

59. Implement domain-composition authoring

    Source:
      Serializable kit choices, configuration and references.
      Stable node IDs.
      Declared dependencies.

    Reuse:
      Existing n:composition registry and planning APIs.

    Required operations:
      Discover available capabilities.
      Add/remove/reconfigure composition nodes.
      Connect typed references.
      Validate dependencies and conflicting providers.
      Produce an installable composition plan.

    Trust:
      A saved document names approved capabilities.
      It does not make arbitrary JavaScript executable.
      Imported manifests do not grant installation trust.

    Proof:
      Missing dependency.
      Duplicate provider.
      Invalid configuration.
      Valid public installation.
      Repeated installation without duplicated systems.

60. Implement sequence authoring against current execution APIs

    Source:
      Editable sequence definitions.
      Operation references and typed inputs.
      Links, conditions and bounded execution settings.
      Stable node IDs.
      No serialized callbacks or backend handles.

    Execution owner at inspected Engine commit:
      n:runtime:sequence

    Existing public import:
      nexusengine/domains/runtime/sequence

    Actions:
      Inspect the exact current node/runtime contracts.
      Register Authoring operation leaves through supported public extension.
      Translate authored definitions into the supported execution model.
      Validate every required method at startup.

    Important:
      Do not silently rename execution to n:sequence.
      A root Sequence migration is separate work unless independently present
      in the refreshed repository before implementation.

61. Compose bounded authoring workflows

    Reusable stages:
      Inspect.
      Validate prerequisites.
      Execute bounded operations.
      Read resulting state.
      Evaluate/preview.
      Verify.
      Save checkpoint.
      Continue or return diagnostics.

    Required behavior:
      Explicit attempt limits.
      Cancellation.
      Failed-operation propagation.
      Retry protection.
      Stale-source rejection.
      No automatic infinite correction loop.

    Proof:
      Removing a required Authoring operation breaks the workflow visibly.
      A changed operation parameter changes authoritative source and output.
      Transport success cannot mark invalid geometry as complete.


PART 11 — COMPLETE PUBLISHING AND GLB DELIVERY

62. Define the evaluated delivery packet

    Authoring Publishing owns:
      Export selection.
      Dependency closure.
      Evaluation profile.
      Compatibility checks.
      Conversion requests.
      Result validation and publication state.

    Packet contains:
      Exact source revisions and hashes.
      Evaluated geometry.
      Material assignments.
      Texture identities and encoded-content references.
      Node hierarchy and transforms.
      Skeletons, skins and inverse binds.
      Animation tracks.
      Morph targets when included.
      Units and conversion metadata.
      Declared extension requirements.

    Provider:
      Receives only the evaluated packet.
      Encodes bytes.
      Returns artifact identities and diagnostics.

63. Complete the GLB adapter

    Evolve:
      src/authoring/glb-export.js

    Required:
      Multiple meshes and material primitives.
      Hierarchies and transforms.
      Normals, tangents, UVs and vertex colors.
      Embedded textures.
      Skinning.
      Animation.
      Morph targets.
      Supported sampler and alpha behavior.
      Explicit supported extension profile.

    Checks:
      Valid indices and accessor bounds.
      Finite Float32 conversion.
      Animation time ordering after Float32 conversion.
      Normalized quaternions.
      Valid joint hierarchy.
      Valid skeleton roots.
      No missing material/image references.

    Unsupported features:
      Reject explicitly.
      Do not silently flatten or omit important source data.

64. Preserve textures and export provenance

    Deliver:
      GLB.
      Standalone texture files.
      Export manifest.
      Source-document revision/hash map.
      Validation report.
      Preview images.
      Reproduction command.

    Validate:
      Embedded texture content corresponds to delivered standalone textures.
      Map channels and color spaces are correct.
      No absolute local filesystem references leak into the artifact.
      Asset license/provenance metadata is retained where required.

65. Publish artifacts atomically

    Sequence:
      Evaluate immutable source snapshot.
      Encode into a staging directory.
      Validate bytes.
      Reload independently.
      Confirm source revisions remain acceptable.
      Publish complete manifest and artifacts.
      Mark publication successful.

    Cancellation/failure:
      Preserve the previous successful output.
      Remove or quarantine staging.
      Never expose half-written files as complete exports.

66. Verify output independently

    Validator:
      Khronos glTF validator.

    Independent reader:
      Three.js GLTFLoader or another independently implemented reader.
      Reusing only the writer's own reader is insufficient.

    Required comparisons:
      Mesh/primitive counts.
      Material and texture references.
      Bounds and world transforms.
      Skeleton hierarchy.
      Bind pose.
      Sampled animation.
      Morph targets.
      Embedded image bytes/content.

    Proposed numerical tolerances:
      Weight sum error <= 1e-5.
      Bounds error <= max(1e-7 metres, 1e-5 × asset diagonal).
      Animation/deformation bake tolerances from Step 57.

    Validator:
      Zero errors.
      Zero unexplained warnings.
      Any accepted warning requires a specific documented reason.


PART 12 — COMPLETE THE DONUT WORKFLOW

67. Build the donut entirely through installed Authoring operations

    Recipe location:
      NexusEngine-Editor/examples/authoring/donut/

    Content:
      project configuration.
      domain composition.
      ordered recipe/sequence.
      procedural seeds.
      material settings.
      camera and lighting descriptors.
      quality acceptance criteria.

    Steps:
      Create torus.
      Set real dimensions.
      Apply controlled irregularity.
      Subdivide within a measured budget.
      Duplicate/extract icing surface.
      Shape icing boundary.
      Extrude drips.
      Add thickness.
      Fit icing to dough.
      Sculpt local irregularity.
      Create UVs.
      Author dough and icing materials.
      Paint/bake supported surface detail.
      Create sprinkle geometry.
      Scatter sprinkles using surface normals and a density mask.
      Add plate/countertop.
      Compose camera and lighting.
      Preview.
      Save.
      Export.
      Independently reload.
      Render the exported GLB.

    Rules:
      Recipe parameters are content.
      Modeling algorithms belong in the owning kits.
      No hardcoded completed donut hidden inside the renderer.

68. Implement deterministic surface scattering

    Reusable behavior:
      Area-weighted surface sampling.
      Seeded randomness.
      Density masks.
      Surface-normal alignment.
      Minimum-spacing policy.
      Orientation/scale variation.
      Explicit instance count and budget.

    Placement:
      Reuse existing Spatial/Object capabilities where suitable.
      Put genuinely missing reusable source-generation behavior in its
      declared Authoring owner.

    Proof:
      Same seed -> same placements.
      Different seed -> measured variation.
      No points on excluded regions.
      Minimum spacing checked.
      No implicit dependence on rendering frame rate.

69. Review the donut using fixed evidence

    Capture at least:
      Overall three-quarter view.
      Side silhouette.
      Icing/drip close-up.
      Material close-up.
      Exported-artifact comparison.

    Inspect:
      Donut silhouette and hole.
      Icing thickness and intersections.
      Sprinkle scale, density and orientation.
      Dough surface variation.
      Roughness and normal-map scale.
      Contact shadows.
      Camera framing.
      Exposure and color consistency.

    Review loop:
      Name the defect.
      Identify the owning source parameter or operation.
      Make a bounded change.
      Re-render the same view.
      Compare before/after.
      Keep only improvements supported by inspection.

    Do not:
      Change camera or lighting to conceal broken geometry.
      Count five screenshots as five successful quality improvements.
      Claim photorealism from numerical validity alone.


PART 13 — PROVE THE REST OF THE DOMAIN

70. Build the additional proof assets

    Mechanical prop:
      Multiple parts.
      Bevels and hard edges.
      UV seams.
      Multiple PBR materials.
      Normal/tangent validation.
      Reusable assembly.

    Organic articulated asset:
      Curved/organic form.
      Sculpting.
      Rig.
      Skin weights.
      Difficult poses.
      Several animation clips.
      At least one shape key if supported by the delivery profile.

    Assembly scene:
      Shared source assets.
      Multiple instances.
      Nested transforms.
      Variant selection.
      Dependency-complete export.

    Each asset:
      Saved editable source.
      Repeatable recipe.
      GLB.
      Standalone textures.
      Independent validation.
      Exact-artifact renders.

    Purpose:
      The donut does not exercise rigging, skinning or retargeting.
      These additional fixtures close those evidence gaps.

71. Add a minimal visual Authoring client

    Integrate into NexusEngine-Editor:
      Project open/save.
      Object/document outliner.
      Viewport selection.
      Transform controls.
      Operation inspector.
      Material assignment.
      Basic animation playback.
      Undo/redo.
      Export.
      Clear failures and capability limits.

    Architecture:
      UI actions invoke the same public commands used by scripts.
      Selection and editable source remain domain-owned.
      Visual descriptors and provider realization remain separate.

    Preserve:
      Existing viewport and project workflows until replacement is proven.
      Existing source format imports.
      CLI-only installation/trust boundaries.

    Proof:
      Perform the first-edit workflow through both UI and script.
      Compare resulting document contents.
      Browser reload preserves saved work.
      Errors are visible and do not leave a false success state.

    Limit:
      This is a usable client for the declared capabilities.
      It is not a promise to recreate every Blender workspace or shortcut.


PART 14 — PERFORMANCE, BATCHES AND RELIABILITY

72. Measure representative workloads

    Mesh sizes:
      10,000 vertices.
      100,000 vertices.
      1,000,000 vertices where the declared environment/profile supports it.

    Images:
      1K.
      2K.
      4K.
      8K where supported.

    Measure:
      Load/save time.
      Selection and transform latency.
      Modifier/sculpt/bake time.
      Export time.
      Peak memory.
      History growth.
      Worker transfer/copy volume.
      Cancellation latency.
      Preview update time.

    Report:
      Hardware/environment.
      Warm/cold conditions.
      Repetition count.
      Median and tail latency.
      Peak memory.
      Supported limits and rejected workloads.

    No claim:
      Merely raising the old 10,000-vertex limit is not scale proof.

73. Implement background work and stale-result protection

    Required:
      Worker/job adapter outside portable Core.
      Explicit source revisions.
      Progress.
      Cancellation.
      Bounded queues.
      Time/memory budgets.
      Result disposal.

    Proof:
      Edit source while a modifier evaluates.
      Cancel a texture bake.
      Close project with an export in progress.
      Terminate a worker.
      Restart after failure.

    Pass:
      No stale result commits.
      No partial publication.
      No orphan process/resource.
      No lost accepted edit.

74. Prove batch generation separately

    Required:
      Independent project/job state.
      Per-job seeds.
      Per-job output directories.
      Bounded concurrency.
      Resume manifest.
      Repeated-request handling.
      Cache keys containing source and algorithm versions.
      Partial-batch failure reporting.

    Validation sequence:
      One asset.
      Ten variants.
      One hundred jobs with injected failures.
      Larger throughput tests only after those pass.

    Report:
      Completed/failed/cancelled counts.
      Output identity.
      Cache hits.
      Peak memory.
      Throughput.
      Recovery result.

    Boundary:
      A hundred successful jobs does not prove production at hundreds of
      thousands of scenes.

75. Check diversity and quality

    Required:
      Parameter coverage.
      Duplicate-content detection.
      Bounds and mesh statistics.
      Material/shape variation.
      Invalid/intersecting output detection.
      Representative visual sampling.

    Keep separate:
      Throughput.
      Structural validity.
      Visual quality.
      Diversity.

    None of these automatically proves the others.


PART 15 — RECONCILIATION AND FINAL VALIDATION

76. Integrate tests into actual runners

    Engine test families:
      core-authoring-foundation.mjs
      core-authoring-public.mjs
      core-authoring-project.mjs
      core-authoring-workspace.mjs
      core-authoring-transactions.mjs
      core-authoring-history.mjs
      core-authoring-recovery.mjs
      core-authoring-mesh-topology.mjs
      core-authoring-mesh-attributes.mjs
      core-authoring-mesh-operations.mjs
      core-authoring-curve.mjs
      core-authoring-modifier.mjs
      core-authoring-brush-sculpt.mjs
      core-authoring-uv.mjs
      core-authoring-material-paint.mjs
      core-authoring-rig-skin.mjs
      core-authoring-animation.mjs
      core-authoring-assembly.mjs
      core-authoring-composition.mjs
      core-authoring-sequence.mjs
      core-authoring-publishing.mjs

    Editor test families:
      Headless strict/development.
      Authoring host and command transport.
      File/browser project storage.
      Preview causality and cleanup.
      Export structure and independent reload.
      Donut end-to-end.
      Rigged asset end-to-end.
      Visual client.
      Batch cancellation/recovery.

    These filenames are proposed test targets.
    Consolidate only where it improves meaningful responsibility-based coverage.

77. Reconcile public manifests and generated records

    Engine generators:
      scripts/generate-core-catalog.mjs
      scripts/generate-kit-ownership-ledger.mjs
      scripts/generate-public-test-surface.mjs
      scripts/generate-dsk-manifest.mjs
      scripts/generate-guide.mjs

    Additional generators:
      Migration and root-module disposition generators when affected.
      Kits catalog/registry generators for provider additions.

    Review:
      package.json exports and files.
      src/core-domains/index.js.
      src/core-domains/catalog.js.
      docs/generated/CORE-CATALOG.json.
      docs/generated/PACKAGE-EXPORTS.json.
      Ownership ledger.
      API reference.
      Guide indexes.
      MCP guide resources.

    Pass:
      Proof declarations match tested capabilities.
      Every export resolves.
      No unmanifested public factory.
      Second generation produces no additional changes.

78. Finish documentation from tested behavior

    Root AUTHORING.md:
      Use exact tested commands.
      Show both default host and embedded use.
      Explain source versus evaluated versus exported data.
      State actual limits.
      Link every major capability to an example or proof.

    Detailed docs:
      Contracts and ownership.
      Commands/errors.
      Project format and recovery.
      Supported modeling profiles.
      Material/export compatibility.
      Rig/animation limits.
      Performance results.
      Provider requirements.
      Migration notes.

    Editor docs:
      Default startup.
      Stdio/programmatic usage.
      Preview setup.
      Storage and export locations.
      Troubleshooting.
      Existing-project migration.

    Changelogs:
      Describe actual changes and verified scope.
      Distinguish newly delivered features from future tracks.

79. Run the complete Engine gate set

    Commands verified in current package scripts:
      npm run core:check
      npm run core:contracts
      npm run ownership:check
      npm run test:surface:check
      npm run migrations:check
      npm run protokits:check
      npm run release:manifest:check
      npm run boundaries:check
      npm run guide:check
      npm run docs:check
      npm test
      npm run test:release
      npm pack --dry-run --json

    Also:
      Focused Authoring tests.
      Focused Constraints tests.
      Relevant Physics and GPU preservation tests.
      Current guide PDF generation and verification.
      Changed-file and source-boundary audit.

    Failure rule:
      Diagnose and repair inside the frozen scope.
      Do not bypass the runner to claim whole-repository success.

80. Run Editor and provider gates

    Editor:
      Headless tests.
      Authoring tests.
      npm run smoke:intent
      npm run build
      npm run smoke:playwright
      npm test

    Kits:
      npm run check
      Relevant provider lifecycle and migration tests.
      Package export and installer/registry proof.

    Dependency checks:
      Exact HTTPS Engine pins.
      Correct lockfile resolution.
      Correct artifact metadata.
      No stale CDN SHA in the active Authoring path.
      No committed node_modules, dist, local projects or browser output.

81. Perform an architectural audit

    Trace:
      Public import.
      Kit installation.
      Domain/API discovery.
      Command input.
      Authoritative mutation.
      Dependent evaluation.
      Presentation packet.
      Actual pixels.
      Export bytes.
      Independent reload.
      Cleanup.

    Reject:
      Fallback runtime on the Authoring path.
      Duplicate source stores.
      Private sibling-domain imports.
      Provider access to the full Engine or mutable source.
      Hardcoded completed assets disguised as domain output.
      Empty/no-op APIs marked implemented.
      Tests that only assert a success flag.
      Unexplained missing capabilities.

    Reconcile:
      Every capability-ledger row.
      Every completion claim.
      Every required proof asset.
      Every unsupported-profile statement.

82. Prove clean consumers before remote publication

    Create temporary consumer projects outside implementation checkouts.

    Install:
      Packed Engine candidate.
      Packed provider candidate.
      Packed Editor candidate.

    Run:
      Root guide quickstart.
      First edit/save/reopen.
      Donut recipe.
      GLB reload/render.
      Rigged asset playback.
      Basic visual editing.
      Repeated install and cleanup.

    Ensure:
      No imports resolve accidentally to the development checkout.
      Required docs/examples are included or linked to exact delivered source.
      Package contents contain no local-only dependency paths.

83. Prepare the final commits and dependency order

    Refresh remote heads immediately before finalization.
    If main advanced:
      Preserve all remote changes.
      Integrate without force.
      Repeat affected validation.
      Do not push over someone else's work.

    Dependency direction:
      Engine Core -> no dependency on Editor or concrete provider package.
      Kits provider package -> Engine public contracts.
      Editor -> Engine and selected external providers.

    Commit preparation:
      Commit tested Engine changes locally; record SHA A.
      Pin Kits to Engine A, finalize provider metadata; record SHA B.
      Pin Editor to Engine A and provider B; record SHA C.

    Artifact hashes:
      Compute from the actual packed candidates.
      Keep self-referential commit hashes out of files that would invalidate
      the commit they describe.
      Do not substitute arbitrary placeholders in release metadata.

    Before pushing:
      Inspect all three complete diffs.
      Verify excluded files are unchanged.
      Run exact committed-content consumer checks.
      Ensure all intended files are tracked.


PART 16 — PUSH AND VERIFY

84. Publish Engine

    Announce:
      "LuminaryLabs-Dev/NexusEngine:
       push the tested Authoring and prerequisite-repair commit to main."

    Action:
      Normal fast-forward push of commit A.

    Verify:
      Remote main resolves to A.
      Root AUTHORING.md exists.
      README points to it.
      Authoring source/manifests/tests are present.

85. Publish provider migration

    Announce:
      "LuminaryLabs-Dev/NexusEngine-Kits:
       push the tested provider migration and integration commit to main."

    Action:
      Normal fast-forward push of commit B.

    Verify:
      Remote main resolves to B.
      Engine dependency resolves to A.
      Provider public exports are present.

86. Publish Editor integration

    Announce:
      "LuminaryLabs-Dev/NexusEngine-Editor:
       push the tested Authoring host, UI, storage, preview and export
       integration commit to main."

    Action:
      Normal fast-forward push of commit C.

    Verify:
      Remote main resolves to C.
      Engine/provider pins match A/B.
      Startup and Authoring documentation are present.

    Note:
      Three repositories cannot be pushed as one atomic Git operation.
      Validate all candidates first, push in dependency order and verify each.
      If a later push fails, report exactly which commits reached GitHub.

87. Verify the delivered result

    From clean remote checkouts:
      Install exact committed dependencies.
      Run the documented Authoring quickstart.
      Execute the first edit/save/reopen workflow.
      Build the donut from its recipe.
      Load and render the resulting GLB.
      Verify a rigged animated asset.
      Confirm no uncommitted development files are required.

    Report:
      Repository names and final SHAs.
      Implemented capability profile.
      Actual validation results.
      Proof-asset locations and identities.
      Exact startup command.
      Root Authoring guide link.
      Remaining explicitly separate roadmap items.

    Do not claim:
      npm publication.
      A tagged release.
      Deployment.
      Physical-device performance.
      Full Blender parity.
      FBX.
      Multi-user collaboration.
      Hundred-thousand-scene production capacity.


FINAL CHECKLIST — DEFINITION OF DONE

[ ] Earlier work recovered or reconstructed with fresh evidence.
[ ] Constraints proof and catalog blocker repaired.
[ ] Concrete WebGPU execution moved to its proper provider owner.
[ ] Browser, localhost rendering and current PDF checks work.
[ ] Authoring has one clear source owner and public installation path.
[ ] Root README routes directly to root AUTHORING.md.
[ ] Default startup works with the real Engine.
[ ] No Authoring fallback runtime.
[ ] Project create/open/edit/save/close/reopen works.
[ ] Commands are discoverable, revision-aware and repeat-safe.
[ ] Undo/redo, previews, transactions and recovery are proven.
[ ] Workspace references documents without duplicating them.
[ ] Mesh tools preserve dependent attributes.
[ ] Curves and declared modifiers work.
[ ] Brush, sculpt, UV, material and paint operations work.
[ ] Rig, skin, animation, retarget and bake profiles are proven.
[ ] Assembly and domain-composition authoring work.
[ ] Sequence authoring uses verified execution contracts.
[ ] Textured GLB publishing is complete and atomic.
[ ] Independent reload validates geometry, textures, skins and animation.
[ ] Donut is built through actual Authoring operations.
[ ] Mechanical and organic/rigged proof assets close the remaining coverage.
[ ] Visual client and scripts use the same command path.
[ ] Cancellation, stale jobs and cleanup pass.
[ ] Performance and batch results include measured limits.
[ ] Public exports, manifests, catalogs and docs agree.
[ ] Required repository gates pass.
[ ] Clean packed and committed consumers pass.
[ ] Exact tested commits are pushed to the named main branches.
[ ] Remote readback and post-push reproduction pass.

COMPLETION STATEMENT

  The outcome is a usable Authoring domain with documented startup,
  reusable editing tools, source persistence, visual inspection and verified
  GLB delivery. The host makes those capabilities accessible; it does not
  substitute for their implementation.

  Completion requires the working paths and evidence above. Folders, proposed
  APIs, historical test results and a standalone exporter cannot close the plan.