import {
  mkdir,
  readFile,
  writeFile,
  realpath,
  readdir,
} from "node:fs/promises";
import path from "node:path";
import {
  contentIntegrity,
  stableJson,
  assertInside,
} from "../../../../contracts.js";
import { defineBuildTargetProvider } from "../../../kits/target-registry-kit/services.js";
import { nativeBindings, moduleFacade } from "./bindings.js";

function rustToolchain(config) {
  return ["rustc", "cargo"].map((command) => {
    const record = config.toolchainDiscovery.inspect(command);
    if (!record.available)
      throw new Error(`Required host compiler is unavailable: ${command}`);
    return record;
  });
}
async function nodeToolchain(config) {
  const prefix = await realpath(
    config.nodePrefix ??
      process.env.NEXUS_NODE_PREFIX ??
      path.resolve(path.dirname(await realpath(process.execPath)), ".."),
  );
  const libraries = await readdir(path.join(prefix, "lib"));
  const candidate =
    libraries.find((name) => /^libnode\.\d+\.dylib$/.test(name)) ??
    libraries.find((name) => /^libnode\.so(?:\.\d+)*$/.test(name));
  if (!candidate)
    throw new Error(
      "Embedded Node shared library is unavailable; set NEXUS_NODE_PREFIX.",
    );
  const library = await realpath(path.join(prefix, "lib", candidate));
  const header = path.join(prefix, "include/node/node.h");
  const compiler = rustToolchain(config);
  const cpp = config.toolchainDiscovery.selectCpp({
    source:
      "#include <node_api.h>\nnamespace node { int Start(int,char**); }\nint main(int argc,char** argv) {return node::Start(argc,argv);}",
    includeDirectories: [path.join(prefix, "include/node")],
  });
  if (!cpp.ok)
    throw new Error(
      `C++ toolchain cannot compile the required Node interface: ${JSON.stringify(cpp.attempts)}`,
    );
  return {
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    prefix,
    library,
    libraryIntegrity: contentIntegrity(await readFile(library)),
    headerIntegrity: contentIntegrity(await readFile(header)),
    compiler,
    cpp,
  };
}

export function createHostNativeTargetProvider(config = {}) {
  const processExecution = config.processExecution,
    rustLowering = config.rustLowering,
    runtimeAbi = config.runtimeAbi;
  return defineBuildTargetProvider({
    id: "host-native",
    label: "Native host contract proof",
    environments: ["node-build", "local-host"],
    capabilities: ["rust", "embedded-node", "host-proof-only"],
    async plan(context) {
      const requirements = [...context.executionResolution.requirements];
      let toolchain = null;
      const nativeOnly = context.executionResolution.mode === "native";
      if (!["darwin", "linux"].includes(process.platform))
        requirements.push({
          code: "host-platform-unproven",
          platform: process.platform,
        });
      try {
        toolchain = nativeOnly
          ? {
              platform: process.platform,
              arch: process.arch,
              compiler: rustToolchain(config),
            }
          : await nodeToolchain(config);
      } catch (error) {
        requirements.push({
          code: "host-toolchain-unavailable",
          message: error.message,
        });
      }
      const entry =
        context.targetEntry ??
        JSON.parse(
          context.projectSource.files
            .find((file) => file.path === "package.json")
            ?.bytes.toString() ?? "{}",
        ).module;
      const packageJson = JSON.parse(
        context.projectSource.files
          .find((file) => file.path === "package.json")
          ?.bytes.toString() ?? "{}",
      );
      const assets = packageJson.nexusengineBuild?.assets ?? [];
      const nativeEntry = packageJson.nexusengineBuild?.nativeEntry ?? null;
      if (
        !nativeOnly &&
        context.moduleGraph.modules.some((module) =>
          /\.(?:[mc]?ts|tsx|jsx)$/.test(module.path),
        )
      )
        requirements.push({
          code: "node-source-language-unproven",
          message:
            "Bundle or transpile TypeScript/JSX before selecting the Node host.",
        });
      if (nativeOnly) {
        const definition = context.rustLowering.exports.find(
          (record) =>
            record.modulePath === entry && record.name === nativeEntry?.export,
        );
        if (
          !definition ||
          !Array.isArray(nativeEntry?.arguments) ||
          nativeEntry.arguments.length !== definition.parameters.length ||
          !nativeEntry.arguments.every(Number.isFinite)
        )
          requirements.push({ code: "numeric-native-entry-required" });
      }
      if (
        !Array.isArray(assets) ||
        assets.some(
          (asset) =>
            typeof asset !== "string" ||
            path.isAbsolute(asset) ||
            asset.split("/").includes("..") ||
            !context.projectSource.files.some(
              (file) => file.path === asset && !file.source,
            ),
        )
      )
        requirements.push({ code: "invalid-runtime-assets" });
      if (
        !entry ||
        !context.moduleGraph.modules.some((module) => module.path === entry)
      )
        requirements.push({ code: "explicit-module-entry-required" });
      requirements.push(
        ...context.irValidation.errors.filter(
          (error) => error.code !== "module-cycle",
        ),
      );
      for (const module of context.moduleGraph.modules)
        for (const edge of module.imports)
          if (
            edge.resolved &&
            !context.moduleGraph.modules.some(
              (candidate) => candidate.path === edge.resolved,
            )
          )
            requirements.push({
              code: "non-source-runtime-resource-unproven",
              path: edge.resolved,
            });
      if (
        context.rustLowering.exports.some(
          (record) => record.parameters.length > 8,
        )
      )
        requirements.push({ code: "native-contract-arity-unsupported" });
      return {
        status: requirements.length ? "blocked" : "ready",
        requirements,
        entry,
        assets,
        nativeEntry,
        toolchain,
        contract: runtimeAbi?.numericContract(context.rustLowering.exports),
        redistributable: false,
        executionMode: context.executionResolution.mode,
      };
    },
    async execute(context) {
      const { stage, targetPlan } = context;
      if (
        targetPlan.status !== "ready" ||
        !["native", "node", "hybrid"].includes(context.executionResolution.mode)
      )
        throw new Error("The native host requires a ready, supported plan.");
      if (!processExecution || !rustLowering)
        throw new Error("Native host requires compiler and process services.");
      const nativeOnly = context.executionResolution.mode === "native";
      const current = nativeOnly
        ? {
            platform: process.platform,
            arch: process.arch,
            compiler: rustToolchain(config),
          }
        : await nodeToolchain(config);
      if (stableJson(current) !== stableJson(targetPlan.toolchain))
        throw new Error("Host toolchain changed after plan approval.");
      const toolchain = {
        id: `toolchain:host-native:${contentIntegrity(stableJson(current)).slice("sha256:".length)}`,
        ...current,
      };
      const run = async (command, args, options = {}) => {
        const result = await processExecution.run(command, args, {
          cwd: stage,
          signal: context.signal,
          ...options,
        });
        if (!result.ok)
          throw new Error(`${command}: ${result.error ?? result.stderr}`);
        return result;
      };
      const nativePaths = new Set(
        context.executionResolution.groups
          .filter((group) => group.mode === "native")
          .flatMap((group) => group.modules),
      );
      const nativeClassification = {
        ...context.classification,
        modules: context.classification.modules.filter((module) =>
          nativePaths.has(module.modulePath),
        ),
      };
      const lowering = rustLowering.lower(
        {
          ...context.executionIr,
          operations: context.executionIr.operations.map((operation) => ({
            ...operation,
            nativeFunctions: nativePaths.has(operation.modulePath)
              ? operation.nativeFunctions
              : [],
          })),
        },
        nativeClassification,
      );
      if (
        nativePaths.size &&
        (!lowering.semanticParity || !lowering.exports.length)
      )
        throw new Error("Required native operations were not lowered.");
      if (nativeOnly) {
        const generated = await rustLowering.write(stage, lowering);
        const definition = lowering.exports.find(
          (record) =>
            record.modulePath === targetPlan.entry &&
            record.name === targetPlan.nativeEntry.export,
        );
        await writeFile(
          path.join(generated, "src/main.rs"),
          `fn main() { let value = nexus_generated_runtime::${definition.symbol}(${targetPlan.nativeEntry.arguments.map((value) => (Object.is(value, -0) ? "-0.0_f64" : `${value}_f64`)).join(",")}); if !value.is_finite() { panic!("Nonfinite native result is outside this entry contract"); } println!("{value}"); }\n`,
        );
        await run("cargo", ["generate-lockfile", "--offline"], {
          cwd: generated,
        });
        await run(
          "cargo",
          [
            "build",
            "--release",
            "--offline",
            "--locked",
            "--target-dir",
            path.join(generated, "target"),
          ],
          { cwd: generated },
        );
        const binary = path.join(stage, "nexus-native");
        const { copyFile } = await import("node:fs/promises");
        await copyFile(
          path.join(generated, "target/release/nexus_generated_runtime"),
          binary,
        );
        const execution = await run(binary, [], { timeoutMs: 15000 });
        await writeFile(
          path.join(stage, "execution.json"),
          JSON.stringify(execution, null, 2) + "\n",
        );
        return {
          ok: true,
          toolchain,
          executionMode: "native",
          executionResolution: context.executionResolution,
          proof: "native-host-application-executed",
          redistributable: false,
          entry: "nexus-native",
          execution,
          runtimes: [],
          packageValidation: {
            ok: true,
            scope: "host-only",
            deviceValidated: false,
          },
        };
      }
      const app = path.join(stage, "app");
      await mkdir(app, { recursive: true });
      const reachable = new Set(
        context.moduleGraph.modules.map((module) => module.path),
      );
      for (const file of context.projectSource.files.filter(
        (file) =>
          reachable.has(file.path) ||
          targetPlan.assets.includes(file.path) ||
          file.path === "package.json",
      )) {
        const destination = assertInside(
          app,
          path.join(app, file.path),
          "Host module",
        );
        await mkdir(path.dirname(destination), { recursive: true });
        let bytes = file.bytes;
        if (nativePaths.has(file.path))
          bytes = moduleFacade(
            file.path,
            lowering.exports,
            path
              .relative(
                path.dirname(destination),
                path.join(stage, "nexus_native.node"),
              )
              .split(path.sep)
              .join("/"),
          );
        await writeFile(destination, bytes);
      }
      const host = path.join(stage, "nexus-host");
      await writeFile(
        path.join(stage, "host.cc"),
        await readFile(new URL("./native/host.cc", import.meta.url)),
      );
      const include = path.join(current.prefix, "include/node");
      await run(current.cpp.command, [
        "-std=c++20",
        "-I",
        include,
        "host.cc",
        current.library,
        `-Wl,-rpath,${path.dirname(current.library)}`,
        "-o",
        host,
      ]);
      if (nativePaths.size) {
        const generated = await rustLowering.write(stage, lowering);
        await run("cargo", ["generate-lockfile", "--offline"], {
          cwd: generated,
        });
        await run(
          "cargo",
          [
            "build",
            "--release",
            "--offline",
            "--locked",
            "--target-dir",
            path.join(generated, "target"),
          ],
          { cwd: generated },
        );
        const libraryName =
          process.platform === "darwin"
            ? "libnexus_generated_runtime.dylib"
            : "libnexus_generated_runtime.so";
        await writeFile(
          path.join(stage, libraryName),
          await readFile(path.join(generated, "target/release", libraryName)),
        );
        await writeFile(
          path.join(stage, "bindings.cc"),
          nativeBindings(lowering.exports),
        );
        const flags =
          process.platform === "darwin"
            ? ["-undefined", "dynamic_lookup", "-Wl,-rpath,@loader_path"]
            : ["-fPIC", "-Wl,-rpath,$ORIGIN"];
        await run(current.cpp.command, [
          "-std=c++20",
          "-shared",
          ...flags,
          "-I",
          include,
          "bindings.cc",
          "-L",
          stage,
          "-lnexus_generated_runtime",
          "-o",
          "nexus_native.node",
        ]);
      }
      const execution = await run(host, [path.join(app, targetPlan.entry)], {
        timeoutMs: 15000,
      });
      const contract = runtimeAbi.numericContract(lowering.exports);
      await writeFile(
        path.join(stage, "contract.json"),
        JSON.stringify(contract, null, 2) + "\n",
      );
      await writeFile(
        path.join(stage, "execution.json"),
        JSON.stringify(execution, null, 2) + "\n",
      );
      return {
        ok: true,
        toolchain,
        executionMode: context.executionResolution.mode,
        executionResolution: context.executionResolution,
        proof: "host-application-executed",
        redistributable: false,
        entry: "nexus-host",
        arguments: [`app/${targetPlan.entry}`],
        execution,
        contract,
        hostRequirements: {
          nodeLibrary: current.library,
          nodeLibraryIntegrity: current.libraryIntegrity,
          platform: current.platform,
          arch: current.arch,
        },
        packageValidation: {
          ok: true,
          scope: "host-only",
          deviceValidated: false,
        },
      };
    },
    async validate({ result }) {
      return {
        ok: result.execution?.ok === true,
        scope: "host-application-execution",
        deviceValidated: false,
        redistributable: false,
      };
    },
  });
}
export default createHostNativeTargetProvider;
