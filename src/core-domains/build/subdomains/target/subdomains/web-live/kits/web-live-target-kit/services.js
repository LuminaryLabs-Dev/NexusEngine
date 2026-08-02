import { writeFile } from "node:fs/promises";
import path from "node:path";

import { defineBuildTargetProvider } from "../../../../kits/target-registry-kit/services.js";
import {
  findWebEntry,
  materializeProjectFiles,
  webPlan,
  writeStableJson
} from "../../../../web-target-helpers.js";

function liveServiceWorker() {
  return `const CACHE = "nexusengine-live-v1";
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

export function createWebLiveTargetProvider() {
  return defineBuildTargetProvider({
    id: "web-live",
    label: "Web Live",
    environments: ["browser", "node-build"],
    capabilities: ["content-hash-cache", "service-worker", "verified-esm"],
    plan(context) {
      return webPlan(context, "web-live");
    },
    async execute(context) {
      if (context.targetPlan.status !== "ready") {
        return { ok: false, status: "blocked", errors: context.targetPlan.errors };
      }
      await materializeProjectFiles(context.projectSource, context.stage);
      const sourceFiles = context.projectSource.files.map(({ path: filePath, integrity, size }) => ({ path: filePath, integrity, size }));
      await writeStableJson(path.join(context.stage, "nexusengine-live-source.json"), {
        schema: "nexusengine.web-live-source/1",
        planId: context.plan.id,
        entry: context.targetPlan.entry,
        cache: "content-hash",
        files: sourceFiles
      });
      await writeFile(path.join(context.stage, "nexusengine-live-sw.mjs"), liveServiceWorker());
      await writeFile(path.join(context.stage, "nexusengine-live-loader.mjs"), liveLoader(context.targetPlan.entry));
      const launcher = context.projectSource.files.some((file) => file.path === "index.html")
        ? "nexusengine-live.html"
        : "index.html";
      await writeFile(path.join(context.stage, launcher), `<!doctype html>\n<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>NexusEngine Live</title></head><body><script type="module" src="./nexusengine-live-loader.mjs"></script></body></html>\n`);
      return { ok: true, status: "built", entry: launcher };
    }
  });
}

export default createWebLiveTargetProvider;
