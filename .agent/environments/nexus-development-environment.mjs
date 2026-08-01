import {
  createRepositoryDevelopmentEnvironment
} from "../../tools/headless-editor/development/index.js";

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
