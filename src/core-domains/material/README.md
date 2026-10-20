# Material Domain

This file is generated from the Domain manifest. Do not edit it directly.

- Path: `n:material`
- Status: `stable-candidate`
- Registry SHA-256: `d915cfbca15391703b688464816228a0cefe36ec9281c550c80d0ccaa5a90e47`
- Public entry: `nexusengine/domains/material`

## Responsibility

Own visual material descriptions, parameters, instances, portable execution bindings and validation.

## Owns

- Own visual material descriptions, parameters, instances, portable execution bindings and validation.

## Does Not Own

- application presets
- provider handles
- renderer execution

## Subdomains

None.

## Atomic Kits

| Kit | Import | Responsibility |
| --- | --- | --- |
| `material-contract-kit` | `nexusengine/domains/material/contract` | Define the canonical backend-neutral Render Material execution boundary. |
| `material-binding-kit` | `nexusengine/domains/material/binding` | Map portable Material slots to one exact Shader program interface. |
| `material-parameter-kit` | `nexusengine/domains/material/parameter` | Own typed portable values for exact Material parameter slots. |
| `texture-binding-kit` | `nexusengine/domains/material/texture-binding` | Bind exact resident Texture views and subresources to Material slots. |
| `sampler-binding-kit` | `nexusengine/domains/material/sampler-binding` | Own portable sampler state for exact Material sampler slots. |
| `material-instance-kit` | `nexusengine/domains/material/instance` | Compose one complete portable Material execution instance from exact bindings. |
| `material-variant-kit` | `nexusengine/domains/material/variant` | Resolve an exact Shader variant and complete Material binding override set. |
| `material-validation-kit` | `nexusengine/domains/material/validation` | Prove one Material target against exact completed Shader compile and reflection records. |
| `material-cache-kit` | `nexusengine/domains/material/cache` | Link current Material validation to an exact resident material Render Resource. |
| `material-descriptor-kit` | `nexusengine/domains/material/descriptions` | Own portable material descriptions. |

## Lifecycle

- Duplicate install: Return the installed Material API without duplicate state or systems.
- Snapshot: Serialize Material state and descriptors.
- Reset: Restore the configured Material baseline.
