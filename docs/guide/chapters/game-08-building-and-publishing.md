# Building, Packaging, and Publishing

A game is not delivered when the source looks finished on the developer's machine. It is delivered when another person can start the intended application, interact with it, and experience the same essential behavior. NexusEngine provides several ways to create artifacts, and they serve different purposes. Understanding the distinction will save time at the end of a project.

For **A Small Dungeon Adventure**, imagine that the first dungeon room has passed its source, gameplay, and visual reviews. We now want to share a playable version rather than a collection of models and scripts.

## Saving, asset export, and game builds are different things

Saving an Authoring project preserves editable source, document relationships, revisions, and recovery information. It is what a creator needs in order to continue working on the room tomorrow.

Exporting a GLB, FBX, or USDZ asset packages evaluated geometry and other supported asset data for a consumer. It is useful when sharing a chest, character, or authored scene with another application. An exported GLB does not automatically include the game's controls, inventory rules, HUD, or a complete running application.

A **playable-project export** packages a compatible game project and its selected runtime into a standalone application folder. The Editor documents a `playable-export` operation for projects carrying the `nexusengine.playable-project/1` descriptor. That is a particular export path, not a promise that every Authoring scene automatically converts into a playable game.

The Engine's `n:build` system is another, separate boundary. It analyzes and packages an application project for named targets and records proof about the resulting artifacts. It does not silently write gameplay rules or fill in missing dependencies.

| Result | Its purpose |
| --- | --- |
| Saved Authoring project | Continue editing trusted source |
| GLB / FBX / USDZ asset | Exchange or inspect supported visual data |
| Standalone playable export | Distribute a compatible playable-project application |
| `n:build` artifact | Package an explicit project for a selected target |

A developer may use several of these in one production process. The key is to know exactly what kind of artifact is being created and what it does or does not contain.

## Decide where people will play

For a small game, the browser is often an appealing first target. NexusEngine's Build documentation includes `web-live` and `web-static` targets. The former has an immutable module closure and validated service-worker caching; the latter produces a self-contained local directory while rejecting unresolved external browser dependencies.

The same Build system documents Android XR and Windows PCVR packaging paths. Those targets need additional toolchains and explicit validation. A successfully produced package is not proof that it has run correctly on the actual headset or target computer. The documentation distinguishes package proof from hardware execution evidence, and the guide should preserve that distinction.

Choosing a target early affects the project's dependencies, rendering provider, input approach, asset sizes, and performance expectations. A room that runs smoothly in one desktop browser is not automatically appropriate for every phone or headset.

## Understand the build boundary

`n:build` is isolated from the runtime. It reads the project, identifies source and dependency relationships, plans the selected targets, and produces artifacts outside the source tree. Build staging and caches live under the Engine's external build root, normally `~/.nexusengine`. This avoids treating generated packages as canonical game source.

For a compatible application project, the documented CLI flow is:

~~~sh
nexusengine inspect ./my-game
nexusengine plan ./my-game --target web-static
nexusengine build ./my-game --target web-static --approve-plan <plan-hash>
~~~

The final command uses the exact plan hash from the reviewed plan, not a placeholder. Target-specific entry points, supported dependency closure, and other requirements must match the current Build reference. Planning reports what can be built; it does not itself certify a finished result.

The Editor provides Build controls that call the Core Build service on demand, instead of maintaining a second implementation. Normal asset editing and Play Mode do not need to initialize every build toolchain.

## Package a game someone else can understand

A useful release includes more than its main file. It should contain the required application entry points, compatible assets and runtime dependencies, clear startup instructions where needed, and enough version information to identify the exact content someone tested.

For the dungeon, run the packaged game from a clean environment rather than relying on local files accidentally available from the development machine. Verify that the room loads, that its materials and animations appear correctly, and that the player can complete the key-and-door loop.

Pay attention to failure behavior as well. What happens if an asset fails to load? Does the game show an intelligible error? Does the application preserve or recover state correctly where the product promises that behavior? These are product decisions that a successful compiler cannot make for us.

## Verify the artifact, not just the source

A complete release review should distinguish three facts:

**The source was accepted.** Its assets, documents, composition, and relevant gameplay logic passed their own validation.

**The package was produced.** The chosen build or playable-export path created artifacts with its expected dependency and integrity receipts.

**The delivered game was executed.** Someone opened the actual artifact in the intended environment and completed the relevant gameplay scenarios.

These are progressively stronger claims, but they are not interchangeable. A native XR package may be package-proven while headset behavior is still untested. A GLB may validate but appear wrong after a consumer changes coordinate conventions or material interpretation.

A release description should state the tested platform and version, known limitations, and what remains unverified. This is more useful than saying “production-ready” without explaining the evidence.

## Continue from the small game to the complete one

After a verified single-room release, expanding the dungeon becomes much less speculative. The game now has a working project structure, visual language, interaction loop, test scenarios, and packaging path. Additional rooms can reuse modular assets; new enemies and inventory systems can be integrated behind known capability boundaries; creative review can focus on differences rather than starting from scratch.

This is the larger lesson of NexusEngine's architecture. Reusable systems remove some repetitive work, but they do not eliminate creative choices or proof. Building a complete game still requires thoughtful design, sound asset construction, real runtime integration, careful observation, and a tested release.

The reader who wants to understand those systems in technical depth can continue into [First Runtime](03-first-runtime.md), [Domains and Atomic Kits](04-domains-and-atoms.md), [Composition and Recipes](06-composition-and-recipes.md), [Build Projects and Targets](../building/README.md), and [Testing and Proof](10-testing-and-proof.md).

The running dungeon example throughout this part is a **teaching narrative**, not an already shipped game or an automated acceptance report. Its value is showing how each responsibility connects to the next so that a developer can create, verify, and eventually deliver their own project.
