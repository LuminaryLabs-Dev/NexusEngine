import { createDomainKit } from "../../../../domain-kit.js";
import { createCreativeHarnessContract } from "../../../contracts/creative-harness.js";
export function createAuthoringCraftKit() {
  return createDomainKit({
    id: "authoring-craft-kit", manifestId: "authoring-craft-kit",
    domain: "authoring-craft", domainPath: "n:authoring:craft",
    parentDomainPath: "n:authoring", apiName: "authoringCraft",
    requires: ["n:authoring:project"], provides: ["n:authoring:craft"],
    purpose: "Coordinate discipline quality and targeted revision directions.",
    createApi: ({baseApi}) => ({...baseApi,...createCreativeHarnessContract("craft")}),
  });
}
