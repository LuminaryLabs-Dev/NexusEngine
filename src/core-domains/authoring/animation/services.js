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
import {
  quaternion,
  normalizeTransform,
  quatSlerp,
  quatMultiply,
  quatInverse,
  quatAngle,
} from "../contracts/transforms.js";
import { evaluateAuthoringRig } from "../rig/services.js";
import { meshTopologyHash } from "../skin/services.js";
const width = (property) =>
  property === "rotation" ? 4 : property === "weight" ? 1 : 3;
function normalizeClip(clip) {
  requireFields(clip, ["id", "name", "duration", "tracks", "bake"], "clip");
  requireText(clip.id, "clip ID");
  requireText(clip.name, "clip name");
  requireNumber(clip.duration, "duration", 0, 86400);
  if (!Array.isArray(clip.tracks) || clip.tracks.length > 4096)
    throw error("AUTHORING_INVALID_ANIMATION", "Invalid tracks.");
  const ids = new Set(),
    targets = new Set();
  for (const t of clip.tracks) {
    requireFields(
      t,
      ["id", "target", "property", "interpolation", "keys"],
      "track",
    );
    requireText(t.id, "track ID");
    requireText(t.target, "target ID");
    if (ids.has(t.id) || targets.has(`${t.target}:${t.property}`))
      throw error(
        "AUTHORING_INVALID_ANIMATION",
        "Duplicate track ID or target property.",
      );
    ids.add(t.id);
    targets.add(`${t.target}:${t.property}`);
    if (
      !["translation", "rotation", "scale", "weight"].includes(t.property) ||
      !["STEP", "LINEAR", "CUBICSPLINE"].includes(t.interpolation)
    )
      throw error(
        "AUTHORING_UNSUPPORTED_ANIMATION",
        "Unsupported track property or interpolation.",
      );
    if (!Array.isArray(t.keys) || !t.keys.length || t.keys.length > 100000)
      throw error("AUTHORING_INVALID_ANIMATION", "Track needs keys.");
    let prior = -1;
    for (const k of t.keys) {
      requireFields(k, ["time", "value", "inTangent", "outTangent"], "key");
      requireNumber(k.time, "key time", 0, clip.duration);
      if (k.time <= prior)
        throw error("AUTHORING_INVALID_ANIMATION", "Key times must increase.");
      prior = k.time;
      k.value = vector(k.value, width(t.property));
      if (t.property === "rotation") k.value = quaternion(k.value);
      if (t.property === "scale" && k.value.some((n) => Math.abs(n) < 1e-6))
        throw error("AUTHORING_INVALID_ANIMATION", "Singular scale key.");
      if (t.interpolation === "CUBICSPLINE") {
        vector(k.inTangent, width(t.property));
        vector(k.outTangent, width(t.property));
      } else if (k.inTangent !== undefined || k.outTangent !== undefined)
        throw error(
          "AUTHORING_INVALID_ANIMATION",
          "Tangents require CUBICSPLINE.",
        );
    }
  }
  if (clip.bake !== undefined) {
    requireFields(
      clip.bake,
      [
        "rigHash",
        "sampleRate",
        "maximumTranslationError",
        "maximumAngleError",
        "maximumScaleError",
      ],
      "constraint bake evidence",
    );
    if (!/^sha256:[0-9a-f]{64}$/.test(clip.bake.rigHash))
      throw error("AUTHORING_INVALID_ANIMATION", "Invalid baked rig identity.");
    requireInteger(clip.bake.sampleRate, "sample rate", 1, 240);
    for (const key of [
      "maximumTranslationError",
      "maximumAngleError",
      "maximumScaleError",
    ])
      requireNumber(clip.bake[key], key, 0, 1e6);
  }
  return clip;
}
export function normalizeAuthoringAnimation(c) {
  c = canonical(c);
  requireFields(
    c,
    ["rigId", "shapeId", "clips", "poses", "arrangements"],
    "animation",
  );
  c.rigId ??= null;
  c.shapeId ??= null;
  if (c.rigId === null && c.shapeId === null)
    throw error(
      "AUTHORING_INVALID_ANIMATION",
      "A rig or shape source is required.",
    );
  if (c.rigId !== null) requireText(c.rigId, "rig ID");
  if (c.shapeId !== null) requireText(c.shapeId, "shape ID");
  if (
    !Array.isArray(c.clips) ||
    !c.clips.length ||
    new Set(c.clips.map((v) => v.id)).size !== c.clips.length
  )
    throw error("AUTHORING_INVALID_ANIMATION", "Clips must have unique IDs.");
  c.clips = c.clips.map(normalizeClip);
  c.poses ??= [];
  if (
    !Array.isArray(c.poses) ||
    new Set(c.poses.map((p) => p.id)).size !== c.poses.length
  )
    throw error("AUTHORING_INVALID_ANIMATION", "Poses must be unique.");
  for (const p of c.poses) {
    requireFields(p, ["id", "bones"], "pose");
    requireText(p.id, "pose ID");
    if (!p.bones || typeof p.bones !== "object" || Array.isArray(p.bones))
      throw error("AUTHORING_INVALID_ANIMATION", "Pose needs bone transforms.");
    p.bones = Object.fromEntries(
      Object.entries(p.bones).map(([id, t]) => [id, normalizeTransform(t)]),
    );
  }
  c.arrangements ??= [];
  for (const a of c.arrangements) {
    requireFields(a, ["clipId", "start", "in", "out", "speed"], "arrangement");
    const clip = c.clips.find((clip) => clip.id === a.clipId);
    if (!clip)
      throw error("AUTHORING_INVALID_ANIMATION", "Arrangement clip missing.");
    requireNumber(a.start, "start", 0, 86400);
    requireNumber(a.in, "trim in", 0, clip.duration);
    requireNumber(a.out, "trim out", a.in, clip.duration);
    requireNumber(a.speed, "speed", 0.001, 1000);
  }
  return c;
}
export function sampleAuthoringTrack(t, time) {
  if (time <= t.keys[0].time) return [...t.keys[0].value];
  if (time >= t.keys.at(-1).time) return [...t.keys.at(-1).value];
  let lo = 0,
    hi = t.keys.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (t.keys[mid].time > time) hi = mid;
    else lo = mid;
  }
  const a = t.keys[lo],
    b = t.keys[hi],
    dt = b.time - a.time,
    u = (time - a.time) / dt;
  if (t.interpolation === "STEP") return [...a.value];
  if (t.interpolation === "LINEAR")
    return t.property === "rotation"
      ? quatSlerp(a.value, b.value, u)
      : a.value.map((n, i) => n * (1 - u) + b.value[i] * u);
  const u2 = u * u,
    u3 = u2 * u,
    value = a.value.map(
      (n, i) =>
        (2 * u3 - 3 * u2 + 1) * n +
        (u3 - 2 * u2 + u) * dt * a.outTangent[i] +
        (-2 * u3 + 3 * u2) * b.value[i] +
        (u3 - u2) * dt * b.inTangent[i],
    );
  return t.property === "rotation" ? quaternion(value) : value;
}
export function sampleAuthoringClip(clip, time, rest = {}) {
  requireNumber(time, "sample time");
  const pose = structuredClone(rest),
    weights = Object.create(null);
  for (const t of clip.tracks) {
    const value = sampleAuthoringTrack(t, time);
    if (t.property === "weight") weights[t.target] = value[0];
    else {
      const current = Object.hasOwn(pose, t.target)
        ? pose[t.target]
        : normalizeTransform();
      Object.defineProperty(pose, t.target, {
        value: normalizeTransform({ ...current, [t.property]: value }),
        writable: true,
        enumerable: true,
        configurable: true,
      });
    }
  }
  return { pose, weights };
}
function validateAnimationReferences(c, get) {
  const bones = new Set(
      c.rigId === null ? [] : get(c.rigId).content.bones.map((b) => b.id),
    ),
    shapes = new Set(
      c.shapeId === null ? [] : get(c.shapeId).content.keys.map((k) => k.id),
    );
  for (const clip of c.clips)
    for (const track of clip.tracks)
      if (!(track.property === "weight" ? shapes : bones).has(track.target))
        throw error(
          "AUTHORING_ANIMATION_TARGET_MISSING",
          `Animation target ${track.target} is missing.`,
        );
  for (const p of c.poses)
    for (const id of Object.keys(p.bones))
      if (!bones.has(id))
        throw error(
          "AUTHORING_ANIMATION_TARGET_MISSING",
          "Named pose bone is missing.",
        );
}
export function normalizeAuthoringShape(c) {
  c = canonical(c);
  requireFields(c, ["meshId", "topologyHash", "keys"], "shape");
  requireText(c.meshId, "mesh ID");
  if (
    !/^sha256:[0-9a-f]{64}$/.test(c.topologyHash) ||
    !Array.isArray(c.keys) ||
    new Set(c.keys.map((k) => k.id)).size !== c.keys.length
  )
    throw error("AUTHORING_INVALID_SHAPE", "Invalid shape keys.");
  requireInteger(c.keys.length, "shape count", 1, 64);
  for (const key of c.keys) {
    requireFields(key, ["id", "weight", "deltas"], "shape key");
    requireText(key.id, "shape ID");
    requireNumber(key.weight, "shape weight", -10, 10);
    if (
      !key.deltas ||
      typeof key.deltas !== "object" ||
      Array.isArray(key.deltas)
    )
      throw error("AUTHORING_INVALID_SHAPE", "Shape deltas required.");
    for (const delta of Object.values(key.deltas)) vector(delta);
  }
  return c;
}
function checkSampleError(property, expected, actual, evidence) {
  const key =
      property === "rotation"
        ? "maximumAngleError"
        : property === "translation"
          ? "maximumTranslationError"
          : "maximumScaleError",
    difference =
      property === "rotation"
        ? quatAngle(expected, actual)
        : Math.max(...expected.map((n, i) => Math.abs(n - actual[i])));
  evidence[key] = Math.max(evidence[key], difference);
}
function assertSampleError(evidence) {
  if (
    evidence.maximumAngleError > Math.PI / 1800 ||
    evidence.maximumTranslationError > 0.001 ||
    evidence.maximumScaleError > 0.0001
  )
    throw error(
      "AUTHORING_ANIMATION_BAKE_ERROR",
      "Sampled bake exceeds 0.1 degrees, 0.001 source units or 0.0001 scale error; increase sample rate or simplify the motion.",
      evidence,
    );
}
export function retargetAuthoringClip(
  clip,
  source,
  target,
  mapping,
  { scale = 1, sampleRate = 30 } = {},
) {
  requireNumber(scale, "translation scale", 1e-6, 1e6);
  requireInteger(sampleRate, "sample rate", 1, 240);
  const src = new Map(source.bones.map((b) => [b.id, b])),
    dst = new Map(target.bones.map((b) => [b.id, b]));
  for (const track of clip.tracks)
    if (
      track.property === "weight" ||
      !Object.hasOwn(mapping, track.target) ||
      !dst.has(mapping[track.target])
    )
      throw error(
        "AUTHORING_RETARGET_MAPPING",
        "Every source track needs an explicit target bone mapping.",
      );
  if (new Set(Object.values(mapping)).size !== Object.values(mapping).length)
    throw error("AUTHORING_RETARGET_MAPPING", "Mapping must be one-to-one.");
  const evidence = {
      maximumTranslationError: 0,
      maximumAngleError: 0,
      maximumScaleError: 0,
    },
    tracks = clip.tracks.map((t) => {
      const a = src.get(t.target),
        b = dst.get(mapping[t.target]);
      if (!a || !b)
        throw error("AUTHORING_RETARGET_MAPPING", "Mapped bone missing.");
      const convert = (value) =>
        t.property === "rotation"
          ? quatMultiply(
              b.rest.rotation,
              quatMultiply(quatInverse(a.rest.rotation), value),
            )
          : t.property === "translation"
            ? value.map(
                (n, i) =>
                  b.rest.translation[i] + (n - a.rest.translation[i]) * scale,
              )
            : value.map((n, i) => (b.rest.scale[i] * n) / a.rest.scale[i]);
      const count = Math.ceil(clip.duration * sampleRate);
      if (count > 99999)
        throw error(
          "AUTHORING_ANIMATION_BUDGET",
          "Retarget exceeds key budget.",
        );
      const keys =
          t.interpolation === "CUBICSPLINE"
            ? Array.from({ length: count + 1 }, (_, i) => {
                const time = Math.min(clip.duration, i / sampleRate);
                return { time, value: convert(sampleAuthoringTrack(t, time)) };
              })
            : t.keys.map((k) => ({ time: k.time, value: convert(k.value) })),
        result = {
          ...t,
          target: b.id,
          interpolation: t.interpolation === "STEP" ? "STEP" : "LINEAR",
          keys,
        };
      for (let i = 0; i < keys.length - 1; i++)
        for (const fraction of [0.25, 0.5, 0.75]) {
          const time =
            keys[i].time + (keys[i + 1].time - keys[i].time) * fraction;
          checkSampleError(
            t.property,
            convert(sampleAuthoringTrack(t, time)),
            sampleAuthoringTrack(result, time),
            evidence,
          );
        }
      return result;
    });
  assertSampleError(evidence);
  const result = { ...clip, tracks };
  delete result.bake;
  return normalizeClip(result);
}
export function sampleAuthoringArrangement(input, time, rest = {}) {
  const c = normalizeAuthoringAnimation(input);
  requireNumber(time, "arrangement time", 0, 86400);
  const pose = canonical(rest),
    weights = Object.create(null),
    active = [];
  for (const entry of c.arrangements) {
    const end = entry.start + (entry.out - entry.in) / entry.speed;
    if (time < entry.start || time > end) continue;
    const clip = c.clips.find((c) => c.id === entry.clipId),
      sample = sampleAuthoringClip(
        clip,
        entry.in + (time - entry.start) * entry.speed,
        rest,
      );
    for (const track of clip.tracks) {
      if (track.property === "weight")
        weights[track.target] = sample.weights[track.target];
      else {
        const previous = Object.hasOwn(pose, track.target)
          ? pose[track.target]
          : normalizeTransform();
        Object.defineProperty(pose, track.target, {
          value: {
            ...previous,
            [track.property]: sample.pose[track.target][track.property],
          },
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
    }
    active.push(entry.clipId);
  }
  return {
    pose,
    weights,
    active,
    overlapPolicy:
      "later arrangement entries override the same target property",
  };
}
export function installAuthoringAnimationServices(project) {
  const register = registerDocumentService(project, {
    kind: "animation",
    normalize: normalizeAuthoringAnimation,
    dependencies: (c) => [
      ...(c.rigId ? [reference(c.rigId, "rig")] : []),
      ...(c.shapeId ? [reference(c.shapeId, "shape")] : []),
    ],
    validateReferences: validateAnimationReferences,
    profile:
      "seconds-trs-step-linear-hermite-relative-morph-rest-aligned-retarget/1",
  });
  project.registerKind({
    id: "shape",
    version: 1,
    normalize: normalizeAuthoringShape,
    dependencies: (c) => [reference(c.meshId, "mesh")],
    validateReferences(c, get) {
      const m = get(c.meshId).content;
      if (meshTopologyHash(m) !== c.topologyHash)
        throw error(
          "AUTHORING_SHAPE_TOPOLOGY_CHANGED",
          "Shape topology changed; remap or recreate shape keys.",
        );
      const ids = new Set(m.vertices.map((v) => v.id));
      for (const k of c.keys)
        if (Object.keys(k.deltas).some((id) => !ids.has(id)))
          throw error(
            "AUTHORING_INVALID_SHAPE",
            "Shape references missing vertex.",
          );
    },
  });
  register("shape", ["id", "expectedRevision", "meshId", "keys"], (tx, a) => {
    const m = typedDocument(tx, a.meshId, "mesh");
    tx.put(
      {
        id: a.id,
        kind: "shape",
        content: {
          meshId: a.meshId,
          topologyHash: meshTopologyHash(m.content),
          keys: a.keys,
        },
      },
      a.expectedRevision,
    );
    return { id: a.id };
  });
  register(
    "key",
    ["id", "expectedRevision", "clipId", "trackId", "key", "removeTime"],
    (tx, a) => {
      const d = typedDocument(tx, a.id, "animation", a.expectedRevision),
        c = structuredClone(d.content),
        clip = c.clips.find((c) => c.id === a.clipId),
        track = clip?.tracks.find((t) => t.id === a.trackId);
      if (!track) throw error("AUTHORING_ELEMENT_MISSING", "Track missing.");
      if (a.key && a.removeTime !== undefined)
        throw error(
          "AUTHORING_INVALID_INPUT",
          "Insert or delete a key, not both.",
        );
      if (a.key) {
        track.keys = track.keys.filter((k) => k.time !== a.key.time);
        track.keys.push(a.key);
        track.keys.sort((a, b) => a.time - b.time);
      } else {
        requireNumber(a.removeTime, "removeTime");
        if (!track.keys.some((k) => k.time === a.removeTime))
          throw error("AUTHORING_ELEMENT_MISSING", "Key missing.");
        track.keys = track.keys.filter((k) => k.time !== a.removeTime);
      }
      delete clip.bake;
      tx.put({ ...d, content: c }, a.expectedRevision);
      return { id: d.id };
    },
  );
  register(
    "retarget",
    ["id", "outputId", "targetRigId", "mapping", "parameters"],
    (tx, a) => {
      const d = typedDocument(tx, a.id, "animation"),
        src = typedDocument(tx, d.content.rigId, "rig"),
        dst = typedDocument(tx, a.targetRigId, "rig");
      tx.put({
        id: a.outputId,
        kind: "animation",
        content: {
          rigId: dst.id,
          shapeId: null,
          clips: d.content.clips.map((c) =>
            retargetAuthoringClip(
              c,
              src.content,
              dst.content,
              a.mapping,
              a.parameters,
            ),
          ),
          poses: [],
          arrangements: [],
        },
      });
      return { id: a.outputId };
    },
  );
  register(
    "bake-constraints",
    ["id", "expectedRevision", "clipId", "sampleRate"],
    (tx, a) => {
      const d = typedDocument(tx, a.id, "animation", a.expectedRevision),
        rig = typedDocument(tx, d.content.rigId, "rig").content,
        clip = d.content.clips.find((c) => c.id === a.clipId);
      if (!clip) throw error("AUTHORING_ELEMENT_MISSING", "Clip missing.");
      const rate = requireInteger(a.sampleRate ?? 30, "sample rate", 1, 240),
        rest = Object.fromEntries(rig.bones.map((b) => [b.id, b.rest])),
        count = Math.ceil(clip.duration * rate);
      if (count > 99999)
        throw error("AUTHORING_ANIMATION_BUDGET", "Bake exceeds key budget.");
      if (
        clip.tracks.some(
          (t) => t.interpolation === "STEP" && t.property !== "weight",
        )
      )
        throw error(
          "AUTHORING_UNSUPPORTED_ANIMATION",
          "Constraint bake profile requires continuous skeletal tracks.",
        );
      const tracks = rig.bones.flatMap((b) =>
          ["translation", "rotation", "scale"].map((property) => ({
            id: `bake:${b.id}:${property}`,
            target: b.id,
            property,
            interpolation: "LINEAR",
            keys: [],
          })),
        ),
        evaluate = (time) => {
          const pose = evaluateAuthoringRig(
            rig,
            sampleAuthoringClip(clip, time, rest).pose,
          );
          if (pose.diagnostics.some((d) => !d.reached))
            throw error(
              "AUTHORING_IK_UNREACHED",
              "Constraint bake failed its IK tolerance.",
            );
          return pose;
        };
      for (let i = 0; i <= count; i++) {
        const time = Math.min(clip.duration, i / rate),
          pose = evaluate(time);
        for (const t of tracks)
          t.keys.push({ time, value: pose.locals[t.target][t.property] });
      }
      const evidence = {
        rigHash: hash(rig),
        sampleRate: rate,
        maximumTranslationError: 0,
        maximumAngleError: 0,
        maximumScaleError: 0,
      };
      for (let i = 0; i < count; i++)
        for (const fraction of [0.25, 0.5, 0.75]) {
          const time =
              tracks[0].keys[i].time +
              (tracks[0].keys[i + 1].time - tracks[0].keys[i].time) * fraction,
            expected = evaluate(time);
          for (const t of tracks)
            checkSampleError(
              t.property,
              expected.locals[t.target][t.property],
              sampleAuthoringTrack(t, time),
              evidence,
            );
        }
      assertSampleError(evidence);
      tracks.push(...clip.tracks.filter((t) => t.property === "weight"));
      tx.put(
        {
          ...d,
          content: {
            ...d.content,
            clips: d.content.clips.map((c) =>
              c.id === clip.id ? { ...c, tracks, bake: evidence } : c,
            ),
          },
        },
        a.expectedRevision,
      );
      return { id: d.id, keys: count + 1, evidence };
    },
  );
  register(
    "bake-morph",
    ["id", "expectedRevision", "clipId", "sampleRate"],
    (tx, a) => {
      const d = typedDocument(tx, a.id, "animation", a.expectedRevision),
        clip = d.content.clips.find((c) => c.id === a.clipId);
      if (!clip) throw error("AUTHORING_ELEMENT_MISSING", "Clip missing.");
      const rate = requireInteger(a.sampleRate ?? 30, "sample rate", 1, 240),
        count = Math.ceil(clip.duration * rate);
      if (count > 99999)
        throw error(
          "AUTHORING_ANIMATION_BUDGET",
          "Morph bake exceeds key budget.",
        );
      let maximumWeightError = 0;
      const tracks = clip.tracks.map((t) => {
        if (t.property !== "weight") return t;
        if (t.interpolation === "STEP")
          throw error(
            "AUTHORING_UNSUPPORTED_ANIMATION",
            "Use a common STEP key timeline; continuous morph baking does not approximate discontinuities.",
          );
        const keys = Array.from({ length: count + 1 }, (_, i) => {
            const time = Math.min(clip.duration, i / rate);
            return { time, value: sampleAuthoringTrack(t, time) };
          }),
          out = { ...t, interpolation: "LINEAR", keys };
        for (let i = 0; i < keys.length - 1; i++)
          for (const f of [0.25, 0.5, 0.75]) {
            const time = keys[i].time + (keys[i + 1].time - keys[i].time) * f;
            maximumWeightError = Math.max(
              maximumWeightError,
              Math.abs(
                sampleAuthoringTrack(t, time)[0] -
                  sampleAuthoringTrack(out, time)[0],
              ),
            );
          }
        return out;
      });
      if (maximumWeightError > 0.001)
        throw error(
          "AUTHORING_ANIMATION_BAKE_ERROR",
          "Morph bake exceeds 0.001 weight error.",
          { maximumWeightError },
        );
      tx.put(
        {
          ...d,
          content: {
            ...d.content,
            clips: d.content.clips.map((c) =>
              c.id === clip.id ? { ...c, tracks } : c,
            ),
          },
        },
        a.expectedRevision,
      );
      return { id: d.id, maximumWeightError };
    },
  );
  return {
    sampleArrangement: sampleAuthoringArrangement,
    normalize: normalizeAuthoringAnimation,
    sampleTrack: sampleAuthoringTrack,
    sampleClip: sampleAuthoringClip,
    retargetClip: retargetAuthoringClip,
    sample(id, clipId, time) {
      const d = project.getDocument(id).content,
        clip = d.clips.find((c) => c.id === clipId);
      if (!clip) throw error("AUTHORING_ELEMENT_MISSING", "Clip missing.");
      const rest = d.rigId
        ? Object.fromEntries(
            project
              .getDocument(d.rigId)
              .content.bones.map((b) => [b.id, b.rest]),
          )
        : {};
      return sampleAuthoringClip(clip, time, rest);
    },
    blendPoses(a, b, t) {
      requireNumber(t, "pose blend", 0, 1);
      if (Object.keys(a).sort().join("\0") !== Object.keys(b).sort().join("\0"))
        throw error("AUTHORING_INVALID_POSE", "Pose targets differ.");
      return Object.fromEntries(
        Object.keys(a).map((id) => [
          id,
          normalizeTransform({
            translation: a[id].translation.map(
              (n, i) => n * (1 - t) + b[id].translation[i] * t,
            ),
            rotation: quatSlerp(a[id].rotation, b[id].rotation, t),
            scale: a[id].scale.map((n, i) => n * (1 - t) + b[id].scale[i] * t),
          }),
        ]),
      );
    },
  };
}
