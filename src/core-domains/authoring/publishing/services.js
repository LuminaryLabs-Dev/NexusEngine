import { evaluateAuthoringImage } from "../paint/image.js";
import { createObjectDescriptor } from "nexusengine/domains/object";
import { createAssetDescriptor } from "nexusengine/domains/asset/registry";
import {
  createRenderDescriptor,
  createMaterialDescriptor,
  createLightingDescriptor,
} from "nexusengine/domains/presentation/graphics";
import { registerDocumentService, reference } from "../contracts/services.js";
import {
  authoringError as error,
  canonical,
  freeze,
  hash,
  requireFields,
  requireInteger,
  requireText,
} from "../contracts/value.js";
import { evaluateAuthoringAssembly } from "../assembly/services.js";
import { evaluateAuthoringMesh, vunit } from "../mesh/evaluate.js";
import { inspectAuthoringMesh } from "../mesh/geometry.js";
export function normalizeAuthoringPublishing(c) {
  c = canonical(c);
  requireFields(
    c,
    [
      "assemblyId",
      "variantId",
      "maxInfluences",
      "allowWeightReduction",
      "smooth",
      "sharpAngle",
    ],
    "publishing",
  );
  requireText(c.assemblyId, "assembly ID");
  c.variantId ??= null;
  if (c.variantId !== null) requireText(c.variantId, "variant ID");
  c.maxInfluences = requireInteger(
    c.maxInfluences ?? 4,
    "delivery influences",
    4,
    4,
  );
  c.allowWeightReduction ??= false;
  c.smooth ??= true;
  if (
    typeof c.allowWeightReduction !== "boolean" ||
    typeof c.smooth !== "boolean"
  )
    throw error("AUTHORING_INVALID_PUBLISHING", "Flags must be boolean.");
  return c;
}
export function prepareAuthoringDelivery(project, input) {
  const profile = normalizeAuthoringPublishing(structuredClone(input)),
    assemblyDoc = project.getDocument(profile.assemblyId);
  if (assemblyDoc.kind !== "assembly")
    throw error(
      "AUTHORING_DEPENDENCY_KIND",
      "Publishing requires an assembly.",
    );
  const documents = new Map(),
    visit = (id) => {
      if (documents.has(id)) return;
      const d = project.getDocument(id);
      documents.set(id, d);
      for (const ref of d.dependencies) visit(ref.id);
    };
  visit(assemblyDoc.id);
  const assembly = evaluateAuthoringAssembly(assemblyDoc.content, {
      variantId: profile.variantId,
    }),
    source = [...documents.values()]
      .map((d) => ({
        id: d.id,
        kind: d.kind,
        revision: d.revision,
        hash: d.hash,
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
    meshes = [],
    materials = [],
    images = [],
    rigs = [],
    skins = [],
    animations = [],
    shapes = [],
    assets = [],
    warnings = [];
  for (const d of documents.values()) {
    if (d.kind === "mesh") {
      const evaluated = evaluateAuthoringMesh(d.content, {
        smooth: profile.smooth,
        sharpAngle: profile.sharpAngle,
      });
      meshes.push({
        id: d.id,
        sourceHash: d.hash,
        ...evaluated,
        bounds: inspectAuthoringMesh(d.content).bounds,
      });
      assets.push(
        createAssetDescriptor({
          id: d.id,
          type: "geometry",
          contentHash: d.hash,
          source: {
            schema: "nexusengine.authoring-source-reference/1",
            documentId: d.id,
            revision: d.revision,
          },
        }),
      );
    } else if (d.kind === "material") {
      const m = d.content;
      if (m.graph && !m.textures.baseColor)
        throw error(
          "AUTHORING_MATERIAL_BAKE_REQUIRED",
          `Material ${d.id} needs a baked base-color image binding.`,
        );
      const textures = Object.fromEntries(
        Object.entries(m.textures).map(([slot, b]) => [
          slot === "metallicRoughness"
            ? "packedMask"
            : slot === "occlusion"
              ? "ambientOcclusion"
              : slot,
          {
            assetId: b.imageId,
            uvSet: b.uvSet,
            sampler: {
              wrapS: b.wrapS,
              wrapT: b.wrapT,
              magFilter: b.magFilter,
              minFilter: b.minFilter,
            },
          },
        ]),
      );
      materials.push({
        id: d.id,
        sourceHash: d.hash,
        pbr: canonical(m),
        presentation: createMaterialDescriptor({
          id: d.id,
          revision: d.revision,
          color: m.baseColor.slice(0, 3),
          metalness: m.metallic,
          roughness: m.roughness,
          normalScale: m.normalScale,
          opacity: m.baseColor[3],
          transparent: m.alphaMode === "BLEND",
          textures,
          metadata: {
            alphaMode: m.alphaMode,
            alphaCutoff: m.alphaCutoff,
            doubleSided: m.doubleSided,
            emissive: m.emissive,
            occlusionStrength: m.occlusionStrength,
          },
        }),
      });
    } else if (d.kind === "image") {
      images.push({
        id: d.id,
        sourceHash: d.hash,
        raster: evaluateAuthoringImage(d.content),
      });
      assets.push(
        createAssetDescriptor({
          id: d.id,
          type: "image",
          contentHash: d.hash,
          source: {
            schema: "nexusengine.authoring-source-reference/1",
            documentId: d.id,
            revision: d.revision,
          },
        }),
      );
    } else if (d.kind === "rig")
      rigs.push({ id: d.id, ...canonical(d.content) });
    else if (d.kind === "skin") {
      let maximumLostWeight = 0,
        reducedVertices = 0;
      const weights = Object.fromEntries(
        Object.entries(d.content.weights).map(([id, list]) => {
          const sorted = [...list].sort(
            (a, b) => b.weight - a.weight || a.boneId.localeCompare(b.boneId),
          );
          if (sorted.length > profile.maxInfluences) {
            if (!profile.allowWeightReduction)
              throw error(
                "AUTHORING_WEIGHT_REDUCTION_REQUIRED",
                `Skin ${d.id} exceeds the delivery influence limit.`,
              );
            const sum = sorted
              .slice(0, profile.maxInfluences)
              .reduce((n, w) => n + w.weight, 0);
            maximumLostWeight = Math.max(maximumLostWeight, 1 - sum);
            reducedVertices++;
            return [
              id,
              sorted
                .slice(0, profile.maxInfluences)
                .map((w) => ({ ...w, weight: w.weight / sum })),
            ];
          }
          return [id, sorted];
        }),
      );
      skins.push({ id: d.id, ...canonical(d.content), weights });
      if (reducedVertices)
        warnings.push({
          code: "WEIGHTS_REDUCED",
          skinId: d.id,
          reducedVertices,
          maximumLostWeight,
        });
    } else if (d.kind === "animation")
      animations.push({ id: d.id, ...canonical(d.content) });
    else if (d.kind === "shape")
      shapes.push({ id: d.id, ...canonical(d.content) });
  }
  for (const shape of shapes) {
    const sourceMesh = documents.get(shape.meshId).content,
      base = meshes.find((m) => m.id === shape.meshId);
    shape.keys = shape.keys.map((key) => {
      const changed = {
          ...sourceMesh,
          vertices: sourceMesh.vertices.map((v) => ({
            ...v,
            position: v.position.map(
              (n, i) => n + (key.deltas[v.id]?.[i] ?? 0),
            ),
          })),
        },
        evaluated = evaluateAuthoringMesh(changed, {
          smooth: profile.smooth,
          sharpAngle: profile.sharpAngle,
        }),
        normals = new Map(
          evaluated.sourceCorners.map((id, i) => [
            id,
            evaluated.normals.slice(i * 3, i * 3 + 3),
          ]),
        );
      return {
        ...key,
        normalDeltas: base.sourceCorners.flatMap((id, i) => {
          const normal = normals.get(id);
          if (!normal)
            throw error(
              "AUTHORING_SHAPE_EVALUATION",
              "Shape changed evaluated corner identity.",
            );
          return normal.map((n, k) => n - base.normals[i * 3 + k]);
        }),
      };
    });
  }
  for (const rig of rigs)
    if (rig.constraints.length) {
      const { id, ...content } = rig,
        clips = animations
          .filter((a) => a.rigId === id)
          .flatMap((a) => a.clips);
      if (!clips.length || clips.some((c) => c.bake?.rigHash !== hash(content)))
        throw error(
          "AUTHORING_CONSTRAINT_BAKE_REQUIRED",
          `Rig ${id} needs every exported clip baked against its current constraints.`,
        );
    }
  for (const node of assembly.nodes)
    if (node.included && node.meshId) {
      const mesh = meshes.find((m) => m.id === node.meshId);
      if (!mesh.positions.length)
        throw error(
          "AUTHORING_EMPTY_DELIVERY_MESH",
          "Exported meshes need triangles.",
        );
      for (const id of node.materials) {
        const material = materials.find((m) => m.id === id);
        if (
          Object.keys(material.pbr.textures).length &&
          !documents
            .get(node.meshId)
            .content.attributes.some(
              (a) =>
                a.id === "uv0" &&
                Object.keys(a.values).length ===
                  documents
                    .get(node.meshId)
                    .content.faces.reduce((n, f) => n + f.corners.length, 0),
            )
        )
          throw error(
            "AUTHORING_UV_MISSING",
            `Textured mesh ${node.meshId} needs complete UVs.`,
          );
      }
    }
  const objects = assembly.nodes.map((n) =>
    createObjectDescriptor({
      id: n.id,
      type: n.meshId ? "mesh" : "group",
      transform: {
        position: n.transform.translation,
        rotation: n.transform.rotation,
        scale: n.transform.scale,
      },
      bounds: n.meshId
        ? meshes.find((m) => m.id === n.meshId).bounds
        : undefined,
      geometry: n.meshId,
      material: n.materials[0] ?? null,
      metadata: {
        parentId: n.parent,
        sourceDocument: assemblyDoc.id,
        revision: assemblyDoc.revision,
      },
    }),
  );
  const presentation = {
    objects: assembly.nodes
      .filter((n) => n.meshId)
      .map((n) =>
        createRenderDescriptor({
          id: n.id,
          assetId: n.meshId,
          materialId: n.materials[0] ?? null,
          transformId: n.id,
          visible: n.included,
          metadata: {
            materialIds: n.materials,
            skinId: n.skinId,
            shapeId: n.shapeId,
          },
        }),
      ),
    lights: assembly.lights.map((l) =>
      createLightingDescriptor({
        id: l.id,
        kind: l.type,
        color: l.color,
        intensity: l.intensity,
        metadata: { nodeId: l.nodeId, range: l.range ?? null },
      }),
    ),
    cameras: assembly.cameras,
  };
  const packet = {
    schema: "nexusengine.authoring-delivery/1",
    algorithm: "corner-evaluation-pbr-lbs/1",
    project: {
      projectId: project.context().projectId,
      epoch: project.context().epoch,
    },
    profile,
    source,
    assembly,
    objects,
    assets,
    presentation,
    meshes,
    materials,
    images,
    rigs,
    skins,
    animations,
    shapes,
    warnings,
  };
  packet.hash = hash(packet);
  return freeze(packet);
}
export function installAuthoringPublishingServices(project) {
  registerDocumentService(project, {
    kind: "publishing",
    normalize: normalizeAuthoringPublishing,
    dependencies: (c) => [reference(c.assemblyId, "assembly")],
    profile: "evaluated-pbr-rig-animation-packet/1",
  });
  const cache = new Map();
  return {
    normalize: normalizeAuthoringPublishing,
    prepare(input) {
      const profile =
        typeof input === "string" ? project.getDocument(input).content : input;
      const refs = [],
        seen = new Set(),
        visit = (id) => {
          if (seen.has(id)) return;
          seen.add(id);
          const d = project.getDocument(id);
          refs.push([d.id, d.revision, d.hash]);
          d.dependencies.forEach((r) => visit(r.id));
        };
      visit(profile.assemblyId);
      const key = hash({
        profile,
        refs,
        projectId: project.context().projectId,
        epoch: project.context().epoch,
      });
      if (cache.has(key)) return cache.get(key);
      const result = prepareAuthoringDelivery(project, profile);
      if (cache.size >= 8) cache.delete(cache.keys().next().value);
      cache.set(key, result);
      return result;
    },
    clearCache() {
      cache.clear();
    },
  };
}
