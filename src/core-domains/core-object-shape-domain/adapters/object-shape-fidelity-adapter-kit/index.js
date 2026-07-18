const clone = (value) => value === undefined ? undefined : structuredClone(value);

export function createObjectShapeFidelityAdapterKit(options = {}) {
  return Object.freeze({
    id: options.id ?? "object-shape-fidelity-adapter-kit",
    version: "0.2.0",
    install({ engine }) {
      const fidelity = engine.n?.objectFidelity ?? engine.objectFidelity;
      const shape = engine.n?.objectShape ?? engine.objectShape;
      if (!fidelity?.registerFormBuilder || !shape?.derive) {
        throw new Error("Object Shape Fidelity adapter requires Object Shape and Object Fidelity.");
      }
      fidelity.registerFormBuilder({
        id: options.builderId ?? "object-shape-form",
        async prepare({ object, requirement, buildId }) {
          const settings = requirement.shape ?? requirement.metadata?.shape;
          if (!settings?.profileId || !settings?.targetId) {
            throw new TypeError(`Fidelity requirement ${requirement.id} requires shape.profileId and shape.targetId.`);
          }
          const sourceShapeId = settings.sourceShapeId ?? object.geometry?.descriptorId ?? `${object.id}:source-shape`;
          const job = await shape.derive({
            sourceShapeId,
            profileId: settings.profileId,
            targetId: settings.targetId,
            providerId: settings.providerId
          });
          if (job.state !== "ready") {
            const qualification = job.qualificationId ? shape.getQualification?.(job.qualificationId) : null;
            throw new Error(
              `Object Shape job ${job.id} is ${job.state}; only qualified ready shapes may become Fidelity forms.`
              + (qualification?.failures?.length ? ` ${qualification.failures.map((failure) => failure.check).join(", ")}` : "")
            );
          }
          const derived = shape.getShape(job.resultShapeId);
          if (!derived?.qualification || derived.qualification.status !== "approved") {
            throw new Error(`Object Shape result ${job.resultShapeId} has no approved qualification evidence.`);
          }
          return {
            form: {
              id: `${buildId}:${requirement.id}`,
              objectId: object.id,
              requirementId: requirement.id,
              fidelity: requirement.fidelity,
              state: "ready",
              traits: requirement.requiredTraits,
              layers: [{
                id: "shape",
                role: "structure",
                kind: "mesh",
                reference: derived.asset ?? { descriptorId: derived.id, provider: "object-shape" },
                metadata: {
                  shapeId: derived.id,
                  metrics: clone(derived.metrics),
                  quality: clone(derived.quality),
                  qualificationId: derived.qualification.id,
                  qualificationContentHash: derived.qualification.contentHash,
                  approvedRatio: derived.metadata?.approvedRatio,
                  fallbackUsed: Boolean(derived.metadata?.fallbackUsed)
                }
              }],
              metadata: {
                source: "object-shape",
                shapeJobId: job.id,
                shapeId: derived.id,
                shapeContentHash: derived.contentHash,
                qualificationId: derived.qualification.id,
                qualificationContentHash: derived.qualification.contentHash
              }
            }
          };
        }
      });
    },
    metadata: {
      scope: "object-shape-fidelity-adapter",
      ownsLoop: false,
      boundary: "Turns only qualified ready Object Shape results into Object Fidelity forms without moving shape derivation, qualification, fallback, or fidelity ownership."
    }
  });
}

export default createObjectShapeFidelityAdapterKit;
