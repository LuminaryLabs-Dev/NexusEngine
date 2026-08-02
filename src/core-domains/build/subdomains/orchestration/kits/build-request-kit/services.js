import path from "node:path";

import {
  BUILD_REQUEST_SCHEMA,
  clone,
  normalizeBuildProfile,
  requirePlainObject,
  requireText
} from "../../../../contracts.js";

export function createBuildRequestService({ targetSet }) {
  function normalize(input = {}) {
    requirePlainObject(input, "Build request");
    return Object.freeze({
      schema: BUILD_REQUEST_SCHEMA,
      project: path.resolve(requireText(input.project, "Build project")),
      profile: normalizeBuildProfile(input.profile),
      targets: targetSet.normalize(input.targets ?? input.target),
      options: Object.freeze(clone(input.options ?? {}))
    });
  }

  return Object.freeze({ normalize });
}

export default createBuildRequestService;
