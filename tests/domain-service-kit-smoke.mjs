import assert from "node:assert/strict";
import {
  createDomainServiceToken,
  createEngine,
  defineDomainServiceKit,
  defineEvent,
  defineResource,
  extendDomainServiceKit,
  isDomainServiceKit,
  validateDomainServiceKit
} from "./helpers/public-package-surface.mjs";

const ScanState = defineResource("dskSmoke.scanState");
const ScanCommand = defineEvent("dskSmoke.scanCommand");
const ScanDone = defineEvent("dskSmoke.scanDone");

function createScanKit() {
  return defineDomainServiceKit({
    domain: "scan-survey",
    stability: "experimental",
    version: "0.0.2",
    services: ["command", "snapshot"],
    provides: ["n:scan-survey", "n:scan-survey:command", "n:scan-survey:snapshot"],
    resources: { ScanState },
    events: { ScanCommand, ScanDone },
    inputs: ["dskSmoke.scanCommand"],
    outputs: ["dskSmoke.scanDone"],
    systems: [{
      phase: "simulate",
      name: "scanSurveySmokeSystem",
      system(world) {
        const state = world.getResource(ScanState) ?? { count: 0 };
        let count = state.count;
        for (const command of world.readEvents(ScanCommand)) {
          count += Number(command.amount ?? 1);
          world.emit(ScanDone, { count });
        }
        world.setResource(ScanState, { count });
      }
    }],
    initWorld({ world }) {
      world.setResource(ScanState, { count: 0 });
    },
    createApi({ world }) {
      return {
        scan(amount = 1) {
          world.emit(ScanCommand, { amount });
          return world.getResource(ScanState);
        },
        reset() {
          world.setResource(ScanState, { count: 0 });
          return world.getResource(ScanState);
        },
        getState() {
          return world.getResource(ScanState);
        },
        getSnapshot() {
          return structuredClone(world.getResource(ScanState));
        }
      };
    }
  });
}

const scanKit = createScanKit();
assert.equal(scanKit.id, "n-scan-survey-kit");
assert.equal(scanKit.metadata.kind, "domain-service-kit");
assert.equal(scanKit.metadata.namespace, "n");
assert.equal(scanKit.metadata.execution.mode, "linear");
assert.equal(scanKit.metadata.execution.asyncReady, true);
assert.deepEqual(scanKit.provides.slice(0, 3), ["n:scan-survey", "n:scan-survey:command", "n:scan-survey:snapshot"]);
assert.equal(createDomainServiceToken("scan-survey", "command"), "n:scan-survey:command");
assert.equal(isDomainServiceKit(scanKit), true);
assert.equal(validateDomainServiceKit(scanKit), scanKit);
assert.throws(() => defineDomainServiceKit({ domain: "", stability: "experimental", version: "0.0.2" }), /domain/);
assert.throws(() => defineDomainServiceKit({ domain: "bad domain", stability: "experimental", version: "0.0.2" }), /invalid domain/);
assert.throws(() => defineDomainServiceKit({ domain: "bad-token", stability: "experimental", version: "0.0.2", provides: [""] }), /invalid provides token/);
assert.throws(() => defineDomainServiceKit({ domain: "missing-version", stability: "experimental" }), /requires version/);

const ExtraState = defineResource("dskSmoke.extraState");
const ExtraEvent = defineEvent("dskSmoke.extraEvent");
const extended = extendDomainServiceKit(scanKit, {
  id: "n-scan-survey-extra-kit",
  apiName: "scanSurveyExtra",
  resources: { ExtraState },
  events: { ExtraEvent },
  systems: [{ phase: "resolve", name: "scanSurveyExtraSystem", system() {} }],
  provides: ["n:scan-survey:extra"]
});
assert.equal(extended.metadata.extends, scanKit.id);
assert.ok(extended.provides.includes("n:scan-survey:extra"));
assert.throws(() => extendDomainServiceKit(scanKit, { resources: { ScanState } }), /duplicate resources/);
assert.throws(() => extendDomainServiceKit(scanKit, { systems: [{ name: "scanSurveySmokeSystem", system() {} }] }), /duplicate system names/);

const dependency = defineDomainServiceKit({
  domain: "dependency",
  stability: "experimental",
  version: "0.0.2",
  provides: ["n:dependency"],
  createApi() {
    return { ok: true };
  }
});
const dependent = defineDomainServiceKit({
  domain: "dependent",
  stability: "experimental",
  version: "0.0.2",
  requires: ["n:dependency"],
  createApi() {
    return { ok: true };
  }
});
assert.throws(() => createEngine({ kits: [dependent] }), /requires missing token\(s\): n:dependency/);

const engine = createEngine({ kits: [dependency, scanKit] });
assert.ok(engine.n);
assert.equal(typeof engine.n.scanSurvey.scan, "function");
engine.n.scanSurvey.scan(2);
engine.tick();
assert.equal(engine.n.scanSurvey.getState().count, 2);
assert.deepEqual(JSON.parse(JSON.stringify(engine.n.scanSurvey.getSnapshot())), { count: 2 });
engine.installKit(scanKit);
assert.equal(engine.kits.filter((kit) => kit === scanKit).length, 1);
assert.throws(() => engine.installKit(createScanKit()), /already installed/);

const collisionKit = defineDomainServiceKit({
  domain: "scan-collision",
  apiName: "scanSurvey",
  stability: "experimental",
  version: "0.0.2",
  createApi() {
    return {};
  }
});
assert.throws(() => createEngine({ kits: [scanKit, collisionKit] }), /cannot overwrite engine\.n\.scanSurvey/);

console.log("domain-service-kit-smoke ok");
