# 006: How This Relates To Existing NexusRealtime

These notes do not require NexusRealtime runtime changes.

They describe a future authoring style for domain-based kit ecosystems that can sit around NexusRealtime.

## What stays true

```txt
Existing NexusRealtime behavior remains valid.
Existing kit loading and host patterns remain valid.
Existing package exports remain valid.
Existing runtime code does not need to change because of these notes.
```

## What this adds

These notes add a language for future kit organization:

```txt
large domain kits
internal kits
product-shaped kit repos
kit metadata for agents and tools
repo-local docs and memory
kit graph inspection
```

## Why document this here

NexusRealtime is the foundation that many domain kits can compose around.

Documenting target authoring shapes here gives future agents a shared vocabulary before new kit repos or KitBuilder-generated products are created.

## Compatibility position

`kit.json` is proposed authoring metadata.

It is not a current NexusRealtime runtime requirement.

A future KitBuilder or authoring tool may use it to generate release manifests, registries, docs, or promotion notes.

## Safe next step

Use these notes to guide future docs, examples, and generated kit repos.

Do not use these notes as a reason to rewrite existing runtime code.
