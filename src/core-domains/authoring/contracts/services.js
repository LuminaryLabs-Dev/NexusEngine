import { authoringError as error, requireFields } from "./value.js";
export function serviceRegistrar(project, domain, profile) {
  return (
    id,
    fields,
    execute,
    effects = { reads: [domain], writes: [domain], atomic: true },
  ) =>
    project.registerOperation({
      id: `${domain}.${id}`,
      domainPath: `n:authoring:${domain}`,
      schemaVersion: 1,
      parameters: { type: "object", fields, additionalProperties: false },
      effects,
      profile,
      cancellation: "before-submit",
      execute(tx, args) {
        requireFields(args, fields, `${domain}.${id}`);
        return execute(tx, args);
      },
    });
}
export function typedDocument(tx, id, kind, expectedRevision) {
  const doc = tx.get(id, expectedRevision);
  if (doc.kind !== kind)
    throw error(
      "AUTHORING_DEPENDENCY_KIND",
      `Expected ${kind} document ${id}.`,
    );
  return doc;
}
export const reference = (id, kind, revision = "latest") => ({
  id,
  kind,
  revision,
});
export function registerDocumentService(
  project,
  {
    kind,
    domain = kind,
    normalize,
    dependencies = () => [],
    validateReferences,
    profile,
  },
) {
  project.registerKind({
    id: kind,
    version: 1,
    normalize,
    dependencies,
    validateReferences,
  });
  const register = serviceRegistrar(project, domain, profile);
  register("set", ["id", "expectedRevision", "content"], (tx, args) => {
    tx.put({ id: args.id, kind, content: args.content }, args.expectedRevision);
    return { id: args.id };
  });
  register("delete", ["id", "expectedRevision"], (tx, args) => {
    typedDocument(tx, args.id, kind, args.expectedRevision);
    tx.remove(args.id, args.expectedRevision);
    return { id: args.id };
  });
  return register;
}
