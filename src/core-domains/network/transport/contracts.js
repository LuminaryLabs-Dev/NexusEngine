import { clonePortable, textId } from "../portable.js";

export const TRANSPORT_METHODS = Object.freeze(["initialize", "createSession", "joinSession", "sendControl", "sendRealtime", "getStats", "close", "reset", "dispose"]);

export function assertPortableMessage(value, label = "message") {
  return clonePortable(value, label);
}

export function validateTransportProvider(provider) {
  if (!provider || typeof provider !== "object") throw new TypeError("Transport provider must be an object.");
  const id = textId(provider.id, "Transport provider");
  for (const method of TRANSPORT_METHODS) {
    if (typeof provider[method] !== "function") throw new TypeError(`Transport provider ${id} requires ${method}().`);
  }
  return Object.freeze({ id, capabilities: clonePortable(provider.capabilities ?? {}, "Transport capabilities"), methods: [...TRANSPORT_METHODS] });
}
