import { createDomainKit } from "../../../domain-kit.js";
import {
  canonicalDetectionValue,
  requireDetectionInteger,
  requireDetectionObject,
  rejectDetectionFields
} from "./detection-contracts.js";

const PURE_SNAPSHOT_FIELDS = Object.freeze([
  "id",
  "domain",
  "version",
  "config",
  "descriptors",
  "policies",
  "adapters",
  "metadata",
  "sequence",
  "lastEvent",
  "operationReceipts"
]);

function normalizePureSnapshot(snapshot, domain) {
  requireDetectionObject(snapshot, `${domain} snapshot`);
  rejectDetectionFields(snapshot, PURE_SNAPSHOT_FIELDS, `${domain} snapshot`);
  const value = canonicalDetectionValue(snapshot, `${domain} snapshot`);
  if (value.domain !== domain) throw new TypeError(`${domain} snapshot.domain must equal ${domain}.`);
  requireDetectionInteger(value.sequence, `${domain} snapshot.sequence`);
  return value;
}

function unsupportedMutation(domain) {
  return () => {
    throw new TypeError(`${domain} is a pure Detection Kit and does not expose generic mutation.`);
  };
}

export function createDetectionContract({ schema, responsibility, methods, inputs, outputs }) {
  return Object.freeze({
    schema,
    responsibility,
    methods: Object.freeze([...methods]),
    inputs: Object.freeze([...inputs]),
    outputs: Object.freeze([...outputs]),
    deterministic: true,
    querySideEffects: false,
    providerExecutionOwnedExternally: false
  });
}

export function createPureDetectionKit(config = {}) {
  const domain = config.domain;
  const methods = config.methods ?? {};
  return createDomainKit({
    ...config,
    domain,
    domainPath: "n:physics:detection",
    parentDomainPath: "n:physics",
    initialState: {},
    createApi({ baseApi, engine }) {
      const boundMethods = Object.fromEntries(Object.entries(methods).map(([name, method]) => [
        name,
        (...args) => method({ engine }, ...args)
      ]));
      return {
        ...baseApi,
        getContract: () => config.contract,
        ...boundMethods,
        loadSnapshot(snapshot) {
          return baseApi.loadSnapshot(normalizePureSnapshot(snapshot, domain));
        },
        configure: unsupportedMutation(domain),
        update: unsupportedMutation(domain),
        setDescriptor: unsupportedMutation(domain),
        applyCommand: unsupportedMutation(domain)
      };
    }
  });
}
