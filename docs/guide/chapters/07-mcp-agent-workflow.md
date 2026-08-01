# MCP Agent Workflow

MCP makes the semantic catalog inspectable by an agent. It does not make the agent the runtime owner and does not authorize mutation by itself.

## Opt-In Boundary

An application installs the MCP registry Domain, registers the Composition provider, supplies a transactional host, and chooses a transport. Without those steps, the package exposes no live MCP server.

## Read Tools

| Tool | Purpose |
| --- | --- |
| `domains_list`, `domain_get` | Discover semantic ownership |
| `kits_list`, `kit_explain` | Preserve the existing Kit-oriented inspection surface |
| `atoms_list`, `atom_get` | Page through atomic capabilities and dependency evidence |
| `recipes_list`, `recipe_get` | Inspect declarative compositions |
| `registry_sources_list` | Review package, version, commit, integrity, environment, permissions, and status |
| `composition_validate` | Check a request without resolving code |
| `composition_plan` | Resolve exact sources and produce a stable plan ID |

## Mutation Tool

`composition_apply` is the only mutation tool in the provider. It requires explicit authorization for the exact plan ID. A transport or application may impose additional policy.

## Review Sequence

```txt
inspect relevant Domains and atoms
-> validate the request
-> plan exact sources
-> show commit, integrity, permissions, and capability changes
-> human approves the exact plan ID
-> apply once
-> persist receipt
-> runtime continues after MCP disconnects
```

## Prompts

The provider exposes exactly two short prompts: `inspect-and-plan` and `review-and-apply`. They route the workflow; they do not embed the full guide.

## Resources

Registry records and guide chapters are individual MCP resources. An agent reads only the records and chapters relevant to its current decision. The complete PDF is for humans, not prompt context.
