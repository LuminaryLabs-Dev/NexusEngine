export { networkDomainManifest } from "./domain.manifest.js";
export { createNetworkKit } from "./kits/network-kit/index.js";
export { createNetworkTransportContractKit, validateTransportProvider, assertPortableMessage } from "./transport/index.js";
export { createMultiplayerContractKit, createInboundQueue, enqueueInbound, drainInbound } from "./multiplayer/index.js";
export { createMultiplayerSessionKit, createSessionRecord, transitionSession } from "./multiplayer/session/index.js";
export { createMultiplayerAuthorityKit, createAuthorityRecord, assignAuthority } from "./multiplayer/authority/index.js";
export { createMultiplayerTickSyncKit, createTickSyncRecord, addTimingSample, remoteTickToLocalTick } from "./multiplayer/tick-sync/index.js";
export { createMultiplayerReplicationKit, createReplicationRecord, createInputEnvelope, createSnapshotEnvelope, acceptInputEnvelope, acceptSnapshotEnvelope } from "./multiplayer/replication/index.js";

import { createNetworkKit } from "./kits/network-kit/index.js";
import { createNetworkTransportContractKit } from "./transport/index.js";
import { createMultiplayerContractKit } from "./multiplayer/index.js";
import { createMultiplayerSessionKit } from "./multiplayer/session/index.js";
import { createMultiplayerAuthorityKit } from "./multiplayer/authority/index.js";
import { createMultiplayerTickSyncKit } from "./multiplayer/tick-sync/index.js";
import { createMultiplayerReplicationKit } from "./multiplayer/replication/index.js";

export function createNetworkDomain(config = {}) {
  return [
    createNetworkKit(config.network),
    createNetworkTransportContractKit(config.transport),
    createMultiplayerContractKit(config.multiplayer),
    createMultiplayerSessionKit(config.session),
    createMultiplayerAuthorityKit(config.authority),
    createMultiplayerTickSyncKit(config.tickSync),
    createMultiplayerReplicationKit(config.replication)
  ];
}
