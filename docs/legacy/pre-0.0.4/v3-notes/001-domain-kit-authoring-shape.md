# 001: Domain Kit Authoring Shape

This note describes a target authoring shape for future domain-based kit ecosystems around NexusEngine.

It is not a runtime rewrite.

## Target shape

A product-oriented kit repo can be shaped like this:

```txt
ProductRepo/
├── Product-NextApp/
├── Product-Electron/
├── Product-Core/
│
├── kits/
│   ├── composite-kit-a/
│   ├── feature-kit-b/
│   ├── provider-kit-c/
│   ├── policy-kit-d/
│   └── deploy-kit-e/
│
├── docs/
├── .agent/
├── .github/
├── package.json
└── pnpm-workspace.yaml
```

## Roles

```txt
Product-NextApp:
  web app shell

Product-Electron:
  desktop app shell

Product-Core:
  shared orchestration and host integration

kits/:
  reusable domain capabilities

docs/:
  design notes, migration notes, usage notes

.agent/:
  repo-local memory and agent instructions
```

## Core rule

```txt
Large domain kits are allowed.

Internal kits are optional.

Split only when the smaller boundary makes the kit easier to understand, test, reuse, or inspect.
```

## Why this helps

A tree like this lets an agent infer intent from structure.

For example:

```txt
kits/
  approval-policy/
  provider-endpoints/
  workflow-packets/
  repo-memory/
  worker-deployment/
```

This immediately suggests:

```txt
approval decisions
provider configuration
durable workflow messages
repo-local memory
worker deployment
```

The folder tree becomes part of the architecture language.

## Do not over-apply nesting

Do not split a kit just to make more folders.

A single large domain kit is valid when it has one clear public responsibility.

Nested kits are useful when a large kit contains several smaller boundaries that need separate docs, tests, manifests, or examples.
