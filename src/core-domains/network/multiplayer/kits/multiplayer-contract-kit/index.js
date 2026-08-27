import { createDomainKit } from "../../../../domain-kit.js";
import { MULTIPLAYER_PROTOCOL_VERSION, createInboundQueue, drainInbound, enqueueInbound } from "../../contracts.js";

export function createMultiplayerContractKit(config = {}) {
  return createDomainKit({ ...config, manifestId: "multiplayer-contract-kit", id: config.id ?? "multiplayer-contract-kit", domain: "multiplayer-contracts", domainPath: "n:network:multiplayer", parentDomainPath: "n:network", apiName: "multiplayerContracts", requires: ["n:network", "n:network:transport"], provides: ["n:network:multiplayer", "multiplayer:protocol"], initialState: { protocolVersion: MULTIPLAYER_PROTOCOL_VERSION, inbound: createInboundQueue() }, purpose: "Portable multiplayer protocol and deterministic inbound ordering.", owns: ["protocol version", "inbound ordering"], doesNotOwn: ["transport callbacks", "game rules"], createApi() { return { protocolVersion: MULTIPLAYER_PROTOCOL_VERSION, createInboundQueue, enqueueInbound, drainInbound }; } });
}
