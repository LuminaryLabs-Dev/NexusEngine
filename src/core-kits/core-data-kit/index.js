import { createCoreCapabilityKit } from "../core-capability-kit.js";
import {
  createCompletionService,
  createDeterministicRandomService,
  createStateDigestService
} from "./services.js";
import { createDataPackageService } from "./package-service.js";
import { validateDataSchema } from "./schema.js";

export * from "./snapshot.js";
export * from "./ledger.js";
export * from "./selectors.js";
export * from "./schema.js";
export * from "./migration.js";
export * from "./services.js";
export * from "./package-service.js";

export function createCoreDataKit(config = {}) {
  const customCreateApi = config.createApi;
  const customInstall = config.install;
  const apiName = config.apiName ?? "coreData";

  return createCoreCapabilityKit({
    ...config,
    domain: "core-data",
    apiName,
    purpose: "Durable state, snapshots, selectors, schemas, ledgers, migrations, deterministic random streams, completion state, state digests, and portable package envelopes.",
    owns: [
      "serializable state",
      "snapshots",
      "selectors",
      "completion ledgers",
      "idempotency ledgers",
      "data migrations",
      "named deterministic random streams",
      "canonical state digests",
      "portable package schemas and envelopes",
      ...(config.owns ?? [])
    ],
    doesNotOwn: ["storage targets", "renderer data", "agent decisions", ...(config.doesNotOwn ?? [])],
    services: [...(config.services ?? []), "random", "completion", "digest", "packages"],
    createApi(context) {
      const random = createDeterministicRandomService(config.random ?? {});
      const completion = createCompletionService(config.completion ?? {});
      const digest = createStateDigestService(config.digest ?? {});
      const packages = createDataPackageService({
        ...(config.packages ?? {}),
        digest,
        validator: (schema, value, options = {}) => validateDataSchema(schema, value, options)
      });
      const customApi = customCreateApi?.(context) ?? {};

      function serviceSnapshot() {
        return {
          random: random.getSnapshot(),
          completion: completion.getSnapshot(),
          digest: digest.getSnapshot(),
          packages: packages.getSnapshot()
        };
      }

      return {
        ...customApi,
        random,
        completion,
        digest,
        packages,
        getSnapshot() { return { ...context.baseApi.getSnapshot(), services: serviceSnapshot() }; },
        loadSnapshot(snapshot = {}) {
          const base = context.baseApi.loadSnapshot(snapshot);
          if (snapshot.services?.random) random.loadSnapshot(snapshot.services.random);
          if (snapshot.services?.completion) completion.loadSnapshot(snapshot.services.completion);
          if (snapshot.services?.digest) digest.loadSnapshot(snapshot.services.digest);
          if (snapshot.services?.packages) packages.loadSnapshot(snapshot.services.packages);
          return { ...base, services: serviceSnapshot() };
        },
        reset(payload = {}) {
          const base = context.baseApi.reset(payload);
          random.reset(payload.random ?? payload);
          completion.reset(payload.completion ?? {});
          digest.reset();
          packages.reset(payload.packages ?? {});
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
      promotedServices: ["seed-kit", "completion-ledger-kit", "state-digest-kit", "package-schema-service"]
    }
  });
}
