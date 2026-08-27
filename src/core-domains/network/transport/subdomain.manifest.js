import { networkDomainManifest } from "../domain.manifest.js";
export default networkDomainManifest.subdomains.find(({ identity }) => identity.domainPath === "n:network:transport");
