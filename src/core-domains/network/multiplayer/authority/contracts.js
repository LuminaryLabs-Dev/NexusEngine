import { clonePortable, textId } from "../../portable.js";
export function createAuthorityRecord() { return { hostPeerId: null, roles: {}, owners: {}, revision: 0 }; }
export function assignAuthority(record, { peerId, role, stateKeys = [] }) {
  const current = clonePortable(record, "Authority record");
  const id = textId(peerId, "Authority peer");
  if (!['host', 'client'].includes(role)) throw new TypeError("Authority role must be host or client.");
  if (role === "host" && current.hostPeerId && current.hostPeerId !== id) throw new TypeError(`Authoritative host is already ${current.hostPeerId}.`);
  const owners = { ...current.owners };
  for (const key of stateKeys.map((value) => textId(value, "State key"))) {
    if (owners[key] && owners[key] !== id) throw new TypeError(`State ${key} is already owned by ${owners[key]}.`);
    owners[key] = id;
  }
  return { hostPeerId: role === "host" ? id : current.hostPeerId, roles: { ...current.roles, [id]: role }, owners, revision: Number(current.revision ?? 0) + 1 };
}
