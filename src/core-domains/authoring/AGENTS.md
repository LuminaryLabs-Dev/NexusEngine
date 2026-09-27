# Authoring ownership

Read the repository AGENTS.md and the active Authoring run before changing this
domain. Project is the sole writer of editable documents and their history.
Specialized children register typed schemas and operations with Project. They
must validate prospective changes before commit and publish immutable results.
Workspace stores references; it must not copy mesh, image, rig or clip content.

Canonical authoring codecs and storage providers belong in this NexusEngine package.
Keep filesystem/IndexedDB access behind environment-specific provider entry points; portable
source contracts and default imports must not require Editor or experimental kit repositories.
Keep rendering, process execution and transports behind their existing provider boundaries. Consume sibling domains only through public package
exports. Authoring edits Sequence source; Runtime executes registered leaves.

Every advertised operation needs a precise supported profile, discoverable input
contract, meaningful direct and installed proof, and failure-before-mutation
checks. Preserve attributes and references or reject before commit. A folder,
manifest, success flag or example-only algorithm is not an implemented feature.
Do not mark pending capabilities proven to make catalog generation succeed.
