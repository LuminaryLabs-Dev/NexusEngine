# core-network-kit

Purpose: session, peer, message, sync, and collaboration contracts without owning a provider SDK.

Owns: session descriptors, peer descriptors, message envelopes, event sync policy, state sync policy, authority model, reconnect state, and collaboration channels.

Does not own: backend service implementation or transport provider details.

Public API: `createCoreNetworkKit(config?)`.

Proof required: session descriptor smoke, message envelope smoke, sync policy smoke, deterministic headless smoke.
