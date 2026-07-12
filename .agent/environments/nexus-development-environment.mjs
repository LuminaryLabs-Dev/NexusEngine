import {
  createHeadlessEditorEnvironment,
  inferHeadlessReliabilityRequirements,
  inspectRelativeModuleGraph,
  inspectRepository,
  readDevelopmentTarget,
  resumeGuidedDevelopmentSession,
  startGuidedDevelopmentSession
} from "../../src/core-kits/core-headless-editor-kit/index.js";

export async function createEnvironment(options = {}) {
  const root = options.root ?? process.cwd();
  let activeSession = null;

  return createHeadlessEditorEnvironment({
    id: "nexus-repository-development",
    label: "NexusEngine Repository Development",
    domains: ["repository", "module", "development", "guidance"],
    metadata: {
      root,
      targetDriven: true,
      staticDevelopmentProfileRequired: false
    },
    capabilities: [
      {
        id: "repository.inspect",
        domain: "repository",
        execute: async () => ({ data: await inspectRepository(root) })
      },
      {
        id: "repository.readAgentInstructions",
        domain: "repository",
        execute: async () => ({ data: { path: "AGENTS.md", required: true } })
      },
      {
        id: "module.inspectGraph",
        domain: "module",
        execute: async ({ entry = "src/index.js" } = {}) => ({
          data: await inspectRelativeModuleGraph({ root, entry })
        })
      },
      {
        id: "guidance.classifyRisk",
        domain: "guidance",
        execute: async () => {
          const [target, repository, moduleGraph] = await Promise.all([
            readDevelopmentTarget(".agent/target.md", { root }),
            inspectRepository(root),
            inspectRelativeModuleGraph({ root, entry: "src/index.js" })
          ]);
          return {
            data: inferHeadlessReliabilityRequirements({
              target,
              repository,
              moduleGraph,
              changedFiles: repository.changedFiles
            })
          };
        }
      },
      {
        id: "development.start",
        domain: "development",
        execute: async () => {
          activeSession = await startGuidedDevelopmentSession({ root });
          return { data: await activeSession.status() };
        }
      },
      {
        id: "development.resume",
        domain: "development",
        execute: async () => {
          activeSession = await resumeGuidedDevelopmentSession({ root });
          return { data: await activeSession.status() };
        }
      },
      {
        id: "development.status",
        domain: "development",
        execute: async () => {
          activeSession ??= await resumeGuidedDevelopmentSession({ root });
          return { data: await activeSession.status() };
        }
      },
      {
        id: "development.next",
        domain: "development",
        execute: async () => {
          activeSession ??= await resumeGuidedDevelopmentSession({ root });
          return { data: await activeSession.next() };
        }
      },
      {
        id: "development.continue",
        domain: "development",
        execute: async ({ maxSteps = 50 } = {}) => {
          activeSession ??= await resumeGuidedDevelopmentSession({ root });
          return { data: await activeSession.continue({ maxSteps }) };
        }
      }
    ]
  });
}

export default createEnvironment;
