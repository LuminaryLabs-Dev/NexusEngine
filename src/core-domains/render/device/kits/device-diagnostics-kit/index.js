import { createDomainKit } from "../../../../domain-kit.js";
import { canonicalDeviceValue } from "../../device-contracts.js";
import {
  deviceDiagnosticsContract,
  normalizeDiagnosticsQuery,
  normalizeDiagnosticsSnapshot
} from "./contracts.js";

function requiredApi(engine, name) {
  const api = engine.n?.[name];
  if (!api) throw new Error(`Render device diagnostics requires public capability ${name}.`);
  return api;
}

export function createDeviceDiagnosticsKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "device-diagnostics-kit",
    id: config.id ?? "device-diagnostics-kit",
    domain: "render-device-diagnostics",
    domainPath: "n:render:device",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderDeviceDiagnostics",
    requires: [
      "n:render:device",
      "render:device-capability",
      "render:device-memory",
      "render:device-queue",
      "render:device-lifecycle",
      "render:device-loss"
    ],
    provides: ["render:device-diagnostics"],
    purpose: "Project deterministic read-only diagnostics from public Render device capabilities.",
    owns: ["portable device diagnostic report schema", "read-only aggregate projection"],
    doesNotOwn: ["provider diagnostics", "metrics collection", "state mutation", "repair", "GPU inspection"],
    createApi({ baseApi, engine }) {
      return {
        ...baseApi,
        getContract: deviceDiagnosticsContract,
        getReport(input = {}) {
          const query = normalizeDiagnosticsQuery(input);
          const capabilities = requiredApi(engine, "renderDeviceCapabilities");
          const memory = requiredApi(engine, "renderDeviceMemory");
          const queues = requiredApi(engine, "renderDeviceQueues");
          const lifecycle = requiredApi(engine, "renderDeviceLifecycle");
          const loss = requiredApi(engine, "renderDeviceLoss");
          const capabilityRecords = query.capabilityId
            ? [capabilities.getCapability(query.capabilityId)].filter(Boolean)
            : capabilities.listCapabilities();
          if (query.capabilityId && capabilityRecords.length === 0) {
            throw new TypeError(`Unknown Render device capability ${query.capabilityId}.`);
          }
          const capabilityIds = new Set(capabilityRecords.map((entry) => entry.capabilityId));
          const budgets = memory.listBudgets()
            .filter((entry) => capabilityIds.has(entry.capabilityId))
            .map((entry) => ({ budget: entry, usage: memory.getUsage(entry.budgetId) }));
          const queueRecords = queues.listQueues()
            .filter((entry) => capabilityIds.has(entry.capabilityId))
            .map((entry) => {
              const submissions = queues.listSubmissions(entry.queueId);
              return {
                queue: entry,
                submissions: {
                  total: submissions.length,
                  pending: submissions.filter((submission) => submission.status === "pending").length,
                  completed: submissions.filter((submission) => submission.status === "completed").length
                }
              };
            });
          return canonicalDeviceValue({
            schema: deviceDiagnosticsContract().schema,
            capabilityIds: [...capabilityIds].sort(),
            capabilities: capabilityRecords,
            memory: budgets,
            queues: queueRecords,
            lifecycle: {
              phase: lifecycle.getPhase(),
              device: lifecycle.getDevice(),
              capabilityId: lifecycle.getCapabilityId()
            },
            activeLoss: loss.getActiveLoss()
          }, "Render device diagnostics report");
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizeDiagnosticsSnapshot(snapshot));
        }
      };
    }
  });
}

export default createDeviceDiagnosticsKit;
