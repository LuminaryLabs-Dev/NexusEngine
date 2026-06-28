# core-assets-kit

Purpose: asset manifests, asset identifiers, references, readiness state, fallback assets, and loading descriptors.

Owns: asset IDs, asset groups, readiness descriptors, fallback metadata, cache/load hints.

Does not own: renderer-specific texture/model upload or browser-only loaders.

Public API: `createCoreAssetsKit(config?)`.

Proof required: manifest config smoke, readiness descriptor smoke, fallback asset smoke, deterministic headless smoke.
