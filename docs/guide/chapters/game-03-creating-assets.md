# Creating Game Assets

A game asset is more than a shape. A chest has to look like a chest from the player's camera, occupy a believable amount of space, fit the visual language of the environment, and behave well when it is reused. NexusEngine's Authoring tools make it possible to create the underlying source for such objects without treating a renderer or external modeling application as the canonical owner of the design.

This chapter follows the first treasure chest for **A Small Dungeon Adventure**. We will describe a realistic creative process, identify the relevant supported capabilities, and distinguish those capabilities from the artistic decisions a person still needs to make.

## Start with silhouette and scale

Imagine the chest seen across the room. Before adding wood grain, iron hinges, or a glowing lock, ask whether its silhouette is recognizable. A broad body, raised lid, clear front face, and visible latch tell the story at a distance. If those proportions are wrong, adding texture detail will rarely fix the result.

An uncomplicated first version uses separate meshes for the body, lid, and latch. The Authoring mesh tools support primitives such as boxes, cylinders, spheres, grids, and torus shapes, along with transforms and bounded topology operations. For a rectangular wooden chest, these are enough to establish the form. We can use an inset or extrusion where its supported topology profile allows it, and a convex bevel where appropriate.

The Source Authoring system works in a Y-up coordinate frame. Establish a consistent unit scale and forward orientation at the beginning. Those choices affect how the chest sits against the floor, where a camera sees its front, and how a later opening animation will rotate the lid. This is a creative decision with technical consequences.

Do not confuse the number of polygons with quality. A small object often benefits more from a clean silhouette, deliberate edges, and readable material separation than from thousands of triangles that disappear at the intended viewing distance.

## Think in reusable parts

The chest body, lid, handles, and latch can be modeled independently and assembled into one reusable object. Keeping the lid separate has a particular advantage: its motion can be defined without deforming the entire chest. The Assembly Authoring tools represent shared source assets, instances, nested transforms, collections, cameras, and lights. Reusing one source definition for several room instances avoids creating slightly inconsistent copies.

The same approach applies to dungeon construction. A family of wall segments, floor tiles, doorframes, pillars, and archways is easier to revise than a single enormous level mesh. If you later increase wall thickness or adjust the stone material, the improvement can carry across the instances that use that source.

This is not an instruction to fragment every object into hundreds of pieces. Split where the parts have meaningful differences: separate movement, different materials, repeated use, or distinct editing needs.

## Refine geometry without losing control

NexusEngine's Authoring profile includes translation, rotation, scaling, face editing, extrusion, inset, triangulation, explicit welds, and bounded modifier operations such as mirror, array, subdivision, solidify, decimation, and Boolean. The exact operation and topology limits matter. For example, the documented bevel profile applies to a closed convex solid with specific budget and attribute constraints. It is not a promise that every arbitrary decorated mesh can be beveled automatically.

Work from simple geometry to detailed geometry, checking the result after significant changes. A lid that develops an inverted face or a nonmanifold edge should be corrected at the source, not hidden by camera placement. Source validation can catch many invalid references and geometric conditions, but it does not make a universal guarantee against every kind of self-intersection.

For a game asset, it is useful to consider how the mesh will be used. Will the player approach it closely? Does the lid need to rotate? Is collision represented by a simpler shape? Is the object often repeated? These questions guide where detail is worth spending.

## Give materials a clear purpose

The chest has at least two visual materials: wood for the body and iron for its fittings. NexusEngine's material authoring supports a metallic-roughness PBR profile, texture roles, alpha behavior, emissive values, and a bounded set of procedural graph operations. Its painting tools can create tiled RGBA layers, brush strokes, vertex colors, and baked images within documented limits.

Use those tools to reinforce recognizable differences. Wood should not read like polished metal; iron fittings should have deliberate contrast against the body. Consider how the chest looks in the dungeon's actual lighting, not only under a neutral studio preview.

UV mapping connects image detail to mesh surfaces. Authoring provides planar, cylindrical, spherical, and other projections, seam controls, island inspection, packing, and diagnostics. Its per-face unwrap is not a full replacement for every specialized unwrapping technique used by dedicated modeling software. For our chest, a restrained, clean UV layout is more valuable than a complicated one with unnecessary fragmentation.

If a procedural color treatment will be included in an exported asset, verify that it has been baked into an appropriate deliverable rather than assuming the target renderer understands NexusEngine's authoring graph.

## Characters and animation use the same principles

A character introduces additional relationships: a skeleton, skin weights, animations, and sometimes shape changes. The Authoring profile supports bounded bone hierarchies, inverse bind matrices, weight painting and smoothing, keyframed transform clips, relative shape keys, and specified baking and retargeting operations.

That is enough to explain a useful workflow: build a readable shape, establish a sensible bone hierarchy, bind its mesh, test a small set of poses, and then author movement clips. But a valid skeleton is not proof of convincing movement. The character's feet may slide, its stance may feel weightless, or the animation may make sense only from one camera angle.

Our first dungeon room does not require a fully animated hero. A simple controllable viewpoint is acceptable while we prove the game's interactions. We can add a character model after movement and camera behavior are stable.

## Inspect the actual deliverable

The Editor provides a Three.js viewport, source editing controls, and import/export surfaces. The Core-native publishing and export services can prepare evaluated data and encode supported GLB, FBX, and USDZ profiles. Format support has explicit restrictions, and successful export does not automatically prove compatibility with an arbitrary external application.

A useful review sequence is to inspect the source mesh, validate it, view it in the scene's intended lighting and camera, export it, and inspect the exported bytes through an independent consumer. The existing Editor proof assets use Khronos validation and an independent Three.js loader for some GLB checks. That distinction is important: an attractive source preview does not guarantee that its exported material, animation, or axes survived conversion.

For the chest, examine the proportions, lid pivot, iron bands, UV seams, roughness, normals, and how the asset reads at normal play distance. If the lid is visibly too thin, fix the lid rather than rebuilding the entire room. If the lighting makes the metal indistinguishable from the wood, examine the lighting and material response separately.

## When is an asset finished?

An asset is ready for the next stage when it is recognizable, structurally valid for its intended use, correctly scaled and oriented, reusable where appropriate, and visually acceptable in the actual game context. Those conditions are different from saying “the mesh operation returned success.”

For **A Small Dungeon Adventure**, we now have a small collection of authored objects: stone room pieces, a chest, a key, a door, and simple decorative fixtures. They do not yet constitute a level. Next, we will assemble them into a space that a player can understand.

For actual operation signatures and limits, consult [Core Authoring](../../../AUTHORING.md). To open the visual workbench, see [Editor Authoring](https://github.com/LuminaryLabs-Dev/NexusEngine-Editor/blob/main/AUTHORING.md). The [Authoring capability ledger](../../../AUTHORING.md#automatically-discovered-capability-ledger) explains why implemented support must be distinguished from independently verified scenarios.
