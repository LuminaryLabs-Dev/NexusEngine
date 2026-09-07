# Authoring Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:authoring`
- Status: `stable-candidate`
- Registry SHA-256: `d2b8af8d1d542bdb125d33b8a4ff5a32de1cf73da399e57e9a29b5ae35d4a8f5`
- Public entry: `nexusengine/domains/authoring`

## Responsibility

Own editable source documents and typed editing operations.

## Owns

- editable source contracts
- source mutation protocols

## Does Not Own

- codecs
- filesystem
- renderers
- runtime playback

## Subdomains

| Path | Responsibility |
| --- | --- |
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
