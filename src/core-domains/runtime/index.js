export { runtimeDomainManifest } from "./domain.manifest.js";
export { createRuntimeLifecycleKit } from "./kits/runtime-lifecycle-kit/index.js";
export { createRealtimeKit } from "./subdomains/realtime/kits/realtime-kit/index.js";
export { createDataKit } from "./subdomains/data/kits/data-kit/index.js";
export { createTransactionLedgerKit } from "./subdomains/transaction/kits/transaction-ledger-kit/index.js";
export { createPersistenceKit } from "./subdomains/persistence/kits/persistence-kit/index.js";
export { createSequenceKit } from "./subdomains/sequence/kits/sequence-kit/index.js";
export { createStartupKit } from "./subdomains/startup/kits/startup-kit/index.js";

import { createRuntimeLifecycleKit } from "./kits/runtime-lifecycle-kit/index.js";
import { createRealtimeKit } from "./subdomains/realtime/kits/realtime-kit/index.js";
import { createDataKit } from "./subdomains/data/kits/data-kit/index.js";
import { createTransactionLedgerKit } from "./subdomains/transaction/kits/transaction-ledger-kit/index.js";
import { createPersistenceKit } from "./subdomains/persistence/kits/persistence-kit/index.js";
import { createSequenceKit } from "./subdomains/sequence/kits/sequence-kit/index.js";
import { createStartupKit } from "./subdomains/startup/kits/startup-kit/index.js";

export function createRuntimeDomain(config = {}) {
  const kits = [createRuntimeLifecycleKit(config.lifecycle ?? {})];
  if (config.realtime !== false) kits.push(createRealtimeKit(config.realtime ?? {}));
  if (config.data !== false) kits.push(createDataKit(config.data ?? {}));
  if (config.transaction !== false) kits.push(createTransactionLedgerKit(config.transaction ?? {}));
  if (config.persistence !== false) kits.push(createPersistenceKit(config.persistence ?? {}));
  if (config.sequence !== false) kits.push(createSequenceKit(config.sequence ?? {}));
  if (config.startup !== false) kits.push(createStartupKit(config.startup ?? {}));
  return kits;
}
