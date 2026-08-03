import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export function createOpenXrRenderService() {
  return Object.freeze({
    async writeNative(root) {
      await mkdir(root, { recursive: true });
      const name = "nexus_openxr_render.c";
      await writeFile(path.join(root, name), await readFile(new URL(`./native/${name}`, import.meta.url)));
      return Object.freeze({ root, files: Object.freeze([name]) });
    },
    createFrameSubmission(input = {}) {
      const views = [...(input.views ?? [])].map((view, index) => Object.freeze({
        index,
        pose: view.pose,
        fov: view.fov,
        swapchainImage: Number(view.swapchainImage)
      }));
      if (views.length !== 2) throw new TypeError("OpenXR primary stereo submission requires exactly two views.");
      return Object.freeze({
        schema: "nexusengine.openxr-frame-submission/1",
        frame: Number(input.frame),
        displayTime: Number(input.displayTime),
        blendMode: String(input.blendMode ?? "opaque"),
        views: Object.freeze(views)
      });
    }
  });
}

export default createOpenXrRenderService;
