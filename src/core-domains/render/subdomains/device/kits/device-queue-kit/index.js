import { createDomainKit } from "../../../../../domain-kit.js";
import { assertDeviceReceiptMatches } from "../../device-contracts.js";
import {
  deviceQueueContract,
  normalizeDeviceQueue,
  normalizeDeviceSubmission,
  normalizeQueueDefinitionCommand,
  normalizeQueueRemovalCommand,
  normalizeQueueSnapshot,
  normalizeStoredSubmission,
  normalizeSubmissionCommand,
  normalizeSubmissionCompletionCommand
} from "./contracts.js";

function requiredApi(engine, name) {
  const api = engine.n?.[name];
  if (!api) throw new Error(`Render device queue requires public capability ${name}.`);
  return api;
}

export function createDeviceQueueKit(config = {}) {
  return createDomainKit({
    ...config,
    manifestId: "device-queue-kit",
    id: config.id ?? "device-queue-kit",
    domain: "render-device-queue",
    domainPath: "n:render:device",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? "renderDeviceQueues",
    requires: ["n:render:device", "render:device-contract", "render:device-feature", "render:device-capability"],
    provides: ["render:device-queue"],
    purpose: "Own logical Render queue descriptors and exact-once submission and completion receipts.",
    owns: ["logical queue records", "portable submission records", "submission dependency and completion state"],
    doesNotOwn: ["command encoding", "GPU submission", "provider fences", "thread scheduling", "frame execution"],
    initialState: {
      queues: {},
      queueOrder: [],
      submissions: {},
      submissionOrder: [],
      queueRevision: 0
    },
    createApi({ baseApi, engine }) {
      const capabilities = () => requiredApi(engine, "renderDeviceCapabilities");
      function getQueue(queueId) {
        return baseApi.getState().queues[String(queueId)] ?? null;
      }
      function getSubmission(submissionId) {
        return baseApi.getState().submissions[String(submissionId)] ?? null;
      }
      function validateQueue(queue) {
        const capability = capabilities().getCapability(queue.capabilityId);
        if (!capability) {
          throw new TypeError(`Render device queue ${queue.queueId} references unknown capability ${queue.capabilityId}.`);
        }
        const requiredFeature = { graphics: "rendering", compute: "compute", transfer: "transfer" }[queue.queueType];
        if (!capability.featureIds.includes(requiredFeature)) {
          throw new TypeError(`Render device queue ${queue.queueId} requires feature ${requiredFeature}.`);
        }
        return queue;
      }
      function validateState(state) {
        Object.values(state.queues).forEach(validateQueue);
        for (const submission of Object.values(state.submissions)) {
          normalizeStoredSubmission(submission);
          if (!state.queues[submission.queueId]) {
            throw new TypeError(`Render device submission ${submission.submissionId} references unknown queue ${submission.queueId}.`);
          }
          for (const dependencyId of submission.dependencyIds) {
            if (dependencyId === submission.submissionId) throw new TypeError(`Render device submission ${submission.submissionId} cannot depend on itself.`);
            if (!state.submissions[dependencyId]) throw new TypeError(`Render device submission ${submission.submissionId} references unknown dependency ${dependencyId}.`);
          }
          if (submission.status === "completed") {
            const incomplete = submission.dependencyIds.filter((id) => state.submissions[id].status !== "completed");
            if (incomplete.length) {
              throw new TypeError(`Completed Render device submission ${submission.submissionId} has incomplete dependencies: ${incomplete.join(", ")}.`);
            }
          }
        }
        const visiting = new Set();
        const visited = new Set();
        function visit(submissionId) {
          if (visited.has(submissionId)) return;
          if (visiting.has(submissionId)) throw new TypeError(`Render device submission dependency cycle includes ${submissionId}.`);
          visiting.add(submissionId);
          for (const dependencyId of state.submissions[submissionId].dependencyIds) visit(dependencyId);
          visiting.delete(submissionId);
          visited.add(submissionId);
        }
        state.submissionOrder.forEach(visit);
        return state;
      }
      return {
        ...baseApi,
        getContract: deviceQueueContract,
        normalizeQueue: normalizeDeviceQueue,
        normalizeSubmission: normalizeDeviceSubmission,
        defineQueue(command = {}) {
          const request = normalizeQueueDefinitionCommand(command);
          return baseApi.applyCommand(request, (state) => {
            validateQueue(request.queue);
            const existing = state.queues[request.queue.queueId];
            if (existing && JSON.stringify(existing) !== JSON.stringify(request.queue)) {
              throw new TypeError(`Render device queue ${request.queue.queueId} already exists with different content.`);
            }
            const created = !existing;
            const queues = created ? { ...state.queues, [request.queue.queueId]: request.queue } : state.queues;
            const queueRevision = created ? state.queueRevision + 1 : state.queueRevision;
            return {
              patch: { queues, queueOrder: Object.keys(queues).sort(), queueRevision },
              result: { queue: request.queue, created, queueRevision }
            };
          });
        },
        removeQueue(command = {}) {
          const request = normalizeQueueRemovalCommand(command);
          return baseApi.applyCommand(request, (state) => {
            if (!state.queues[request.queueId]) throw new TypeError(`Unknown Render device queue ${request.queueId}.`);
            if (Object.values(state.submissions).some((entry) => entry.queueId === request.queueId && entry.status === "pending")) {
              throw new TypeError(`Render device queue ${request.queueId} still has pending submissions.`);
            }
            const queues = { ...state.queues };
            delete queues[request.queueId];
            return {
              patch: { queues, queueOrder: Object.keys(queues).sort(), queueRevision: state.queueRevision + 1 },
              result: { queueId: request.queueId, removed: true, queueRevision: state.queueRevision + 1 }
            };
          });
        },
        submit(command = {}) {
          const request = normalizeSubmissionCommand(command);
          return baseApi.applyCommand(request, (state) => {
            if (!state.queues[request.submission.queueId]) throw new TypeError(`Unknown Render device queue ${request.submission.queueId}.`);
            for (const dependencyId of request.submission.dependencyIds) {
              if (dependencyId === request.submission.submissionId) throw new TypeError(`Render device submission ${request.submission.submissionId} cannot depend on itself.`);
              if (!state.submissions[dependencyId]) throw new TypeError(`Unknown Render device submission dependency ${dependencyId}.`);
            }
            const stored = { ...request.submission, status: "pending", providerReceipt: null };
            const existing = state.submissions[stored.submissionId];
            if (existing && JSON.stringify(existing) !== JSON.stringify(stored)) {
              throw new TypeError(`Render device submission ${stored.submissionId} already exists with different content.`);
            }
            const created = !existing;
            const submissions = created ? { ...state.submissions, [stored.submissionId]: stored } : state.submissions;
            const queueRevision = created ? state.queueRevision + 1 : state.queueRevision;
            return {
              patch: { submissions, submissionOrder: Object.keys(submissions).sort(), queueRevision },
              result: { submission: stored, created, queueRevision }
            };
          });
        },
        complete(command = {}) {
          const request = normalizeSubmissionCompletionCommand(command);
          return baseApi.applyCommand(request, (state) => {
            const submission = state.submissions[request.submissionId];
            if (!submission) throw new TypeError(`Unknown Render device submission ${request.submissionId}.`);
            if (submission.status !== "pending") throw new TypeError(`Render device submission ${request.submissionId} is already ${submission.status}.`);
            const queue = state.queues[submission.queueId];
            const capability = capabilities().getCapability(queue.capabilityId);
            if (request.providerReceipt.submissionId !== submission.submissionId) {
              throw new TypeError(`Queue receipt submission ${request.providerReceipt.submissionId} does not match ${submission.submissionId}.`);
            }
            if (request.providerReceipt.queueId !== queue.queueId) {
              throw new TypeError(`Queue receipt queue ${request.providerReceipt.queueId} does not match ${queue.queueId}.`);
            }
            assertDeviceReceiptMatches(capability.device, request.providerReceipt);
            const incomplete = submission.dependencyIds.filter((id) => state.submissions[id]?.status !== "completed");
            if (incomplete.length) throw new TypeError(`Render device submission ${request.submissionId} has incomplete dependencies: ${incomplete.join(", ")}.`);
            const completed = { ...submission, status: "completed", providerReceipt: request.providerReceipt };
            const submissions = { ...state.submissions, [completed.submissionId]: completed };
            return {
              patch: { submissions, queueRevision: state.queueRevision + 1 },
              result: { submission: completed, queueRevision: state.queueRevision + 1 }
            };
          });
        },
        hasQueue(queueId) {
          return Boolean(getQueue(queueId));
        },
        getQueue,
        listQueues() {
          const state = baseApi.getState();
          return state.queueOrder.map((id) => state.queues[id]);
        },
        getSubmission,
        listSubmissions(queueId = null) {
          const state = baseApi.getState();
          return state.submissionOrder
            .map((id) => state.submissions[id])
            .filter((entry) => queueId === null || entry.queueId === queueId);
        },
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(validateState(normalizeQueueSnapshot(snapshot)));
        }
      };
    }
  });
}

export default createDeviceQueueKit;
