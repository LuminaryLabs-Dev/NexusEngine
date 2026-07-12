import { defineDomainServiceKit } from "../../../domain-service-kit.js";
import { createHeadlessReliabilityApi } from "./reliability.js";
import {
  runGeneratedHeadlessReliabilityFixtures,
  synthesizeHeadlessReliabilityFixtures
} from "./fixture-runner.js";

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
      "fixture-synthesis",
      "required-evidence",
      "evidence-scoring",
      "completion-gate"
    ],
    provides: [
      "headless-reliability:infer",
      "headless-reliability:fixtures",
      "headless-reliability:score",
      "headless-reliability:completion-gate"
    ],
    createApi() {
      const reliability = createHeadlessReliabilityApi(config);
      return Object.freeze({
        ...reliability,
        synthesizeFixtures(input = {}) {
          const requirements = input.requirements ?? reliability.infer(input);
          return synthesizeHeadlessReliabilityFixtures({ ...input, requirements });
        },
        runFixtures(plan, context = {}) {
          return runGeneratedHeadlessReliabilityFixtures(plan, context);
        }
      });
    },
    metadata: {
      rendererAgnostic: true,
      headless: true,
      optional: true,
      targetDriven: true,
      profileFree: true,
      boundary: "Infers reliability checks and fixture plans from the current target, repository, kit graph, contracts, and evidence. It does not own gameplay state, repository writes, browser drivers, or project-specific test implementations."
    }
  });
}

export default createHeadlessReliabilityDomainKit;
