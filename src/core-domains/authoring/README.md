# Authoring Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:authoring`
- Status: `stable-candidate`
- Registry SHA-256: `538fdb5fada709cbf7f305e58401c6fd260738cc2642704352fa180021ce2738`
- Public entry: `nexusengine/domains/authoring`

## Responsibility

Own canonical headless creation, import, editing, validation, persistence and publishing with default format implementations.

## Owns

- editable source contracts
- source mutation protocols

## Does Not Own

- Editor-owned source semantics
- renderers
- runtime playback
- unmediated platform handles in portable source

## Subdomains

| Path | Responsibility |
| --- | --- |
| `n:authoring:create` | Own canonical create operations, default providers, diagnostics and source-safe lifecycle. |
| `n:authoring:importing` | Own canonical importing operations, default providers, diagnostics and source-safe lifecycle. |
| `n:authoring:persistence` | Own canonical persistence operations, default providers, diagnostics and source-safe lifecycle. |
| `n:authoring:publishing:export` | Own canonical publishing export operations, default providers, diagnostics and source-safe lifecycle. |
| `n:authoring:validation` | Own canonical validation operations, default providers, diagnostics and source-safe lifecycle. |
| `n:authoring:modifier` | Own modifier authoring contracts and operations. |
| `n:authoring:publishing` | Own publishing authoring contracts and operations. |
| `n:authoring:sequence` | Own sequence authoring contracts and operations. |
| `n:authoring:domain-composition` | Own domain-composition authoring contracts and operations. |
| `n:authoring:assembly` | Own assembly authoring contracts and operations. |
| `n:authoring:animation` | Own animation authoring contracts and operations. |
| `n:authoring:skin` | Own skin authoring contracts and operations. |
| `n:authoring:rig` | Own rig authoring contracts and operations. |
| `n:authoring:paint` | Own paint authoring contracts and operations. |
| `n:authoring:material` | Own material authoring contracts and operations. |
| `n:authoring:uv` | Own uv authoring contracts and operations. |
| `n:authoring:curve` | Own curve authoring contracts and operations. |
| `n:authoring:sculpt` | Own sculpt authoring contracts and operations. |
| `n:authoring:brush` | Own brush authoring contracts and operations. |
| `n:authoring:workspace` | Own workspace authoring contracts and operations. |
| `n:authoring:project` | Own editable project contracts and operations. |
| `n:authoring:mesh` | Own editable mesh contracts and operations. |
| `n:authoring:editing` | Own editable editing contracts and operations. |

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `authoring-create-service-kit` | `nexusengine/domains/authoring/create/create-service` | Route creation requests to existing typed Project operations without owning duplicate content. |
| `authoring-import-registry-kit` | `nexusengine/domains/authoring/importing/import-registry` | Own trusted canonical importer discovery and provider selection. |
| `authoring-import-validation-kit` | `nexusengine/domains/authoring/importing/import-validation` | Validate a complete staged canonical import against the existing Project writer. |
| `authoring-import-commit-kit` | `nexusengine/domains/authoring/importing/import-commit` | Commit validated imported documents atomically through Project with source guards. |
| `authoring-import-service-kit` | `nexusengine/domains/authoring/importing/import-service` | Decode external bytes into editable documents and orchestrate staged import. |
| `authoring-project-package-kit` | `nexusengine/domains/authoring/persistence/project-package` | Encode and verify content-addressed Project snapshots, historical documents and image tiles. |
| `authoring-storage-provider-registry-kit` | `nexusengine/domains/authoring/persistence/storage-provider-registry` | Own canonical memory, filesystem and IndexedDB storage provider registration. |
| `authoring-save-kit` | `nexusengine/domains/authoring/persistence/save` | Persist a captured Project package with generation conflict protection. |
| `authoring-load-kit` | `nexusengine/domains/authoring/persistence/load` | Verify a stored package before atomically restoring the sole Project source authority. |
| `authoring-persistence-service-kit` | `nexusengine/domains/authoring/persistence/persistence-service` | Expose provider-neutral save and load without an Editor dependency. |
| `authoring-export-registry-kit` | `nexusengine/domains/authoring/publishing/export/export-registry` | Own canonical GLB, FBX and USDZ exporter selection and availability. |
| `authoring-export-capability-kit` | `nexusengine/domains/authoring/publishing/export/export-capability` | Inspect the exact delivery packet against a declared format profile. |
| `authoring-export-validation-kit` | `nexusengine/domains/authoring/publishing/export/export-validation` | Parse encoded artifacts and report native validation separately from external proof. |
| `authoring-export-receipt-kit` | `nexusengine/domains/authoring/publishing/export/export-receipt` | Own bounded idempotent export operation receipts; never serialize executable providers. |
| `authoring-export-service-kit` | `nexusengine/domains/authoring/publishing/export/export-service` | Orchestrate encode, native validation, source-guarded publication and export receipts. |
| `authoring-document-validation-kit` | `nexusengine/domains/authoring/validation/document-validation` | Validate an existing document through canonical Project schemas and reference invariants. |
| `authoring-project-validation-kit` | `nexusengine/domains/authoring/validation/project-validation` | Expose read-only validation of the complete current Project. |
| `authoring-delivery-validation-kit` | `nexusengine/domains/authoring/validation/delivery-validation` | Expose read-only publishing preparation diagnostics. |
| `authoring-format-validation-kit` | `nexusengine/domains/authoring/validation/format-validation` | Expose export compatibility and artifact validation through canonical providers. |
| `authoring-validation-report-kit` | `nexusengine/domains/authoring/validation/validation-report` | Provide the public Authoring validation facade and normalized reports. |
| `authoring-modifier-service-kit` | `nexusengine/domains/authoring/modifier` | Own modifier source operations. |
| `authoring-publishing-service-kit` | `nexusengine/domains/authoring/publishing` | Own publishing source operations. |
| `authoring-sequence-service-kit` | `nexusengine/domains/authoring/sequence` | Own sequence source operations. |
| `authoring-domain-composition-service-kit` | `nexusengine/domains/authoring/domain-composition` | Own domain-composition source operations. |
| `authoring-assembly-service-kit` | `nexusengine/domains/authoring/assembly` | Own assembly source operations. |
| `authoring-animation-service-kit` | `nexusengine/domains/authoring/animation` | Own animation source operations. |
| `authoring-skin-service-kit` | `nexusengine/domains/authoring/skin` | Own skin source operations. |
| `authoring-rig-service-kit` | `nexusengine/domains/authoring/rig` | Own rig source operations. |
| `authoring-paint-service-kit` | `nexusengine/domains/authoring/paint` | Own paint source operations. |
| `authoring-material-service-kit` | `nexusengine/domains/authoring/material` | Own material source operations. |
| `authoring-uv-service-kit` | `nexusengine/domains/authoring/uv` | Own uv source operations. |
| `authoring-curve-service-kit` | `nexusengine/domains/authoring/curve` | Own curve source operations. |
| `authoring-sculpt-service-kit` | `nexusengine/domains/authoring/sculpt` | Own sculpt source operations. |
| `authoring-brush-service-kit` | `nexusengine/domains/authoring/brush` | Own brush source operations. |
| `authoring-workspace-service-kit` | `nexusengine/domains/authoring/workspace` | Own workspace source operations. |
| `authoring-domain-contract-kit` | `nexusengine/domains/authoring/contract` | Own contract Authoring contracts and operations. |
| `authoring-project-document-kit` | `nexusengine/domains/authoring/project` | Own project Authoring contracts and operations. |
| `authoring-mesh-document-kit` | `nexusengine/domains/authoring/mesh` | Own mesh Authoring contracts and operations. |
| `authoring-editing-session-kit` | `nexusengine/domains/authoring/editing` | Own editing Authoring contracts and operations. |

## Lifecycle

- Duplicate install: Return the installed Authoring API without duplicate state or systems.
- Snapshot: Serialize Authoring state and descriptors.
- Reset: Restore the configured Authoring baseline.
