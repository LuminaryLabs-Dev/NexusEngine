import assert from "node:assert/strict";
import { createEngine, defineDomainServiceKit } from "../helpers/public-package-surface.mjs";

const customInputKit = defineDomainServiceKit({
  id: "n-custom-input-kit",
  domain: "custom-input",
  apiName: "customInput",
  services: ["state"],
  stability: "test",
  version: "0.0.3",
  createApi() {
    return {
      getSnapshot() {
        return { kind: "custom-input" };
      }
    };
  }
});

const engine = createEngine({ kits: [customInputKit] });
assert.equal(engine.n.customInput.getSnapshot().kind, "custom-input", "custom replacement kit installs without core input");
assert.equal(engine.n.input, undefined, "core input is not required by the engine");

console.log("core custom replacement smoke ok");
