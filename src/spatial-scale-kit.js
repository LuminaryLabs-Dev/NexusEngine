import { defineEvent, defineResource } from "./ecs.js";
import { defineRuntimeKit } from "./runtime-kit.js";

export const SpatialScaleState = defineResource("spatial.scaleState");
export const SpatialScaleBandChanged = defineEvent("spatial.scaleBandChanged");
export const SpatialScaleAnchorEntered = defineEvent("spatial.scaleAnchorEntered");

function number(value, fallback) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function normalizeAnchor(anchor = {}, index = 0) {
  return {
    id: anchor.id ?? `scale-anchor-${index + 1}`,
    x: number(anchor.x, 0),
    y: number(anchor.y, 0),
    radius: Math.max(1, number(anchor.radius, 24)),
    scale: Math.max(0.001, number(anchor.scale, 1)),
    bands: anchor.bands ?? [
      { id: "near", distance: 32 },
      { id: "mid", distance: 96 },
      { id: "far", distance: 240 }
    ],
    metadata: anchor.metadata ?? {}
  };
}

function initialState(config = {}) {
  const dataset = config.spatialScaleDataset ?? config;
  return {
    id: dataset.id ?? "spatial-scale",
    subject: {
      id: dataset.subject?.id ?? "subject",
      x: number(dataset.subject?.x, 0),
      y: number(dataset.subject?.y, 0),
      scale: Math.max(0.001, number(dataset.subject?.scale, 1))
    },
    anchors: (dataset.anchors ?? []).map(normalizeAnchor),
    activeAnchorId: null,
    activeBand: null,
    lastQuery: null
  };
}

function bandFor(anchor, distance) {
  const bands = [...(anchor.bands ?? [])].sort((left, right) => number(left.distance, 0) - number(right.distance, 0));
  return bands.find((band) => distance <= number(band.distance, 0))?.id ?? "beyond";
}

function nearestAnchor(state, point = state?.subject ?? {}) {
  const x = number(point.x, 0);
  const y = number(point.y, 0);
  return (state?.anchors ?? [])
    .map((anchor) => {
      const distance = Math.hypot(anchor.x - x, anchor.y - y);
      return { anchor, distance, band: bandFor(anchor, distance), inside: distance <= anchor.radius };
    })
    .sort((left, right) => left.distance - right.distance)[0] ?? null;
}

export function createSpatialScaleKit(config = {}) {
  return defineRuntimeKit({
    id: config.id ?? "spatial-scale-kit",
    resources: { SpatialScaleState },
    events: { SpatialScaleBandChanged, SpatialScaleAnchorEntered },
    provides: ["spatial-scale"],
    initWorld({ world }) {
      world.setResource(SpatialScaleState, initialState(config));
    },
    install({ engine }) {
      engine.spatialScale = {
        getState() {
          return engine.world.getResource(SpatialScaleState);
        },
        setSubject(subject = {}) {
          const state = engine.world.getResource(SpatialScaleState);
          const nextSubject = {
            ...state.subject,
            id: subject.id ?? state.subject.id,
            x: number(subject.x, state.subject.x),
            y: number(subject.y, state.subject.y),
            scale: Math.max(0.001, number(subject.scale, state.subject.scale))
          };
          const query = nearestAnchor(state, nextSubject);
          const next = {
            ...state,
            subject: nextSubject,
            activeAnchorId: query?.anchor.id ?? null,
            activeBand: query?.band ?? null,
            lastQuery: query
          };
          engine.world.setResource(SpatialScaleState, next);
          if (query && query.band !== state.activeBand) engine.world.emit(SpatialScaleBandChanged, { previousBand: state.activeBand, band: query.band, anchor: query.anchor, distance: query.distance });
          if (query?.inside && query.anchor.id !== state.activeAnchorId) engine.world.emit(SpatialScaleAnchorEntered, { anchor: query.anchor, distance: query.distance });
          return next;
        },
        nearestAnchor(point) {
          const state = engine.world.getResource(SpatialScaleState);
          const query = nearestAnchor(state, point);
          engine.world.setResource(SpatialScaleState, { ...state, lastQuery: query });
          return query;
        },
        reset() {
          engine.world.setResource(SpatialScaleState, initialState(config));
          return engine.world.getResource(SpatialScaleState);
        },
        snapshot() {
          return structuredClone(engine.world.getResource(SpatialScaleState));
        }
      };
    },
    metadata: { purpose: "Generic subject-to-world scale anchors, proximity bands, and scale-aware query state." }
  });
}

export function queryNearestScaleAnchor(state, point = state?.subject ?? {}) {
  const query = nearestAnchor(state, point);
  return query ? { anchor: { ...query.anchor }, distance: query.distance, band: query.band, inside: query.inside } : null;
}
