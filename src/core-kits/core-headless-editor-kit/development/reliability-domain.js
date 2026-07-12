import { defineDomainServiceKit } from "../../../domain-service-kit.js";
import { createHeadlessReliabilityApi } from "./reliability.js";

export function createHeadlessReliabilityDomainKit(config = {}) {
  return defineDomainServiceKit({
    id: config.id ?? "headless-reliability-domain-kit",
    domain: "headless-reliability",
    domainPath: "n:development:headless-reliability",
    parentDomainPath: "n:development",
    apiName: config.apiName ?? "headlessReliability",
    stability: config.stability ?? "experimental",
    version: "0.1.0",
    services: [
      "invariant-registry",
      "risk-classifier",
      "required-evidence",
      "evidence-scoring",
      "completion-gate"
    ],
    provides: [
      "headless-reliability:infer",
      "headless-reliability:score",
      "headless-reliability:completion-gate"
    ],
    createApi() {
      return createHeadlessReliabilityApi(config);
    },
    metadata: {
      rendererAgnostic: true,
      headless: true,
      optional: true,
      targetDriven: true,
      profileFree: true,
      boundary: "Infers reliability checks from the current target, repository, kit graph, contracts, and evidence. It does not own gameplay state, repository writes, browser drivers, or test implementations."
    }
  });
}

export default createHeadlessReliabilityDomainKit;
