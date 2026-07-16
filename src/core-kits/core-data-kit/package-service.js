const clone = (value) => value === undefined ? undefined : structuredClone(value);

function stableText(value, fallback, label) {
  const text = String(value ?? fallback ?? "").trim();
  if (!text) throw new TypeError(`${label} requires a non-empty value.`);
  return text;
}

function normalizeSchema(schema = {}) {
  const id = stableText(schema.id, null, "Data schema");
  return Object.freeze({
    id,
    version: stableText(schema.version, "1.0.0", "Data schema version"),
    fields: Object.freeze(clone(schema.fields ?? {})),
    required: Object.freeze([...(schema.required ?? [])].map(String)),
    additionalProperties: schema.additionalProperties !== false
  });
}

export function createDataPackageService(config = {}) {
  const initialSchemas = Array.isArray(config.schemas) ? config.schemas : [];
  const digestService = config.digest;
  let schemas = new Map();
  let activeEnvelope = null;
  let validationReceipts = [];
  const receiptLimit = Math.max(1, Math.floor(Number(config.receiptLimit) || 64));

  function requireDigest() {
    if (!digestService || typeof digestService.digest !== "function" || typeof digestService.verify !== "function") {
      throw new Error("Core Data package service requires a digest service.");
    }
    return digestService;
  }

  function registerSchema(schema, options = {}) {
    const normalized = normalizeSchema(schema);
    const existing = schemas.get(normalized.id);
    if (existing && options.replace !== true) return clone(existing);
    schemas.set(normalized.id, normalized);
    return clone(normalized);
  }

  function getSchema(schemaId) {
    return clone(schemas.get(stableText(schemaId, null, "Schema id")) ?? null);
  }

  function requireSchema(schemaOrId) {
    if (typeof schemaOrId === "string") {
      const schema = schemas.get(stableText(schemaOrId, null, "Schema id"));
      if (!schema) throw new RangeError(`Unknown Core Data schema: ${schemaOrId}.`);
      return schema;
    }
    return normalizeSchema(schemaOrId);
  }

  function validate(schemaOrId, value, options = {}) {
    const schema = requireSchema(schemaOrId);
    const validator = options.validator ?? config.validator;
    if (typeof validator !== "function") {
      throw new Error("Core Data package service requires a schema validator.");
    }
    const validated = validator(schema, value, options);
    const receipt = {
      schema: "nexusengine.core-data.package-validation/1",
      schemaId: schema.id,
      schemaVersion: schema.version,
      valid: true,
      metadata: clone(options.metadata ?? {})
    };
    validationReceipts = [...validationReceipts, receipt].slice(-receiptLimit);
    return { value: validated, receipt: clone(receipt) };
  }

  function createEnvelope(input = {}) {
    const schema = requireSchema(input.schemaId ?? input.productSchema ?? input.schema);
    const packageId = stableText(input.packageId ?? input.id, null, "Package");
    const validation = validate(schema, input.payload, { metadata: input.validationMetadata });
    const digest = requireDigest().digest(validation.value, {
      packageId,
      schemaId: schema.id,
      schemaVersion: schema.version,
      ...(clone(input.digestMetadata ?? {}))
    });
    const envelope = {
      schema: "nexusengine.package-envelope/1",
      packageId,
      productSchema: schema.id,
      productVersion: schema.version,
      digest: digest.digest,
      digestAlgorithm: digest.algorithm,
      createdFrom: clone(input.createdFrom ?? {}),
      metadata: clone(input.metadata ?? {}),
      validation: validation.receipt,
      payload: clone(validation.value)
    };
    activeEnvelope = clone(envelope);
    return clone(envelope);
  }

  function verifyEnvelope(envelope = {}, options = {}) {
    if (!envelope || typeof envelope !== "object" || Array.isArray(envelope)) {
      throw new TypeError("Package envelope must be an object.");
    }
    if (envelope.schema !== "nexusengine.package-envelope/1") {
      throw new TypeError(`Unsupported package envelope schema: ${envelope.schema}.`);
    }
    const schema = requireSchema(options.schemaId ?? envelope.productSchema);
    if (String(envelope.productVersion) !== String(schema.version)) {
      throw new TypeError(`Package version ${envelope.productVersion} does not match schema ${schema.version}.`);
    }
    const validation = validate(schema, envelope.payload, { metadata: { verification: true } });
    const verification = requireDigest().verify(validation.value, envelope.digest);
    const receipt = {
      schema: "nexusengine.core-data.package-verification/1",
      packageId: stableText(envelope.packageId, null, "Package"),
      schemaId: schema.id,
      schemaVersion: schema.version,
      valid: verification.ok,
      expectedDigest: verification.expected,
      actualDigest: verification.actual.digest
    };
    validationReceipts = [...validationReceipts, receipt].slice(-receiptLimit);
    if (!verification.ok && options.throwOnMismatch !== false) {
      throw new Error(`Package digest mismatch for ${envelope.packageId}.`);
    }
    if (verification.ok) activeEnvelope = clone(envelope);
    return clone(receipt);
  }

  function getSnapshot() {
    return {
      schema: "nexusengine.core-data.packages/1",
      schemas: [...schemas.values()].sort((a, b) => a.id.localeCompare(b.id)).map(clone),
      activeEnvelope: clone(activeEnvelope),
      validationReceipts: clone(validationReceipts)
    };
  }

  function loadSnapshot(snapshot = {}) {
    if (snapshot.schema !== "nexusengine.core-data.packages/1") {
      throw new TypeError("Unsupported Core Data package-service snapshot.");
    }
    schemas = new Map();
    for (const schema of snapshot.schemas ?? []) registerSchema(schema, { replace: true });
    activeEnvelope = clone(snapshot.activeEnvelope ?? null);
    validationReceipts = clone(snapshot.validationReceipts ?? []).slice(-receiptLimit);
    return getSnapshot();
  }

  function reset(payload = {}) {
    schemas = new Map();
    activeEnvelope = null;
    validationReceipts = [];
    const source = payload.schemas ?? initialSchemas;
    for (const schema of source) registerSchema(schema, { replace: true });
    return getSnapshot();
  }

  reset();
  return Object.freeze({
    registerSchema,
    getSchema,
    listSchemas() { return [...schemas.values()].sort((a, b) => a.id.localeCompare(b.id)).map(clone); },
    validate,
    createEnvelope,
    verifyEnvelope,
    getActiveEnvelope() { return clone(activeEnvelope); },
    getValidationReceipts() { return clone(validationReceipts); },
    getState: getSnapshot,
    getSnapshot,
    snapshot: getSnapshot,
    loadSnapshot,
    reset
  });
}
