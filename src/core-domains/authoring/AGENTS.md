# Authoring ownership

Read the repository AGENTS.md and the active Authoring run before changing this
domain. Project is the sole writer of editable documents and their history.
Specialized children register typed schemas and operations with Project. They
must validate prospective changes before commit and publish immutable results.
Workspace stores references; it must not copy mesh, image, rig or clip content.

Keep platform storage, codecs, rendering, process execution and transports in
external adapters/providers. Consume sibling domains only through public package
exports. Authoring edits Sequence source; Runtime executes registered leaves.

Every advertised operation needs a precise supported profile, discoverable input
contract, meaningful direct and installed proof, and failure-before-mutation
checks. Preserve attributes and references or reject before commit. A folder,
manifest, success flag or example-only algorithm is not an implemented feature.
Do not mark pending capabilities proven to make catalog generation succeed.
