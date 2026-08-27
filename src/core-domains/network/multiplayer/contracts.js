import { clonePortable, nonNegativeInteger, textId } from "../portable.js";

export const MULTIPLAYER_PROTOCOL_VERSION = 1;

export function createInboundQueue() { return { nextOrder: 0, messages: [] }; }

export function enqueueInbound(queue, message) {
  const next = clonePortable(queue, "Inbound queue");
  const envelope = clonePortable(message, "Inbound message");
  const order = nonNegativeInteger(next.nextOrder, "Inbound queue order");
  next.messages.push({ order, peerId: textId(envelope.peerId, "Inbound peer"), channel: envelope.channel === "control" ? "control" : "realtime", payload: clonePortable(envelope.payload, "Inbound payload") });
  next.nextOrder = order + 1;
  return next;
}

export function drainInbound(queue) {
  const current = clonePortable(queue, "Inbound queue");
  return { messages: current.messages.sort((a, b) => a.order - b.order), queue: { nextOrder: current.nextOrder, messages: [] } };
}
