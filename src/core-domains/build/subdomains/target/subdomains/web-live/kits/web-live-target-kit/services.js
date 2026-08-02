import { writeFile } from "node:fs/promises";
import path from "node:path";

import { stableValue } from "../../../../../../contracts.js";
import { defineBuildTargetProvider } from "../../../../kits/target-registry-kit/services.js";
import { webPlan } from "../../../../web-target-helpers.js";

function liveServiceWorker(closureHash) {
  return `const CACHE = ${JSON.stringify(`nexusengine-live-${closureHash.slice("sha256:".length, 12)}`)};
self.addEventListener("install", (event) => event.waitUntil((async () => {
  const manifest = await (await fetch("./nexusengine-live-source.json", { cache: "no-store" })).json();
  const cache = await caches.open(CACHE);
  for (const file of manifest.files) {
    const response = await fetch(new URL(file.path, self.registration.scope), { cache: "no-store" });
    if (!response.ok) throw new Error("Missing live source: " + file.path);
    const bytes = await response.clone().arrayBuffer();
    const digest = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))].map((value) => value.toString(16).padStart(2, "0")).join("");
    if ("sha256:" + digest !== file.integrity) throw new Error("Live source integrity mismatch: " + file.path);
    await cache.put(new URL(file.path, self.registration.scope), response);
  }
  await self.skipWaiting();
})()));
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (event) => event.respondWith((async () => {
  const cached = await caches.match(event.request);
  return cached || fetch(event.request);
})()));
`;
}

function liveLoader(entry) {
  return `const registration = await navigator.serviceWorker.register("./nexusengine-live-sw.mjs", { type: "module", scope: "./" });
await navigator.serviceWorker.ready;
if (!navigator.serviceWorker.controller) {
  await new Promise((resolve) => navigator.serviceWorker.addEventListener("controllerchange", resolve, { once: true }));
}
await import(${JSON.stringify(`./${entry}`)});
`;
}

export function createWebLiveTargetProvider(config = {}) {
  const linker = config.linker;
  return defineBuildTargetProvider({
    id: "web-live",
    label: "Web Live",
    environments: ["browser", "node-build"],
    capabilities: ["content-hash-cache", "service-worker", "verified-esm"],
    plan(context) {
      return webPlan(context, "web-live", linker);
    },
    async execute(context) {
      if (context.targetPlan.status !== "ready") {
        return { ok: false, status: "blocked", errors: context.targetPlan.errors };
      }
      const closure = await linker.link({
        ...context,
        entry: context.targetPlan.entry,
        sourceRecords: context.sourceRecords
      }, { mode: "live", loader: "nexusengine-live-loader.mjs" });
      await writeFile(path.join(context.stage, "nexusengine-live-loader.mjs"), liveLoader(closure.entryModule));
      await writeFile(path.join(context.stage, "nexusengine-live-sw.mjs"), liveServiceWorker(closure.closureHash));
      const sourceFiles = (await linker.collectFiles(context.stage)).filter((file) => ![
        "nexusengine-live-source.json",
        "nexusengine-live-sw.mjs"
      ].includes(file.path));
      await writeFile(path.join(context.stage, "nexusengine-live-source.json"), `${JSON.stringify(stableValue({
        schema: "nexusengine.web-live-source/1",
        planId: context.plan.id,
        entry: closure.entryModule,
        closureHash: closure.closureHash,
        cache: "content-hash",
        files: sourceFiles
      }), null, 2)}\n`);
      return {
        ok: true,
        status: "built",
        proof: "closure-proven",
        entry: "index.html",
        closureHash: closure.closureHash,
        sourceRecords: closure.sourceRecords,
        toolchain: closure.toolchain
      };
    }
  });
}

export default createWebLiveTargetProvider;
