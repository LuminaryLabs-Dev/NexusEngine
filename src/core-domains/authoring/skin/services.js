import {
  registerDocumentService,
  reference,
  typedDocument,
} from "../contracts/services.js";
import {
  canonical,
  authoringError as error,
  requireFields,
  requireInteger,
  requireNumber,
  requireText,
  vector,
  hash,
} from "../contracts/value.js";
import { evaluateAuthoringRig } from "../rig/services.js";
import {
  inverseMatrix,
  multiplyMatrix,
  identityMatrix,
  transformPoint,
} from "../contracts/transforms.js";
import { meshEdges } from "../mesh/topology.js";
import { vsub, vdot, vadd, vmul } from "../mesh/evaluate.js";
export const meshTopologyHash = (m) =>
  hash({
    vertices: m.vertices.map((v) => v.id).sort(),
    faces: m.faces
      .map((f) => ({ id: f.id, vertices: f.vertices, corners: f.corners }))
      .sort((a, b) => a.id.localeCompare(b.id)),
  });
export const rigRestHash = (r) =>
  hash(
    r.bones
      .map((b) => ({
        id: b.id,
        parent: b.parent,
        rest: b.rest,
        length: b.length,
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
  );
export function normalizeAuthoringSkin(c) {
  c = canonical(c);
  requireFields(
    c,
    [
      "meshId",
      "rigId",
      "meshTopologyHash",
      "rigRestHash",
      "meshBindMatrix",
      "inverseBindMatrices",
      "weights",
      "locked",
      "unweightedPolicy",
    ],
    "skin",
  );
  for (const f of ["meshId", "rigId"]) requireText(c[f], f);
  for (const f of ["meshTopologyHash", "rigRestHash"])
    if (!/^sha256:[0-9a-f]{64}$/.test(c[f]))
      throw error("AUTHORING_INVALID_SKIN", "Missing source identity.");
  c.meshBindMatrix = vector(c.meshBindMatrix, 16);
  inverseMatrix(c.meshBindMatrix);
  if (
    c.meshBindMatrix.some(
      (n, i) => [3, 7, 11].includes(i) && Math.abs(n) > 1e-12,
    ) ||
    Math.abs(c.meshBindMatrix[15] - 1) > 1e-12
  )
    throw error("AUTHORING_INVALID_SKIN", "Bind matrix must be affine.");
  for (const field of ["inverseBindMatrices", "weights"])
    if (!c[field] || typeof c[field] !== "object" || Array.isArray(c[field]))
      throw error("AUTHORING_INVALID_SKIN", "Skin maps required.");
  for (const m of Object.values(c.inverseBindMatrices)) {
    vector(m, 16);
    inverseMatrix(m);
  }
  for (const influences of Object.values(c.weights)) {
    if (
      !Array.isArray(influences) ||
      !influences.length ||
      influences.length > 32 ||
      new Set(influences.map((w) => w.boneId)).size !== influences.length
    )
      throw error(
        "AUTHORING_INVALID_SKIN",
        "Weights need 1–32 unique influences.",
      );
    for (const w of influences) {
      requireFields(w, ["boneId", "weight"], "influence");
      requireText(w.boneId, "bone ID");
      requireNumber(w.weight, "weight", 0, 1);
    }
    if (Math.abs(influences.reduce((n, w) => n + w.weight, 0) - 1) > 1e-8)
      throw error("AUTHORING_UNNORMALIZED_WEIGHTS", "Weights must sum to one.");
  }
  c.locked ??= [];
  if (!Array.isArray(c.locked) || new Set(c.locked).size !== c.locked.length)
    throw error("AUTHORING_INVALID_SKIN", "Locked influences must be unique.");
  c.unweightedPolicy ??= "reject";
  if (c.unweightedPolicy !== "reject")
    throw error(
      "AUTHORING_UNSUPPORTED_SKIN",
      "Unweighted vertices must be rejected.",
    );
  return c;
}
function validateSkinReferences(c, get) {
  const mesh = get(c.meshId).content,
    rig = get(c.rigId).content;
  if (c.meshTopologyHash !== meshTopologyHash(mesh))
    throw error(
      "AUTHORING_SKIN_TOPOLOGY_CHANGED",
      "Bound topology changed; rebind or explicitly remap skin before committing.",
    );
  if (c.rigRestHash !== rigRestHash(rig))
    throw error(
      "AUTHORING_SKIN_REST_CHANGED",
      "Rig rest changed; rebind skin in the same transaction.",
    );
  const vertexIds = new Set(mesh.vertices.map((v) => v.id)),
    boneIds = new Set(rig.bones.map((b) => b.id));
  if (
    Object.keys(c.weights).length !== vertexIds.size ||
    Object.keys(c.weights).some((id) => !vertexIds.has(id))
  )
    throw error(
      "AUTHORING_INVALID_SKIN",
      "Weights must cover exactly the bound vertices.",
    );
  if (c.locked.some((id) => !boneIds.has(id)))
    throw error("AUTHORING_INVALID_SKIN", "Locked bone missing.");
  for (const influences of Object.values(c.weights))
    if (influences.some((w) => !boneIds.has(w.boneId)))
      throw error("AUTHORING_INVALID_SKIN", "Weight references missing bone.");
  const rest = evaluateAuthoringRig(rig, {}, { constraints: false });
  if (Object.keys(c.inverseBindMatrices).length !== boneIds.size)
    throw error(
      "AUTHORING_INVALID_SKIN",
      "Inverse bind matrices must cover the rig.",
    );
  for (const id of boneIds) {
    const expected = multiplyMatrix(
        inverseMatrix(rest.matrices[id]),
        c.meshBindMatrix,
      ),
      actual = c.inverseBindMatrices[id];
    if (
      !actual ||
      expected.some(
        (n, i) => Math.abs(n - actual[i]) > 1e-8 * Math.max(1, Math.abs(n)),
      )
    )
      throw error(
        "AUTHORING_INVALID_SKIN",
        "Inverse bind matrix does not match rest transforms.",
      );
  }
}
function normalizedInfluences(values) {
  const entries = [...values]
    .filter(([, w]) => w > 1e-12)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  if (!entries.length)
    throw error(
      "AUTHORING_UNWEIGHTED_VERTEX",
      "Cannot normalize an unweighted vertex.",
    );
  const sum = entries.reduce((n, [, w]) => n + w, 0);
  return entries.map(([boneId, w]) => ({ boneId, weight: w / sum }));
}
export function bindAuthoringSkin(
  meshId,
  mesh,
  rigId,
  rig,
  {
    power = 2,
    smoothing = 2,
    maxInfluences = 4,
    meshBindMatrix = identityMatrix(),
  } = {},
) {
  requireNumber(power, "distance power", 1, 8);
  requireInteger(smoothing, "smoothing passes", 0, 16);
  requireInteger(maxInfluences, "influences", 1, 32);
  const rest = evaluateAuthoringRig(rig, {}, { constraints: false }),
    segments = rig.bones.map((b) => ({
      id: b.id,
      a: transformPoint(rest.matrices[b.id], [0, 0, 0]),
      b: transformPoint(rest.matrices[b.id], [0, b.length, 0]),
    })),
    weights = Object.create(null),
    adj = new Map(mesh.vertices.map((v) => [v.id, new Set()]));
  for (const e of meshEdges(mesh).values()) {
    adj.get(e.a).add(e.b);
    adj.get(e.b).add(e.a);
  }
  for (const v of mesh.vertices) {
    const p = transformPoint(meshBindMatrix, v.position),
      distances = segments.map((s) => {
        const d = vsub(s.b, s.a),
          t = Math.max(0, Math.min(1, vdot(vsub(p, s.a), d) / vdot(d, d))),
          distance = Math.hypot(...vsub(p, vadd(s.a, vmul(d, t))));
        return [s.id, 1 / Math.max(distance, 1e-6) ** power];
      });
    weights[v.id] = normalizedInfluences(
      distances.sort((a, b) => b[1] - a[1]).slice(0, maxInfluences),
    );
  }
  for (let pass = 0; pass < smoothing; pass++) {
    const next = Object.create(null);
    for (const v of mesh.vertices) {
      const ids = [v.id, ...adj.get(v.id)],
        sum = new Map();
      for (const id of ids)
        for (const w of weights[id])
          sum.set(w.boneId, (sum.get(w.boneId) ?? 0) + w.weight / ids.length);
      next[v.id] = normalizedInfluences(
        [...sum].sort((a, b) => b[1] - a[1]).slice(0, maxInfluences),
      );
    }
    Object.assign(weights, next);
  }
  return normalizeAuthoringSkin({
    meshId,
    rigId,
    meshTopologyHash: meshTopologyHash(mesh),
    rigRestHash: rigRestHash(rig),
    meshBindMatrix,
    inverseBindMatrices: Object.fromEntries(
      rig.bones.map((b) => [
        b.id,
        multiplyMatrix(inverseMatrix(rest.matrices[b.id]), meshBindMatrix),
      ]),
    ),
    weights,
    locked: [],
    unweightedPolicy: "reject",
  });
}
export function deformAuthoringSkin(skin, mesh, rig, pose) {
  validateSkinReferences(skin, (id) => ({
    content: id === skin.meshId ? mesh : rig,
  }));
  const posed = evaluateAuthoringRig(rig, pose),
    inverseBind = inverseMatrix(skin.meshBindMatrix),
    matrices = Object.fromEntries(
      rig.bones.map((b) => [
        b.id,
        multiplyMatrix(
          multiplyMatrix(inverseBind, posed.matrices[b.id]),
          skin.inverseBindMatrices[b.id],
        ),
      ]),
    );
  return {
    vertices: mesh.vertices.map((v) => ({
      id: v.id,
      position: skin.weights[v.id].reduce(
        (p, w) =>
          vadd(
            p,
            vmul(transformPoint(matrices[w.boneId], v.position), w.weight),
          ),
        [0, 0, 0],
      ),
    })),
    diagnostics: posed.diagnostics,
  };
}
export function editAuthoringWeights(input, changes) {
  const skin = structuredClone(input);
  for (const [vertexId, replacement] of Object.entries(changes)) {
    if (!Object.hasOwn(skin.weights, vertexId))
      throw error("AUTHORING_ELEMENT_MISSING", "Weighted vertex missing.");
    const prior = new Map(
        skin.weights[vertexId].map((w) => [w.boneId, w.weight]),
      ),
      next = new Map(
        replacement.map((w) => [
          w.boneId,
          requireNumber(w.weight, "weight", 0, 1),
        ]),
      );
    if (next.size !== replacement.length)
      throw error("AUTHORING_INVALID_SKIN", "Duplicate influence.");
    let locked = 0;
    for (const id of skin.locked) {
      const w = prior.get(id) ?? 0;
      locked += w;
      next.set(id, w);
    }
    const free = [...next].filter(([id]) => !skin.locked.includes(id)),
      total = free.reduce((n, [, w]) => n + w, 0);
    if (locked < 1 - 1e-10 && total <= 1e-12)
      throw error("AUTHORING_UNWEIGHTED_VERTEX", "No unlocked weight remains.");
    skin.weights[vertexId] = [...next]
      .map(([boneId, w]) => ({
        boneId,
        weight: skin.locked.includes(boneId) ? w : ((1 - locked) * w) / total,
      }))
      .filter((w) => w.weight > 1e-12);
  }
  return normalizeAuthoringSkin(skin);
}
export function smoothAuthoringWeights(
  input,
  mesh,
  { vertices = null, iterations = 1, factor = 0.5 } = {},
) {
  let skin = normalizeAuthoringSkin(input);
  requireInteger(iterations, "weight smoothing passes", 1, 32);
  requireNumber(factor, "smoothing factor", 0, 1);
  const selected = new Set(vertices ?? mesh.vertices.map((v) => v.id)),
    adj = new Map(mesh.vertices.map((v) => [v.id, new Set()]));
  if ([...selected].some((id) => !adj.has(id)))
    throw error(
      "AUTHORING_ELEMENT_MISSING",
      "Weight smoothing vertex missing.",
    );
  for (const e of meshEdges(mesh).values()) {
    adj.get(e.a).add(e.b);
    adj.get(e.b).add(e.a);
  }
  for (let pass = 0; pass < iterations; pass++) {
    const changes = Object.create(null);
    for (const id of selected) {
      const neighbors = [...adj.get(id)];
      if (!neighbors.length) continue;
      const values = new Map(
        skin.weights[id].map((w) => [w.boneId, w.weight * (1 - factor)]),
      );
      for (const neighbor of neighbors)
        for (const w of skin.weights[neighbor])
          values.set(
            w.boneId,
            (values.get(w.boneId) ?? 0) +
              (factor * w.weight) / neighbors.length,
          );
      changes[id] = [...values].map(([boneId, weight]) => ({ boneId, weight }));
    }
    skin = editAuthoringWeights(skin, changes);
  }
  return skin;
}
export function mirrorAuthoringWeights(
  input,
  mesh,
  { axis = 0, direction = 1, tolerance = 1e-5, boneMap } = {},
) {
  const skin = normalizeAuthoringSkin(input);
  requireInteger(axis, "mirror axis", 0, 2);
  if (![1, -1].includes(direction))
    throw error("AUTHORING_INVALID_SKIN", "Mirror direction must be +1 or -1.");
  requireNumber(tolerance, "mirror tolerance", 1e-9, 1);
  if (!boneMap || typeof boneMap !== "object" || Array.isArray(boneMap))
    throw error("AUTHORING_INVALID_SKIN", "Explicit bone map required.");
  const keys = Object.keys(boneMap);
  if (new Set(Object.values(boneMap)).size !== keys.length)
    throw error("AUTHORING_INVALID_SKIN", "Bone map must be one-to-one.");
  keys.forEach((id) => {
    requireText(id, "source bone");
    requireText(boneMap[id], "target bone");
  });
  const grid = new Map(),
    cell = (p) => p.map((n) => Math.floor(n / tolerance)),
    key = (c) => c.join(",");
  for (const v of mesh.vertices) {
    const k = key(cell(v.position));
    if (!grid.has(k)) grid.set(k, []);
    grid.get(k).push(v);
  }
  const changes = Object.create(null);
  for (const source of mesh.vertices) {
    if (source.position[axis] * direction <= tolerance) continue;
    const point = source.position.map((n, i) => (i === axis ? -n : n)),
      c = cell(point),
      matches = [];
    for (let x = -1; x <= 1; x++)
      for (let y = -1; y <= 1; y++)
        for (let z = -1; z <= 1; z++)
          for (const target of grid.get(key([c[0] + x, c[1] + y, c[2] + z])) ??
            [])
            if (
              Math.hypot(...target.position.map((n, i) => n - point[i])) <=
              tolerance
            )
              matches.push(target);
    if (matches.length !== 1)
      throw error(
        "AUTHORING_SKIN_MIRROR_MATCH",
        "Each mirrored source vertex needs exactly one matching target.",
      );
    changes[matches[0].id] = skin.weights[source.id].map((w) => {
      if (!Object.hasOwn(boneMap, w.boneId))
        throw error(
          "AUTHORING_SKIN_MIRROR_BONE",
          "An influence has no explicit mirror mapping.",
        );
      return { boneId: boneMap[w.boneId], weight: w.weight };
    });
  }
  return editAuthoringWeights(skin, changes);
}
export function installAuthoringSkinServices(project, brush) {
  const register = registerDocumentService(project, {
    kind: "skin",
    normalize: normalizeAuthoringSkin,
    dependencies: (c) => [
      reference(c.meshId, "mesh"),
      reference(c.rigId, "rig"),
    ],
    validateReferences: validateSkinReferences,
    profile: "linear-blend-distance-to-segment-diffused-binding/1",
  });
  register(
    "bind",
    ["id", "expectedRevision", "meshId", "rigId", "parameters"],
    (tx, a) => {
      const m = typedDocument(tx, a.meshId, "mesh"),
        r = typedDocument(tx, a.rigId, "rig");
      tx.put(
        {
          id: a.id,
          kind: "skin",
          content: bindAuthoringSkin(
            m.id,
            m.content,
            r.id,
            r.content,
            a.parameters,
          ),
        },
        a.expectedRevision,
      );
      return {
        id: a.id,
        method: "inverse-distance-to-segments with adjacency smoothing",
      };
    },
  );
  register("weights", ["id", "expectedRevision", "values"], (tx, a) => {
    const d = typedDocument(tx, a.id, "skin", a.expectedRevision);
    tx.put(
      { ...d, content: editAuthoringWeights(d.content, a.values) },
      a.expectedRevision,
    );
    return { id: d.id };
  });
  register("paint", ["id", "expectedRevision", "boneId", "stroke"], (tx, a) => {
    const d = typedDocument(tx, a.id, "skin", a.expectedRevision),
      mesh = typedDocument(tx, d.content.meshId, "mesh").content,
      c = brush.normalize(structuredClone(a.stroke)),
      samples = brush.sample(c),
      changes = Object.create(null);
    if (d.content.locked.includes(a.boneId))
      throw error("AUTHORING_LOCKED_INFLUENCE", "Paint target is locked.");
    for (const v of mesh.vertices) {
      let amount = 0;
      for (const s of samples) amount += brush.influence(c, s, v.position);
      if (!amount) continue;
      const old = d.content.weights[v.id],
        prior = old.find((w) => w.boneId === a.boneId)?.weight ?? 0,
        next = Math.max(0, Math.min(1, prior + amount)),
        other = old.filter((w) => w.boneId !== a.boneId);
      changes[v.id] = [
        ...other.map((w) => ({
          ...w,
          weight: ((1 - next) * w.weight) / Math.max(1e-12, 1 - prior),
        })),
        { boneId: a.boneId, weight: next },
      ];
    }
    tx.put(
      { ...d, content: editAuthoringWeights(d.content, changes) },
      a.expectedRevision,
    );
    return { id: d.id, vertices: Object.keys(changes).length };
  });
  register("smooth", ["id", "expectedRevision", "parameters"], (tx, a) => {
    const d = typedDocument(tx, a.id, "skin", a.expectedRevision);
    tx.put(
      {
        ...d,
        content: smoothAuthoringWeights(
          d.content,
          tx.get(d.content.meshId).content,
          a.parameters,
        ),
      },
      a.expectedRevision,
    );
    return { id: d.id };
  });
  register("mirror", ["id", "expectedRevision", "parameters"], (tx, a) => {
    const d = typedDocument(tx, a.id, "skin", a.expectedRevision);
    tx.put(
      {
        ...d,
        content: mirrorAuthoringWeights(
          d.content,
          tx.get(d.content.meshId).content,
          a.parameters,
        ),
      },
      a.expectedRevision,
    );
    return { id: d.id };
  });
  register("lock", ["id", "expectedRevision", "boneIds"], (tx, a) => {
    const d = typedDocument(tx, a.id, "skin", a.expectedRevision);
    tx.put(
      { ...d, content: { ...d.content, locked: a.boneIds } },
      a.expectedRevision,
    );
    return { id: d.id };
  });
  return {
    smooth: smoothAuthoringWeights,
    mirror: mirrorAuthoringWeights,
    normalize: normalizeAuthoringSkin,
    bind: bindAuthoringSkin,
    deform: deformAuthoringSkin,
    editWeights: editAuthoringWeights,
    evaluate(id, pose) {
      const d = project.getDocument(id).content;
      return deformAuthoringSkin(
        d,
        project.getDocument(d.meshId).content,
        project.getDocument(d.rigId).content,
        pose,
      );
    },
  };
}
