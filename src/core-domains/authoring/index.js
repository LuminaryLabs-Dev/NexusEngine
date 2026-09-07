import { requireFields } from "./contracts/value.js";
export { default as authoringDomainManifest } from "./domain.manifest.js";
import { createAuthoringModifierServiceKit } from "./modifier/index.js";
export { createAuthoringModifierServiceKit };
import { createAuthoringPublishingServiceKit } from "./publishing/index.js";
export { createAuthoringPublishingServiceKit };
import { createAuthoringSequenceServiceKit } from "./sequence/index.js";
export { createAuthoringSequenceServiceKit };
import { createAuthoringDomainCompositionServiceKit } from "./domain-composition/index.js";
export { createAuthoringDomainCompositionServiceKit };
import { createAuthoringAssemblyServiceKit } from "./assembly/index.js";
export { createAuthoringAssemblyServiceKit };
import { createAuthoringAnimationServiceKit } from "./animation/index.js";
export { createAuthoringAnimationServiceKit };
import { createAuthoringSkinServiceKit } from "./skin/index.js";
export { createAuthoringSkinServiceKit };
import { createAuthoringRigServiceKit } from "./rig/index.js";
export { createAuthoringRigServiceKit };
import { createAuthoringPaintServiceKit } from "./paint/index.js";
export { createAuthoringPaintServiceKit };
import { createAuthoringMaterialServiceKit } from "./material/index.js";
export { createAuthoringMaterialServiceKit };
import { createAuthoringUVServiceKit } from "./uv/index.js";
export { createAuthoringUVServiceKit };
import { createAuthoringCurveServiceKit } from "./curve/index.js";
export { createAuthoringCurveServiceKit };
import { createAuthoringSculptServiceKit } from "./sculpt/index.js";
export { createAuthoringSculptServiceKit };
import { createAuthoringBrushServiceKit } from "./brush/index.js";
export { createAuthoringBrushServiceKit };
import { createAuthoringWorkspaceServiceKit } from "./workspace/index.js";
export { createAuthoringWorkspaceServiceKit };
import { createAuthoringDomainContractKit } from "./kits/authoring-domain-contract-kit/index.js";
export { createAuthoringDomainContractKit };
import { createAuthoringProjectDocumentKit } from "./project/index.js";
export { createAuthoringProjectDocumentKit };
import { createAuthoringMeshDocumentKit } from "./mesh/index.js";
export { createAuthoringMeshDocumentKit };
import { createAuthoringEditingSessionKit } from "./editing/index.js";
export { createAuthoringEditingSessionKit };
export function createAuthoringDomain(config = {}) {
  requireFields(
    config,
    ["contract", "project", "mesh", "editing"],
    "Authoring domain configuration",
  );
  return [
    createAuthoringDomainContractKit(config.contract ?? {}),
    createAuthoringProjectDocumentKit(config.project ?? {}),
    createAuthoringMeshDocumentKit(config.mesh ?? {}),
    createAuthoringEditingSessionKit(config.editing ?? {}),
    createAuthoringWorkspaceServiceKit(),
    createAuthoringBrushServiceKit(),
    createAuthoringSculptServiceKit(),
    createAuthoringCurveServiceKit(),
    createAuthoringUVServiceKit(),
    createAuthoringMaterialServiceKit(),
    createAuthoringPaintServiceKit(),
    createAuthoringRigServiceKit(),
    createAuthoringSkinServiceKit(),
    createAuthoringAnimationServiceKit(),
    createAuthoringAssemblyServiceKit(),
    createAuthoringDomainCompositionServiceKit(),
    createAuthoringSequenceServiceKit(),
    createAuthoringPublishingServiceKit(),
    createAuthoringModifierServiceKit(),
  ];
}
