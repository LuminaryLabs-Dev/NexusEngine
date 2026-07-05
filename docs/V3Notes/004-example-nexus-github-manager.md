# 004: Example, NexusGitHubManager

This is an example of a product-shaped domain-kit ecosystem around a GitHub management product.

It is not a required NexusEngine repo shape.

It is an example of how a future app, core package, and kit set could be organized.

## Product repo shape

```txt
NexusGitHubManager/
├── GitHubManager-NextApp/
├── GitHubManager-Electron/
├── GitHubManager-Core/
│
├── kits/
│   ├── connected-card-graph/
│   ├── github-manager-graph/
│   ├── graph-react-renderer/
│   ├── repo-worker-template/
│   ├── approval-policy/
│   ├── provider-endpoints/
│   ├── workflow-packets/
│   ├── repo-memory/
│   ├── worker-deployment/
│   ├── static-pages-deploy/
│   └── settings-overlay/
│
├── docs/
├── .agent/
├── .github/
├── package.json
└── pnpm-workspace.yaml
```

## What the tree communicates

```txt
connected-card-graph:
  reusable graph domain for connected cards and relationships

github-manager-graph:
  GitHub-specific graph mapping

graph-react-renderer:
  React visual layer for graph state

repo-worker-template:
  worker shape for repo actions

approval-policy:
  approval rules and gates

provider-endpoints:
  provider/API endpoint configuration

workflow-packets:
  durable workflow command/result packets

repo-memory:
  repo-local memory and learned context

worker-deployment:
  worker deployment and update model

static-pages-deploy:
  static site publish flow

settings-overlay:
  user/project settings surface
```

## Nested kit example

```txt
kits/
└── connected-card-graph/
    ├── README.md
    ├── kit.json
    ├── package.json
    ├── index.ts
    └── kits/
        ├── graph-model/
        │   ├── kit.json
        │   ├── index.ts
        │   └── README.md
        │
        ├── graph-registry/
        │   ├── kit.json
        │   ├── index.ts
        │   └── README.md
        │
        ├── graph-selection/
        │   ├── kit.json
        │   ├── index.ts
        │   └── README.md
        │
        ├── graph-layout/
        │   ├── kit.json
        │   ├── index.ts
        │   └── README.md
        │
        ├── graph-validation/
        │   ├── kit.json
        │   ├── index.ts
        │   └── README.md
        │
        ├── graph-snapshot/
        │   ├── kit.json
        │   ├── index.ts
        │   └── README.md
        │
        └── graph-events/
            ├── kit.json
            ├── index.ts
            └── README.md
```

## Important reading

`connected-card-graph` is still the large domain kit.

The internal kits are smaller boundaries inside the graph domain.

They exist so an agent can inspect graph behavior without searching through one giant hidden implementation folder.
