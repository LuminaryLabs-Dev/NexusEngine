export const CORE_SCENE_DOMAIN_VERSION = "0.0.3";
export const DEFAULT_SCENE_KIND = "headless-scene";
export const DEFAULT_SCENE_HOST_BINDING = "headless";
export const SCENE_PAYLOAD_STORAGE_KEY = "nexus.scenePayload";
export const SCENE_SNAPSHOT_STORAGE_KEY = "nexus.sceneSnapshot";

export const CORE_SCENE_EVENT_NAMES = Object.freeze([
  "configured",
  "updated",
  "reset",
  "snapshotLoaded",
  "descriptorChanged",
  "sceneEntered",
  "sceneExited",
  "transitionAccepted",
  "transitionRejected",
  "sceneMounted",
  "tokenChanged"
]);

export const SCENE_HOST_BINDING_BY_KIND = Object.freeze({
  "web-html-scene": "web-html",
  "web-module-scene": "web-module",
  "web-canvas-scene": "web-canvas",
  "web-three-scene": "web-three",
  "native-rust-scene": "rust-native",
  "native-command-scene": "rust-command-buffer",
  "openxr-scene": "openxr",
  "headless-scene": DEFAULT_SCENE_HOST_BINDING
});

export const SUPPORTED_SCENE_KINDS = Object.freeze(Object.keys(SCENE_HOST_BINDING_BY_KIND));
