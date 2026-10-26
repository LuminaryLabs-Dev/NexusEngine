import { sha256Integrity } from "../../../../../foundation/sha256.js";
import { defineEvent, defineResource } from "../../../../../ecs.js";
import { defineDomainServiceKit } from "../../../../manifest-domain-service-kit.js";
import { keys, normalizeSpatialLayout } from "./contracts.js";
import { resolveSpatialLayout } from "./resolve.js";

export { SPATIAL_LAYOUT_SCHEMA, normalizeSpatialLayout } from "./contracts.js";
export { resolveSpatialLayout } from "./resolve.js";
export const SPATIAL_LAYOUT_STATE_SCHEMA = "nexusengine.spatial-layout-state/1";
const LayoutState = defineResource("spatial.layout.state");
const Changed = defineEvent("spatial.layout.changed");
const clone = value => structuredClone(value);

function normalizeState(snapshot) {
  keys(snapshot, ["schema", "layouts"], "layout snapshot");
  if (snapshot.schema !== SPATIAL_LAYOUT_STATE_SCHEMA || !Array.isArray(snapshot.layouts)) throw new TypeError("Unsupported layout snapshot.");
  const layouts = snapshot.layouts.map(normalizeSpatialLayout);
  if (new Set(layouts.map(l => l.id)).size !== layouts.length) throw new TypeError("Duplicate layout IDs.");
  layouts.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  return { schema: SPATIAL_LAYOUT_STATE_SCHEMA, layouts };
}

export function createSpatialLayoutKit(config = {}) {
  const baseline = normalizeState({ schema: SPATIAL_LAYOUT_STATE_SCHEMA, layouts: config.layouts ?? [] });
  return defineDomainServiceKit({
    manifestId: "spatial-layout-kit",
    id: config.id ?? "spatial-layout-kit",
    domain: "spatial-layout",
    domainPath: "n:spatial:layout",
    parentDomainPath: "n:spatial",
    apiName: "spatialLayout",
    version: "0.0.4",
    stability: "stable-candidate",
    requires: ["n:spatial"],
    provides: ["n:spatial:layout", "spatial:layout-resolution"],
    resources: { LayoutState },
    events: { Changed },
    metadata: { contentFingerprint: sha256Integrity(JSON.stringify(baseline)), deterministic: true, rendererAgnostic: true, initialLayouts: baseline.layouts, owns: ["layout rules", "layout membership"], doesNotOwn: ["persistent transforms", "content", "renderer resources"] },
    initWorld({ world }) { world.setResource(LayoutState, clone(baseline)); },
    createApi({ world }) {
      const read = () => clone(world.getResource(LayoutState));
      const commit = (state, reason) => {
        const next = normalizeState(state);
        if (JSON.stringify(next) !== JSON.stringify(read())) {
          world.setResource(LayoutState, next);
          world.emit(Changed, { reason, snapshot: clone(next) });
        }
        return clone(next);
      };
      const get = id => {
        const layout = read().layouts.find(l => l.id === id);
        if (!layout) throw new TypeError(`Unknown layout: ${id}.`);
        return layout;
      };
      return {
        setLayout(description) {
          const layout = normalizeSpatialLayout(description);
          const state = read();
          state.layouts = [...state.layouts.filter(l => l.id !== layout.id), layout];
          commit(state, "set-layout");
          return clone(layout);
        },
        removeLayout(id) {
          const state = read();
          const exists = state.layouts.some(l => l.id === id);
          if (exists) commit({ ...state, layouts: state.layouts.filter(l => l.id !== id) }, "remove-layout");
          return exists;
        },
        getLayout: get,
        listLayouts: () => read().layouts,
        resolve: (id, context) => resolveSpatialLayout(get(id), context),
        getState: read,
        getSnapshot: read,
        loadSnapshot: snapshot => commit(snapshot, "snapshot-loaded"),
        reset: () => commit(baseline, "reset")
      };
    }
  });
}
