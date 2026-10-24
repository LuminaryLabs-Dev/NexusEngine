import {
  libraryFor,
  validateLibrary,
  validateName,
  ROOT,
} from "./asset-library.js";
import { createEngine } from "nexusengine";
import { createAuthoringDomain } from "nexusengine/domains/authoring";
import { compositionFor, resolveKits } from "./composition.js";
export const PROJECT_COMPATIBILITY_COMMIT = "081fea1cdd9ca1662bc15116e7174d9c27821630";
// Legacy source-format alias; release manifests record the actual runtime pin.
export const ENGINE_COMMIT = PROJECT_COMPATIBILITY_COMMIT;
export const FORMAT = "nexusengine.studio-project/2";
const clone = (v) => structuredClone(v),
  uid = (prefix) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
const defaults = () => ({
  title: "Untitled Game",
  scenes: [{ id: "scene", name: "Main Scene" }],
  activeScene: "scene",
  entryScene: "scene",
  bindings: { scene: {} },
  settings: { scene: { seconds: 60, goal: 1, mode: "proximity", bounds: 12 } },
  prefabs: [],
  editorVersion: 3,
  projectKey: crypto.randomUUID(),
  kits: { scene: [] },
  world: { id: "world", name: "My World" },
  assetNames: {},
});
function normalizeMeta(value) {
  const c = JSON.parse(JSON.stringify(value));
  validateLibrary(c.assetLibrary);
  if (typeof c.title !== "string" || !c.title.trim() || c.title.length > 120)
    throw Error("Project title must contain 1–120 characters.");
  if (
    !Array.isArray(c.scenes) ||
    !c.scenes.length ||
    c.scenes.length > 30 ||
    new Set(c.scenes.map((s) => s.id)).size !== c.scenes.length
  )
    throw Error("Use 1–30 uniquely identified scenes.");
  if (
    !c.scenes.some((s) => s.id === c.activeScene) ||
    !c.scenes.some((s) => s.id === c.entryScene)
  )
    throw Error("Active and starting scenes must exist.");
  if (!Array.isArray(c.prefabs) || c.prefabs.length > 100)
    throw Error("Invalid reusable object library.");
  if (
    c.world &&
    (typeof c.world.id !== "string" ||
      !c.world.id.trim() ||
      typeof c.world.name !== "string" ||
      !c.world.name.trim() ||
      c.world.name.length > 100)
  )
    throw Error("Name the world.");
  for (const s of c.scenes) {
    if (typeof s.name !== "string" || !s.name.trim() || s.name.length > 100)
      throw Error("Name each scene.");
    if (c.kits?.[s.id]) resolveKits(c.kits[s.id]);
    const cfg = c.settings[s.id];
    if (
      !cfg ||
      !Number.isFinite(cfg.seconds) ||
      cfg.seconds < 5 ||
      cfg.seconds > 600 ||
      !Number.isInteger(cfg.goal) ||
      cfg.goal < 1 ||
      cfg.goal > 500 ||
      !Number.isFinite(cfg.bounds) ||
      cfg.bounds < 2 ||
      cfg.bounds > 100 ||
      !["proximity", "pointer"].includes(cfg.mode)
    )
      throw Error("Invalid game settings.");
    if (cfg.rolling !== undefined && typeof cfg.rolling !== "boolean")
      throw Error("Invalid rolling setting.");
    for (const [key, min, max] of [
      ["acceleration", 1, 100],
      ["gravity", 1, 60],
      ["killY", -100, 0],
      ["jumpSpeed", 1, 20],
    ])
      if (
        cfg[key] !== undefined &&
        (!Number.isFinite(cfg[key]) || cfg[key] < min || cfg[key] > max)
      )
        throw Error("Invalid " + key + ".");
    for (const key of ["followCamera", "ocean", "jumping"])
      if (cfg[key] !== undefined && typeof cfg[key] !== "boolean")
        throw Error("Invalid " + key + ".");
    for (const b of Object.values(c.bindings[s.id] ?? {})) {
      if (
        !Number.isFinite(b.speed) ||
        b.speed < 0.1 ||
        b.speed > 30 ||
        !Number.isFinite(b.points) ||
        b.points < 1 ||
        b.points > 100 ||
        !Number.isFinite(b.fov) ||
        b.fov < 20 ||
        b.fov > 100
      )
        throw Error("Invalid gameplay configuration.");
      for (const k of ["identity", "character", "controlEnabled"])
        if (b[k] !== undefined && typeof b[k] !== "boolean")
          throw Error("Invalid actor state.");
      for (const key of ["movingPlatform", "checkpoint", "finish"])
        if (b[key] !== undefined && typeof b[key] !== "boolean")
          throw Error("Invalid " + key + " behavior.");
      if (b.movingPlatform) {
        if (!b.collider) throw Error("Moving platforms require a solid collider.");
        if (b.checkpoint || b.finish) throw Error("Place checkpoint and finish markers on static terrain.");
        if (!Array.isArray(b.travel) || b.travel.length !== 3 ||
            b.travel.some(v => !Number.isFinite(v) || Math.abs(v) > 30) ||
            !b.travel.some(v => v !== 0) || !Number.isFinite(b.travelSeconds) ||
            b.travelSeconds < 1 || b.travelSeconds > 30 ||
            !Number.isFinite(b.pauseSeconds) || b.pauseSeconds < 0 || b.pauseSeconds > 10)
          throw Error("Platform needs a nonzero travel offset (±30), travel time 1–30s and pause 0–10s.");
      }
      for (const k of ["playerId", "characterId"])
        if (
          b[k] !== undefined &&
          (typeof b[k] !== "string" || b[k].length > 100)
        )
          throw Error("Invalid actor reference.");
      for (const k of ["player", "camera", "collider", "collectible"])
        if (typeof b[k] !== "boolean") throw Error("Invalid capability flag.");
    }
    if (
      Object.values(c.bindings[s.id] ?? {}).filter(
        (b) => b.player || b.identity,
      ).length > 1 ||
      Object.values(c.bindings[s.id] ?? {}).filter((b) => b.camera).length > 1
    )
      throw Error("Each scene supports one player and one gameplay camera.");
  }
  return c;
}
export const newBinding = () => ({
  identity: false,
  character: false,
  playerId: "",
  characterId: "",
  controlEnabled: true,
  player: false,
  camera: false,
  collider: false,
  collectible: false,
  movingPlatform: false,
  checkpoint: false,
  finish: false,
  travel: [0, 0, -6],
  travelSeconds: 3,
  pauseSeconds: 1,
  speed: 4,
  points: 1,
  fov: 42,
});
export class SceneProject {
  constructor() {
    this.engine = createEngine({ kits: createAuthoringDomain() });
    this.dirty = false;
    const p = this.project;
    p.registerKind({
      id: "studio-game",
      version: 1,
      normalize: normalizeMeta,
      dependencies: (c) =>
        c.scenes.flatMap((s) => [
          { id: s.id, kind: "assembly", revision: "latest" },
          {
            id: "composition-" + s.id,
            kind: "domain-composition",
            revision: "latest",
          },
        ]),
      validateReferences(c, get) {
        if (
          c.scenes.reduce((n, s) => n + get(s.id).content.nodes.length, 0) > 500
        )
          throw Error("Project exceeds the 500-object limit.");
        for (const s of c.scenes) {
          const ids = new Set(get(s.id).content.nodes.map((n) => n.id));
          for (const [id, b] of Object.entries(c.bindings[s.id] ?? {})) {
            if (!ids.has(id))
              throw Error("Gameplay references an absent object.");
            const node = get(s.id).content.nodes.find((n) => n.id === id);
            if (
              (b.player ||
                b.identity ||
                b.character ||
                b.collider ||
                b.collectible || b.movingPlatform || b.checkpoint || b.finish) &&
              !node.meshId
            )
              throw Error("Gameplay capability requires a mesh object.");
            if (b.movingPlatform && (node.parent || get(s.id).content.nodes.some(n => n.parent === id)))
              throw Error("Moving platforms must be root objects without children.");
            if (
              b.characterId &&
              !get(s.id).content.nodes.some(
                (n) => n.id === b.characterId && n.meshId,
              )
            )
              throw Error("Connected character must be a mesh in this scene.");
            if (b.identity || b.player) {
              if (b.playerId !== undefined && typeof b.playerId !== "string")
                throw Error("Invalid player identity.");
              if (
                b.controlEnabled !== undefined &&
                typeof b.controlEnabled !== "boolean"
              )
                throw Error("Invalid control authority.");
            }
          }
        }
        for (const p of c.prefabs) {
          if (!p?.node?.meshId || get(p.node.meshId).kind !== "mesh")
            throw Error("Reusable object mesh is missing.");
          for (const id of p.node.materials)
            if (get(id).kind !== "material")
              throw Error("Reusable object material is missing.");
        }
      },
    });
    p.registerOperation({
      id: "studio-game.set",
      domainPath: "n:authoring:studio-game",
      schemaVersion: 1,
      parameters: { fields: ["id", "expectedRevision", "content"] },
      execute(tx, a) {
        tx.put(
          { id: a.id, kind: "studio-game", content: a.content },
          a.expectedRevision,
        );
        return { id: a.id };
      },
    });
    p.registerOperation({
      id: "studio-assets.import",
      domainPath: "n:authoring:studio-assets",
      schemaVersion: 1,
      parameters: { fields: ["documents"] },
      execute(tx, a) {
        for (const d of a.documents)
          tx.put({
            id: d.id,
            kind: d.kind,
            schemaVersion: d.schemaVersion,
            content: d.content,
          });
        return { count: a.documents.length };
      },
    });
  }
  get project() {
    return this.engine.n.authoringProject;
  }
  get meta() {
    return this.project.getDocument("studio-game").content;
  }
  get title() {
    return this.meta.title;
  }
  get sceneId() {
    return this.meta.activeScene;
  }
  nodes(sceneId = this.sceneId) {
    return this.project.getDocument(sceneId).content.nodes;
  }
  assets() {
    return this.project
      .listDocuments()
      .filter((d) => ["mesh", "material"].includes(d.kind));
  }
  assetLibrary() {
    return libraryFor(this.meta);
  }
  createAssetFolder(name, parent = ROOT) {
    const id = uid("folder");
    this.updateMeta((m) => {
      m.assetLibrary = clone(libraryFor(m));
      m.assetLibrary.folders.push({ id, name: validateName(name), parent });
    });
    return id;
  }
  renameAssetItem(id, name, isFolder = false) {
    const label = validateName(name);
    this.updateMeta((m) => {
      if (isFolder) {
        m.assetLibrary = clone(libraryFor(m));
        const f = m.assetLibrary.folders.find((f) => f.id === id);
        if (!f) throw Error("Choose a folder.");
        f.name = label;
      } else {
        if (
          !this.assets().some((a) => a.id === id) &&
          !m.prefabs.some((p) => p.id === id) &&
          !this.project.listDocuments().some((d) => d.id === id)
        )
          throw Error("Asset is missing.");
        m.assetNames ??= {};
        m.assetNames[id] = label;
      }
    });
  }
  moveAssetItem(id, destination, isFolder = false) {
    this.updateMeta((m) => {
      m.assetLibrary = clone(libraryFor(m));
      if (isFolder) {
        const f = m.assetLibrary.folders.find((f) => f.id === id);
        if (!f) throw Error("Choose a folder.");
        f.parent = destination;
      } else {
        if (
          !this.assets().some((a) => a.id === id) &&
          !m.prefabs.some((p) => p.id === id) &&
          !this.project.listDocuments().some((d) => d.id === id)
        )
          throw Error("Asset is missing.");
        m.assetLibrary.locations[id] = destination;
      }
    });
  }
  assetName(id) {
    return (
      this.meta.assetNames?.[id] ??
      this.nodes().find((n) => n.meshId === id)?.name ??
      (id.startsWith("mesh-") ? "Model" : id.replace(/[-_]/g, " "))
    );
  }
  addKits(ids, nodeId) {
    const resolved = resolveKits(ids);
    const m = clone(this.meta);
    m.kits ??= {};
    m.kits[this.sceneId] = [
      ...new Set([...(m.kits[this.sceneId] ?? []), ...resolved]),
    ].sort();
    if (nodeId) {
      const node = this.nodes().find((n) => n.id === nodeId);
      if (node?.meshId) {
        const b = { ...newBinding(), ...m.bindings[this.sceneId][nodeId] };
        if (ids.includes("player-authority-kit")) {
          b.identity = true;
          b.playerId ||= "player-" + nodeId;
          b.characterId ||= nodeId;
        }
        if (ids.includes("character-registry-kit")) b.character = true;
        if (ids.includes("action-locomotion-kit")) {
          b.player = true;
          b.identity = true;
          b.playerId ||= "player-" + nodeId;
          b.characterId ||= nodeId;
        }
        m.bindings[this.sceneId][nodeId] = b;
      }
    }
    this.execute([this.metaOperation(m)]);
    return resolved;
  }
  stableAssembly(content) {
    let c = clone(content);
    for (let i = 0; i < 32; i++) {
      const n = this.engine.n.authoringAssembly.normalize(c);
      if (JSON.stringify(c) === JSON.stringify(n)) return n;
      c = n;
    }
    throw Error(
      "This rotation cannot be saved reliably by the pinned Engine. Choose a different angle.",
    );
  }
  execute(operations) {
    const metadata = operations.find((op) => op.id === "studio-game.set");
    if (metadata)
      for (const s of metadata.args.content.scenes) {
        const id = "composition-" + s.id,
          doc = this.project.listDocuments().find((d) => d.id === id);
        operations.push({
          id: "domain-composition.set",
          args: {
            id,
            ...(doc ? { expectedRevision: doc.revision } : {}),
            content: compositionFor(
              metadata.args.content.bindings[s.id],
              metadata.args.content.kits?.[s.id],
            ).tree,
          },
        });
      }
    for (const op of operations)
      if (op.id === "assembly.set")
        op.args.content = this.stableAssembly(op.args.content);
    const request = {
      requestId: crypto.randomUUID(),
      epoch: this.project.context().epoch,
      operations,
    };
    this.project.preview(request);
    const receipt = this.project.execute(request);
    this.dirty = true;
    return receipt;
  }
  metaOperation(content) {
    const d = this.project.getDocument("studio-game");
    return {
      id: "studio-game.set",
      args: { id: d.id, expectedRevision: d.revision, content },
    };
  }
  assemblyOperation(content, id = this.sceneId) {
    const d = this.project.getDocument(id);
    return {
      id: "assembly.set",
      args: { id, expectedRevision: d.revision, content },
    };
  }
  updateMeta(edit) {
    const m = clone(this.meta);
    edit(m);
    this.execute([this.metaOperation(m)]);
  }
  editNode(id, changes, binding) {
    const scene = clone(this.project.getDocument(this.sceneId).content),
      node = scene.nodes.find((n) => n.id === id);
    if (!node) throw Error("Select an object.");
    Object.assign(node, changes);
    const m = clone(this.meta);
    if (binding) m.bindings[this.sceneId][id] = binding;
    const ops = [this.assemblyOperation(scene), this.metaOperation(m)];
    this.execute(ops);
    this.checkBindings();
  }
  addObject(type = "box", meshId = null, initial = {}) {
    const id = uid(type),
      scene = clone(this.project.getDocument(this.sceneId).content),
      m = clone(this.meta),
      ops = [];
    if (!["empty", "camera", "asset"].includes(type)) {
      meshId = uid("mesh");
      ops.push({
        id: "mesh.primitive",
        args: {
          id: meshId,
          parameters: { type, size: 1, radius: 0.5, height: 1 },
        },
      });
    }
    const node = {
      id,
      name:
        initial.name ??
        (type === "asset"
          ? "Model instance"
          : type[0].toUpperCase() + type.slice(1)),
      parent: null,
      meshId,
      materials: meshId ? [initial.material ?? "blue"] : [],
      transform: {
        translation: [0, 0.5, 0],
        rotation: [0, 0, 0, 1],
        scale: [1, 1, 1],
      },
    };
    if (type === "camera") {
      node.transform.translation = [10, 9, 12];
      m.bindings[this.sceneId][id] = { ...newBinding(), camera: true };
      scene.cameras.push({
        id: uid("camera"),
        nodeId: id,
        yfov: 0.73,
        near: 0.1,
        far: 500,
      });
    }
    if (initial.binding) {
      const b = { ...newBinding(), ...initial.binding };
      if (b.player || b.identity) {
        b.playerId = "player-" + id;
        b.characterId = id;
      }
      m.bindings[this.sceneId][id] = b;
    }
    scene.nodes.push(node);
    ops.push(this.assemblyOperation(scene), this.metaOperation(m));
    this.execute(ops);
    return id;
  }
  makeUnique(id) {
    const scene = clone(this.project.getDocument(this.sceneId).content),
      node = scene.nodes.find((n) => n.id === id);
    if (!node?.meshId) throw Error("Select a mesh object.");
    const content = this.project.getDocument(node.meshId).content;
    node.meshId = uid("mesh");
    this.execute([
      { id: "mesh.create", args: { id: node.meshId, mesh: content } },
      this.assemblyOperation(scene),
    ]);
    return node.meshId;
  }
  duplicate(id) {
    const scene = clone(this.project.getDocument(this.sceneId).content),
      source = scene.nodes.find((n) => n.id === id);
    if (!source) throw Error("Select an object.");
    if (scene.nodes.some((n) => n.parent === id))
      throw Error("Duplicate leaf objects; ungroup children first.");
    const node = {
      ...clone(source),
      id: uid("object"),
      name: source.name + " copy",
    };
    node.transform.translation[0] += 1;
    scene.nodes.push(node);
    const m = clone(this.meta),
      b = m.bindings[this.sceneId][id];
    if (b)
      m.bindings[this.sceneId][node.id] = {
        ...b,
        player: false,
        identity: false,
        playerId: "",
        characterId: "",
        camera: false,
      };
    this.execute([this.assemblyOperation(scene), this.metaOperation(m)]);
    return node.id;
  }
  removeNode(id) {
    const scene = clone(this.project.getDocument(this.sceneId).content);
    if (scene.nodes.some((n) => n.parent === id))
      throw Error("Move children out of this object before removing it.");
    scene.nodes = scene.nodes.filter((n) => n.id !== id);
    scene.cameras = scene.cameras.filter((c) => c.nodeId !== id);
    scene.lights = scene.lights.filter((c) => c.nodeId !== id);
    const m = clone(this.meta);
    delete m.bindings[this.sceneId][id];
    this.execute([this.assemblyOperation(scene), this.metaOperation(m)]);
  }
  savePrefab(id) {
    const node = clone(this.nodes().find((n) => n.id === id));
    if (!node || !node.meshId)
      throw Error("Choose a mesh object to save as reusable.");
    if (this.nodes().some((n) => n.parent === id))
      throw Error("Reusable objects currently support leaf objects.");
    this.updateMeta((m) =>
      m.prefabs.push({
        id: uid("prefab"),
        name: node.name,
        node: { ...node, parent: null },
        binding: {
          ...newBinding(),
          ...m.bindings[this.sceneId][id],
          player: false,
          identity: false,
          playerId: "",
          characterId: "",
          camera: false,
        },
      }),
    );
  }
  instantiate(prefabId) {
    const prefab = this.meta.prefabs.find((p) => p.id === prefabId);
    if (!prefab) throw Error("Reusable object not found.");
    const scene = clone(this.project.getDocument(this.sceneId).content),
      m = clone(this.meta),
      node = { ...clone(prefab.node), id: uid("instance") };
    node.transform.translation[0] += 1;
    scene.nodes.push(node);
    m.bindings[this.sceneId][node.id] = clone(prefab.binding);
    this.execute([this.assemblyOperation(scene), this.metaOperation(m)]);
    return node.id;
  }
  addScene(name) {
    if (!name?.trim()) throw Error("Name the scene.");
    const id = uid("scene"),
      m = clone(this.meta);
    m.scenes.push({ id, name: name.trim() });
    m.activeScene = id;
    m.bindings[id] = {};
    m.kits ??= {};
    m.kits[id] = [];
    m.settings[id] = { seconds: 60, goal: 1, mode: "proximity", bounds: 12 };
    this.execute([
      { id: "assembly.set", args: { id, content: { nodes: [] } } },
      this.metaOperation(m),
    ]);
    return id;
  }
  switchScene(id) {
    this.updateMeta((m) => (m.activeScene = id));
  }
  checkBindings() {
    for (const s of this.meta.scenes) {
      const ids = new Set(this.nodes(s.id).map((n) => n.id));
      for (const id of Object.keys(this.meta.bindings[s.id]))
        if (!ids.has(id)) throw Error("Gameplay references an absent object.");
      compositionFor(this.meta.bindings[s.id], this.meta.kits?.[s.id]);
    }
  }
  validate() {
    this.checkBindings();
    return this.engine.n.authoringValidation.project();
  }
  packet(sceneId = this.sceneId) {
    return this.engine.n.authoringPublishing.prepare({ assemblyId: sceneId });
  }
  snapshot() {
    return {
      schema: FORMAT,
      engineCommit: ENGINE_COMMIT,
      source: this.project.getSnapshot(),
    };
  }
  load(input) {
    input = structuredClone(input);
    if (
      !input ||
      input.engineCommit !== ENGINE_COMMIT ||
      !["nexusengine.studio-project/1", FORMAT].includes(input.schema)
    )
      throw Error("Unsupported project format or Engine revision.");
    const metadata = input.source?.documents?.["studio-game"]?.content;
    let registryMigrated = false;
    if (metadata && input.schema === FORMAT) {
      for (const scene of metadata.scenes) {
        const doc = input.source.documents["composition-" + scene.id];
        const derived = compositionFor(metadata.bindings[scene.id], metadata.kits?.[scene.id]).tree;
        if (doc && doc.content.registryHash !== derived.registryHash) {
          doc.content = derived;
          registryMigrated = true;
        }
      }
      if (registryMigrated) {
        // Derived registry records are rebuilt from trusted factories. Historical
        // transactions refer to the old registry; keep the original input file.
        input.source.undo = []; input.source.redo = []; input.source.receipts = {};
      }
    }
    const candidate = new SceneProject();
    if (registryMigrated) {
      candidate.execute(Object.values(input.source.documents)
        .filter(d => d.kind !== "domain-composition")
        .map(d => d.kind === "mesh" ? {id:"mesh.create",args:{id:d.id,mesh:d.content}} : {id:d.kind + ".set",args:{id:d.id,content:d.content}}));
    } else candidate.project.loadSnapshot(input.source);
    if (input.schema !== FORMAT) {
      const m = defaults();
      m.title = input.title || "Imported project";
      m.settings.scene = {
        seconds: input.game?.seconds || 30,
        goal: 1,
        mode: "pointer",
        bounds: 12,
      };
      for (const n of candidate.nodes("scene"))
        if (n.collection === "targets") m.bindings.scene ??= {};
      for (const n of candidate
        .nodes("scene")
        .filter((n) => n.collection === "targets"))
        m.bindings.scene[n.id] = { ...newBinding(), collectible: true };
      m.settings.scene.goal = Object.keys(m.bindings.scene).length || 1;
      const missing = ["blue", "jade", "slate", "gold"].filter(
        (id) => !candidate.project.listDocuments().some((d) => d.id === id),
      );
      candidate.execute(
        missing
          .map((id) => ({
            id: "material.set",
            args: {
              id,
              content: {
                baseColor:
                  id === "blue" ? [0.15, 0.55, 0.95, 1] : [0.4, 0.6, 0.7, 1],
                roughness: 0.5,
              },
            },
          }))
          .concat([
            { id: "studio-game.set", args: { id: "studio-game", content: m } },
          ]),
      );
    }
    if (
      candidate.meta.scenes.reduce(
        (n, s) => n + candidate.nodes(s.id).length,
        0,
      ) > 500
    )
      throw Error("Project exceeds the 500-object limit.");
    if (candidate.validate().errors)
      throw Error("Engine project validation failed.");
    for (const s of candidate.meta.scenes) candidate.packet(s.id);
    const migrated =
      registryMigrated || input.schema !== FORMAT ||
      candidate.meta.editorVersion !== 3 ||
      !candidate.meta.projectKey;
    if (candidate.meta.editorVersion !== 3 || !candidate.meta.projectKey)
      candidate.updateMeta((m) => {
        m.editorVersion = 3;
        m.projectKey ??= crypto.randomUUID();
        m.kits ??= {};
        m.world ??= { id: "world", name: "My World" };
        m.assetNames ??= {};
      });
    this.engine = candidate.engine;
    this.dirty = migrated;
    return migrated;
  }
  create(title = "Untitled Game") {
    const m = defaults();
    m.title = title.trim() || "Untitled Game";
    this.execute(
      ["blue", "jade", "slate", "gold"]
        .map((id, i) => ({
          id: "material.set",
          args: {
            id,
            content: {
              baseColor: [
                [0.15, 0.55, 0.95, 1],
                [0.12, 0.7, 0.55, 1],
                [0.15, 0.22, 0.29, 1],
                [1, 0.65, 0.18, 1],
              ][i],
              roughness: 0.5,
            },
          },
        }))
        .concat([
          { id: "assembly.set", args: { id: "scene", content: { nodes: [] } } },
          { id: "studio-game.set", args: { id: "studio-game", content: m } },
        ]),
    );
    this.dirty = true;
  }
  async importGLB(bytes) {
    const sourceScene = this.sceneId,
      sourceRevision = this.project.getDocument(this.sceneId).revision;
    if (bytes.length > 8 * 1024 * 1024) throw Error("Model exceeds 8 MB.");
    const scratch = new SceneProject();
    const result = await scratch.engine.n.authoringImport.import({
      requestId: crypto.randomUUID(),
      prefix: uid("import"),
      format: "glb",
      bytes,
    });
    if (
      this.sceneId !== sourceScene ||
      this.project.getDocument(sourceScene).revision !== sourceRevision
    )
      throw Error(
        "Scene changed during model import. Retry in the intended scene.",
      );
    const packet = scratch.engine.n.authoringPublishing.prepare({
      assemblyId: result.assemblyId,
    });
    if (packet.images.length || packet.rigs.length || packet.animations.length)
      throw Error(
        "This release imports static GLB meshes with solid materials; textures and animation are not supported.",
      );
    const docs = scratch.project
      .listDocuments()
      .filter((d) => ["mesh", "material"].includes(d.kind))
      .map((d) => scratch.project.getDocument(d.id));
    const scene = clone(this.project.getDocument(this.sceneId).content);
    const imported = scratch.project.getDocument(result.assemblyId).content;
    // Embedded authoring GLBs may preserve source IDs despite the import prefix.
    // Rebase this instance and its solid mesh/material references atomically.
    const docIds = new Map(docs.map((d) => [d.id, uid(d.kind)]));
    const nodeIds = new Map(
      imported.nodes.map((n) => [n.id, uid("import-node")]),
    );
    const incoming = imported.nodes.map((n) => ({
      ...clone(n),
      id: nodeIds.get(n.id),
      parent: n.parent ? nodeIds.get(n.parent) : null,
      meshId: n.meshId ? docIds.get(n.meshId) : null,
      materials: n.materials.map((id) => docIds.get(id)),
    }));
    scene.nodes.push(...incoming);
    for (const key of ["cameras", "lights"])
      for (const item of imported[key] ?? [])
        scene[key].push({
          ...clone(item),
          id: uid(key),
          nodeId: nodeIds.get(item.nodeId),
        });
    this.execute([
      {
        id: "studio-assets.import",
        args: {
          documents: docs.map((d) => ({
            id: docIds.get(d.id),
            kind: d.kind,
            schemaVersion: d.schemaVersion,
            content: d.content,
          })),
        },
      },
      this.assemblyOperation(scene),
    ]);
    return incoming.filter((n) => n.meshId).length;
  }
  gameData(sceneId = this.meta.entryScene) {
    const settings = clone(this.meta.settings[sceneId]),
      bindings = clone(this.meta.bindings[sceneId]),
      nodes = this.nodes(sceneId),
      visible = new Set(
        this.packet(sceneId)
          .assembly.nodes.filter((n) => n.included && n.visible)
          .map((n) => n.id),
      );
    for (const b of Object.values(bindings))
      if (
        (b.player || b.identity) &&
        b.characterId &&
        !visible.has(b.characterId)
      )
        throw Error(
          "The controlled character must be visible in the starting scene.",
        );
    const targets = nodes.filter(
      (n) => bindings[n.id]?.collectible && visible.has(n.id),
    );
    if (!targets.length)
      throw Error(
        "Add a visible collectible and enable its Collectible capability.",
      );
    if (
      settings.mode === "proximity" &&
      !nodes.some((n) => bindings[n.id]?.player && visible.has(n.id))
    )
      throw Error(
        "Proximity collection requires a visible player. Add an object and enable Player controls.",
      );
    if (settings.goal > targets.reduce((n, t) => n + bindings[t.id].points, 0))
      throw Error("Win score exceeds available collectible points.");
    const kits = this.meta.kits?.[sceneId] ?? [],
      composition = compositionFor(bindings, kits);
    return {
      title: this.title,
      sceneId,
      sceneName: this.meta.scenes.find((s) => s.id === sceneId).name,
      world: this.meta.world ?? { id: "world", name: "My World" },
      kits,
      packet: this.packet(sceneId),
      settings,
      bindings,
      composition: composition.tree,
    };
  }
}
