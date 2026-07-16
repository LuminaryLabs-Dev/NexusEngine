import assert from "node:assert/strict";
import {
  PROCEDURAL_MATERIAL_SCHEMA,
  createProceduralMaterialDescriptor,
  resolveProceduralMaterialAssignment,
  validateProceduralMaterialDescriptor
} from "../../src/core-kits/core-graphics-kit/index.js";

const descriptor = createProceduralMaterialDescriptor({
  id: "clay-library",
  atlas: { resolution: 2048, columns: 4, rows: 2, assets: { baseColor: "clay-base.ktx2" } },
  families: [
    { id: "ground", baseColor: "#78a84e", generator: { seed: 1 }, surface: { roughness: 0.7 } },
    { id: "path", baseColor: "#c58a44", generator: { seed: 2 }, surface: { clearcoat: 0.22 } }
  ],
  qualityTiers: [
    { id: "high", channels: ["baseColor", "normal", "packedSurface"], maximumSamples: 18 },
    { id: "low", channels: ["baseColor"], maximumSamples: 6 }
  ],
  assignments: [{
    id: "terrain",
    target: "terrain",
    families: ["ground", "path"],
    mapping: { type: "triplanar", space: "world", scale: 0.09, blendSharpness: 5 },
    mask: { kind: "attribute", attribute: "surfaceMask", channel: "r" },
    quality: "high",
    qualityByLod: { far: "low" },
    vertexColors: true
  }]
});

assert.equal(descriptor.schema, PROCEDURAL_MATERIAL_SCHEMA);
assert.equal(descriptor.atlas.width, 2048);
assert.equal(descriptor.atlas.assets.baseColor, "clay-base.ktx2");
assert.equal(descriptor.assignments[0].mapping.space, "world");
assert.equal(resolveProceduralMaterialAssignment(descriptor, "terrain", { lodId: "far" }).quality.id, "low");
assert.equal(validateProceduralMaterialDescriptor(descriptor).valid, true);
assert.equal(validateProceduralMaterialDescriptor({
  families: [{ id: "one" }],
  assignments: [{ id: "bad", target: "bad", families: ["missing"] }]
}).valid, false);

console.log("core graphics procedural material smoke ok");
