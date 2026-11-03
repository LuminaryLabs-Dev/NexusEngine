import { createDomainKit } from "../../../../domain-kit.js";
import { createCreativeHarnessContract } from "../../../contracts/creative-harness.js";
export function createAuthoringDesignKit() {
  return createDomainKit({
    id: "authoring-design-kit", manifestId: "authoring-design-kit",
    domain: "authoring-design", domainPath: "n:authoring:design",
    parentDomainPath: "n:authoring", apiName: "authoringDesign",
    requires: ["n:authoring:project"], provides: ["n:authoring:design"],
    purpose: "Define layout, intent and reusable scene structures.",
    createApi: ({baseApi}) => ({...baseApi,...createCreativeHarnessContract("design")}),
  });
}
