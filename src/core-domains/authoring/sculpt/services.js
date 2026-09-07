import { serviceRegistrar, typedDocument } from "../contracts/services.js";
import {
  authoringError as error,
  requireFields,
  requireNumber,
  vector,
} from "../contracts/value.js";
import { normalizeAuthoringMesh } from "../mesh/geometry.js";
import { meshEdges } from "../mesh/topology.js";
import {
  evaluateAuthoringMesh,
  vadd,
  vmul,
  vdot,
  vsub,
  vunit,
} from "../mesh/evaluate.js";
export function sculptAuthoringMesh(input, brush, args) {
  requireFields(
    args,
    ["mode", "stroke", "offset", "normal", "planePoint", "layerStrength"],
    "sculpt",
  );
  if (!["grab", "inflate", "smooth", "flatten", "mask"].includes(args.mode))
    throw error("AUTHORING_UNSUPPORTED_SCULPT", "Unknown sculpt brush.");
  let mesh = normalizeAuthoringMesh(input);
  const c = brush.normalize(structuredClone(args.stroke)),
    samples = brush.sample(c),
    strength = requireNumber(args.layerStrength ?? 1, "layer strength", 0, 1);
  const offset = vector(args.offset ?? [0, 0, 0]),
    normal = vunit(vector(args.normal ?? [0, 1, 0])),
    planePoint = vector(args.planePoint ?? [0, 0, 0]);
  const maskAttribute = mesh.attributes.find(
      (a) => a.id === "mask" && a.domain === "vertex",
    ),
    mask = Object.assign(Object.create(null), maskAttribute?.values ?? {}),
    adj = new Map(mesh.vertices.map((v) => [v.id, new Set()]));
  for (const e of meshEdges(mesh).values()) {
    adj.get(e.a).add(e.b);
    adj.get(e.b).add(e.a);
  }
  const evalMesh = evaluateAuthoringMesh(mesh, { sharpAngle: Math.PI }),
    normals = new Map();
  evalMesh.sourceVertices.forEach((id, i) =>
    normals.set(id, evalMesh.normals.slice(i * 3, i * 3 + 3)),
  );
  for (const sample of samples) {
    const old = new Map(mesh.vertices.map((v) => [v.id, v.position]));
    mesh.vertices = mesh.vertices.map((v) => {
      const amount =
        brush.influence(
          c,
          sample,
          v.position,
          args.mode === "mask" ? 0 : (mask[v.id]?.[0] ?? 0),
        ) * strength;
      if (!amount) return v;
      if (args.mode === "mask") {
        mask[v.id] = [
          Math.max(0, Math.min(1, (mask[v.id]?.[0] ?? 0) + amount)),
        ];
        return v;
      }
      let delta = offset;
      if (args.mode === "inflate") delta = normals.get(v.id) ?? normal;
      if (args.mode === "flatten")
        delta = vmul(normal, -vdot(vsub(v.position, planePoint), normal));
      if (args.mode === "smooth") {
        const ids = [...adj.get(v.id)];
        delta = ids.length
          ? vsub(
              vmul(
                ids.reduce((p, id) => vadd(p, old.get(id)), [0, 0, 0]),
                1 / ids.length,
              ),
              v.position,
            )
          : [0, 0, 0];
      }
      return { ...v, position: vadd(v.position, vmul(delta, amount)) };
    });
  }
  if (args.mode === "mask")
    mesh.attributes = [
      ...mesh.attributes.filter((a) => a.id !== "mask"),
      { id: "mask", domain: "vertex", arity: 1, values: mask },
    ];
  return normalizeAuthoringMesh(mesh);
}
export function installAuthoringSculptServices(project, brush) {
  const register = serviceRegistrar(
    project,
    "sculpt",
    "fixed-topology-reversible-brush-deltas/1",
  );
  register("stroke", ["id", "expectedRevision", "parameters"], (tx, a) => {
    const d = typedDocument(tx, a.id, "mesh", a.expectedRevision),
      mesh = sculptAuthoringMesh(d.content, brush, a.parameters);
    tx.put({ ...d, content: mesh }, a.expectedRevision);
    return { id: d.id };
  });
  return {
    apply: (mesh, args) => sculptAuthoringMesh(mesh, brush, args),
    preview: (request) => project.preview(request),
  };
}
