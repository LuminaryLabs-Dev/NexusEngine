# ProtoKit Boundaries

This rebuild changes only `LuminaryLabs-Dev/NexusEngine`.

Do not patch satellite repos in this phase:

```txt
NexusEngine-ProtoKits
NexusEngine-Experiments
NexusEngine-Sandbox
NexusEngine-KitBuilder01/02/03
```

## Core owns

```txt
kernel
contracts
foundation primitives
core capability domains
adapter boundaries
diagnostics and promotion gates
```

## ProtoKits own

```txt
niche kits
genre kits
platform-specific kits
project bridge kits
large composite kits
experimental service kits
```

## Examples that stay in ProtoKits

```txt
aerial-* kits
generic-defense-* kits
RPG/social kits
route cargo extraction kits
spatial authoring kits
OpenXR/WebXR hand adapter kits
stereoscopic render kits
AAA compatibility facades
```

## Later migration

After the main core rebuild is documented, implemented, and verified, ProtoKits can receive a separate migration packet that updates imports to the new core capability domains.
