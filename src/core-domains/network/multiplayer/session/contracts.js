import { clonePortable, textId } from "../../portable.js";

export const SESSION_PHASES = Object.freeze(["idle", "creating", "waiting", "connecting", "syncing", "ready", "connection-lost", "closed", "failed"]);
const transitions = Object.freeze({ idle: ["creating", "connecting"], creating: ["waiting", "failed", "closed"], waiting: ["connecting", "closed", "failed"], connecting: ["syncing", "connection-lost", "failed", "closed"], syncing: ["ready", "connection-lost", "failed", "closed"], ready: ["connection-lost", "closed"], "connection-lost": ["connecting", "closed", "failed"], closed: [], failed: ["closed"] });

export function createSessionRecord({ sessionId, localPeerId, phase = "idle" } = {}) {
  if (!SESSION_PHASES.includes(phase)) throw new TypeError(`Unknown session phase: ${phase}`);
  return { sessionId: sessionId == null ? null : textId(sessionId, "Session"), localPeerId: localPeerId == null ? null : textId(localPeerId, "Local peer"), phase, peers: {}, revision: 0, failure: null };
}

export function transitionSession(record, phase, patch = {}) {
  const current = clonePortable(record, "Session record");
  if (!SESSION_PHASES.includes(phase)) throw new TypeError(`Unknown session phase: ${phase}`);
  if (!(transitions[current.phase] ?? []).includes(phase)) throw new TypeError(`Cannot transition session from ${current.phase} to ${phase}.`);
  return { ...current, ...clonePortable(patch, "Session patch"), phase, revision: Number(current.revision ?? 0) + 1 };
}
