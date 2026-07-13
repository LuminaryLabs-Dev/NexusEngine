import { createCoreCapabilityKit } from "../core-capability-kit.js";
import {
  createCompletionService,
  createDeterministicRandomService,
  createStateDigestService
} from "./services.js";

export * from "./snapshot.js";
export * from "./ledger.js";
export * from "./selectors.js";
export * from "./schema.js";
export * from "./migration.js";
export * from "./services.js";

export function createCoreDataKit(config = {}) {
  const customCreateApi = config.createApi;
  const customInstall = config.install;
  const apiName = config.apiName ?? "coreData";

  return createCoreCapabilityKit({
    ...config,
    domain: "core-data",
    apiName,
    purpose: "Durable state, snapshots, selectors, schemas, ledgers, migrations, deterministic random streams, completion state, and state digests.",
    owns: [
      "serializable state",
      "snapshots",
      "selectors",
      "completion ledgers",
      "idempotency ledgers",
      "data migrations",
      "named deterministic random streams",
      "canonical state digests",
      ...(config.owns ?? [])
    ],
    doesNotOwn: ["storage targets", "renderer data", "agent decisions", ...(config.doesNotOwn ?? [])],
    services: [...(config.services ?? []), "random", "completion", "digest"],
    createApi(context) {
      const random = createDeterministicRandomService(config.random ?? {});
      const completion = createCompletionService(config.completion ?? {});
      const digest = createStateDigestService(config.digest ?? {});
      const customApi = customCreateApi?.(context) ?? {};

      function serviceSnapshot() {
        return { random: random.getSnapshot(), completion: completion.getSnapshot(), digest: digest.getSnapshot() };
      }

      return {
        ...customApi,
        random,
        completion,
        digest,
        getSnapshot() { return { ...context.baseApi.getSnapshot(), services: serviceSnapshot() }; },
        loadSnapshot(snapshot = {}) {
          const base = context.baseApi.loadSnapshot(snapshot);
          if (snapshot.services?.random) random.loadSnapshot(snapshot.services.random);
          if (snapshot.services?.completion) completion.loadSnapshot(snapshot.services.completion);
          if (snapshot.services?.digest) digest.loadSnapshot(snapshot.services.digest);
          return { ...base, services: serviceSnapshot() };
        },
        reset(payload = {}) {
          const base = context.baseApi.reset(payload);
          random.reset(payload.random ?? payload);
          completion.reset(payload.completion ?? {});
          digest.reset();
          return { ...base, services: serviceSnapshot() };
        }
      };
    },
    install(context) {
      customInstall?.(context);
      const { engine } = context;
      const api = engine.n?.[apiName];
      if (!api) return;
      engine.n.seedStream ??= api.random;
      engine.seedStream ??= api.random;
      engine.seedKit ??= api.random;
      engine.n.genericSeed ??= api.random;
      engine.genericSeed ??= api.random;
      engine.genericSeedKit ??= api.random;
      engine.n.completion ??= api.completion;
      engine.n.completionLedger ??= api.completion;
      engine.completionLedger ??= api.completion;
      engine.n.stateDigest ??= api.digest;
      engine.stateDigest ??= api.digest;
    },
    metadata: {
      ...(config.metadata ?? {}),
      piecesFirst: true,
      promotedServices: ["seed-kit", "completion-ledger-kit", "state-digest-kit"]
    }
  });
}
