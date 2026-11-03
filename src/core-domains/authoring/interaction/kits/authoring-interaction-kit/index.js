import { createDomainKit } from "../../../../domain-kit.js";
import { createCreativeHarnessContract } from "../../../contracts/creative-harness.js";
export function createAuthoringInteractionKit() {
  return createDomainKit({
    id: "authoring-interaction-kit", manifestId: "authoring-interaction-kit",
    domain: "authoring-interaction", domainPath: "n:authoring:interaction",
    parentDomainPath: "n:authoring", apiName: "authoringInteraction",
    requires: ["n:authoring:project"], provides: ["n:authoring:interaction"],
    purpose: "Define interaction behavior and scenario acceptance.",
    createApi: ({baseApi}) => ({...baseApi,...createCreativeHarnessContract("interaction")}),
  });
}
