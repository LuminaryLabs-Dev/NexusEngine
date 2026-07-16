import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createCoreCaptureDomain,
  createCoreObjectDomain,
  createReferenceObjectShapeProvider,
  createRealtimeGame
} from "../../src/index.js";
import {
  createRockGeometry,
  rasterizeSilhouette,
  silhouetteIou,
  silhouetteMetrics,
  writeSilhouetteSvg
} from "../fixtures/object-shape-fixtures.mjs";

const shapeProvider = createReferenceObjectShapeProvider();
const engine = createRealtimeGame({
  kits: [
    ...createCoreObjectDomain({ shapeProvider, fidelity: false }),
    ...createCoreCaptureDomain()
  ]
});

const object = engine.n.coreObject.register({
  id: "capture-rock",
  objectType: "procedural-rock",
  bounds: { min: [-1.3, -1, -1.2], max: [1.3, 1, 1.2] },
  pivot: [0, 0, 0],
  groundAnchor: [0, -1, 0],
  geometry: { provider: "capture-smoke", descriptorId: "capture-rock:source" }
});
const source = engine.n.objectShape.registerSource({
  id: "capture-rock:source",
  objectId: object.id,
  objectContentHash: object.contentHash,
  geometry: createRockGeometry(30, 20)
});
const reducedJob = await engine.n.objectShape.derive({
  sourceShapeId: source.id,
  profileId: "general-rigid-object",
  targetId: "reduced"
});
const reduced = engine.n.objectShape.getShape(reducedJob.resultShapeId);

const geometryByForm = new Map([
  ["source", source.geometry],
  ["reduced", reduced.geometry]
]);
const artifacts = new Map();
engine.n.coreCapture.registerProvider({
  id: "software-silhouette-capture",
  async capture(request, { updateProgress }) {
    const geometry = geometryByForm.get(request.subject.formId);
    if (!geometry) throw new Error(`Unknown software capture form: ${request.subject.formId}`);
    const frames = [];
    const azimuthCount = request.viewSet.azimuthCount;
    for (let index = 0; index < azimuthCount; index += 1) {
      const angle = index / azimuthCount * Math.PI * 2;
      const image = rasterizeSilhouette(geometry, angle, 128, 128);
      frames.push(image);
      updateProgress(index + 1, azimuthCount, { frame: index });
    }
    const artifactId = `${request.id}:software-silhouettes`;
    artifacts.set(artifactId, frames);
    return {
      observations: {
        silhouette: {
          assetId: artifactId,
          kind: "software-silhouette-set",
          metadata: { width: 128, height: 128, frames: azimuthCount }
        }
      },
      frames: frames.map((_, index) => ({
        frameIndex: index,
        azimuthDegrees: index / azimuthCount * 360,
        elevationDegrees: 0,
        atlasCell: [index, 0]
      }))
    };
  }
});

async function capture(formId) {
  const job = await engine.n.coreCapture.request({
    id: `capture-rock:${formId}:views`,
    subject: { objectId: object.id, formId },
    viewSet: { pattern: "around-subject", azimuthCount: 8, elevations: [0] },
    framing: { preserveGrounding: true, padding: 0.05 },
    observations: ["silhouette"],
    output: { kind: "atlas", frameSize: 128 }
  });
  assert.equal(job.state, "ready");
  const result = engine.n.coreCapture.getResult(job.id);
  return artifacts.get(result.observations.silhouette.assetId);
}

const sourceFrames = await capture("source");
const reducedFrames = await capture("reduced");
const pairs = [];
const ious = [];
for (let index = 0; index < sourceFrames.length; index += 1) {
  const sourceImage = sourceFrames[index];
  const reducedImage = reducedFrames[index];
  const sourceStats = silhouetteMetrics(sourceImage);
  const reducedStats = silhouetteMetrics(reducedImage);
  const iou = silhouetteIou(sourceImage, reducedImage);
  ious.push(iou);
  assert.ok(sourceStats.occupancy > 0.1 && sourceStats.occupancy < 0.85);
  assert.ok(reducedStats.occupancy > 0.08 && reducedStats.occupancy < 0.85);
  assert.equal(sourceStats.grounded, true);
  assert.equal(reducedStats.grounded, true);
  assert.ok(iou > 0.72, `view ${index} silhouette IoU ${iou.toFixed(3)} is too low`);
  pairs.push({ source: sourceImage, result: reducedImage });
}

const outputDirectory = await mkdtemp(join(tmpdir(), "nexus-object-shape-capture-"));
const outputPath = join(outputDirectory, "source-vs-reduced.svg");
await writeFile(outputPath, writeSilhouetteSvg(pairs), "utf8");
assert.ok((await import("node:fs/promises")).stat(outputPath));
structuredClone(engine.n.coreCapture.getSnapshot());

console.log("core capture shape visual smoke ok", {
  outputPath,
  minimumSilhouetteIou: Math.min(...ious),
  averageSilhouetteIou: ious.reduce((sum, value) => sum + value, 0) / ious.length,
  sourceTriangles: source.metrics.triangleCount,
  reducedTriangles: reduced.metrics.triangleCount
});
