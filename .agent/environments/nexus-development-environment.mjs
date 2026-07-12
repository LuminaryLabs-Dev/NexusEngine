import {
  createRepositoryDevelopmentEnvironment
} from "../../src/core-kits/core-headless-editor-kit/development/index.js";

export async function createEnvironment(options = {}) {
  return createRepositoryDevelopmentEnvironment({
    ...options,
    id: options.id ?? "nexus-repository-development",
    label: options.label ?? "NexusEngine Repository Development",
    root: options.root ?? process.cwd(),
    engineEntry: options.engineEntry ?? "src/index.js",
    targetPath: options.targetPath ?? ".agent/target.md"
  });
}

export default createEnvironment;
