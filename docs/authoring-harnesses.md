# Four composable Authoring harnesses

Design, Art, Interaction and Craft are optional `n:authoring` subdomains. Each
provides portable briefs, planning constraints, capability discovery and
source-bound review contracts, not a second source writer or agent execution loop.
The existing `n:authoring:project` owns all persisted models and changes.

## Install

```js
import { createEngine } from 'nexusengine';
import { createAuthoringDomain, createAuthoringArtKit } from 'nexusengine/domains/authoring';
const engine = createEngine({ kits: [...createAuthoringDomain(), createAuthoringArtKit()] });
const art = engine.n.authoringArt;
const capabilities = art.discover(request, engine.n.authoringProject.tools());
```

Use `createAuthoringDesignKit`, `createAuthoringInteractionKit`, or
`createAuthoringCraftKit` to install another discipline. Existing Authoring
installs do not gain any extra agent or host capabilities by default.

## Boundaries

- Design proposes spatial structure and layout with native Assembly operations.
- Art selects geometry/material/animation operations and reviews their output.
- Interaction authors Sequence/composition definitions; runtime execution remains
  owned by existing Runtime/Interaction services.
- Craft reviews integrated results and directs revisions. It never bypasses
  discipline source owners or mutates the project directly.
- Core contracts check source revisions, allowed tool IDs, current evidence,
  explicit review attribution and bounded budgets.
- `n:harness:routing` resolves authorized capabilities; optional hosts execute them.
- The existing Agent Loop owns continuation, budgets, checkpoints and recovery.
  Interrupted effects must be reconciled, never blindly repeated.

## Optional production execution

Install desired Kits using `createEngineProductionHost({authoringHarnesses:['art']})`.
`createCreativeAuthoringRunner({host,authorize,planner,reviewer,reviser})`
executes a discipline through the existing Agent Loop. Plans contain currently
discovered native Authoring operations; the runner previews and commits through
`production.author`, retains source/validation receipts, optionally invokes
`production.look`, and requests an explicit artistic judgment.

`createAuthoringProgramRunner` composes `production.design`, `production.art`,
`production.interaction` and `production.craft` as ordered Agent Loop steps
followed by independent final verification. It forwards actual output document
references to the next harness; child loops handle only their own corrections.
For conditional cross-discipline revisions, start an explicitly scoped new
program rather than rewriting a resumed immutable program.

## Evidence limits

A successful command or synthetic fixture is not proof of artistic quality.
A validated FBX export is not proof of a working Unity scene. Interaction
scenario acceptance requires an executable provider and source-bound scenario
evidence; a generic Authoring validation is not a gameplay test. Human or agent
reviews must be explicit, and historical/content approval remains separate.


## Optional Authoring Agent guidance

`createAuthoringAgentKit()` installs `engine.n.authoringAgent` only when requested.
Its `guide({discipline,request,evidence})` method exposes discovered,
source-bound operations from existing Design, Art, Interaction or Craft
contracts. `review` delegates acceptance to those existing discipline
contracts, including required visual evidence and reviewer policy.
It does not execute tools, generate images, supply a model or run an Agent Loop.

A generic Worker receives this guidance as **evidence-linked input**, then its
own decision provider chooses eligible goal actions. The older creative
fixed-phase runner remains available as a compatible recipe. Neither a
successful operation nor a rendered capture by itself establishes artistic
acceptance.
