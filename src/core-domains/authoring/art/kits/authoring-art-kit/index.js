import { createDomainKit } from "../../../../domain-kit.js";
import { createCreativeHarnessContract } from "../../../contracts/creative-harness.js";
export function createAuthoringArtKit() {
  return createDomainKit({
    id: "authoring-art-kit", manifestId: "authoring-art-kit",
    domain: "authoring-art", domainPath: "n:authoring:art",
    parentDomainPath: "n:authoring", apiName: "authoringArt",
    requires: ["n:authoring:project"], provides: ["n:authoring:art"],
    purpose: "Select modeling approaches and review editable visual assets.",
    createApi: ({baseApi}) => ({...baseApi,...createCreativeHarnessContract("art")}),
  });
}
