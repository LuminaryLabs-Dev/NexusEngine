export function createThreePresentationOutputAdapter() {
  let lastDescriptor = null;
  return Object.freeze({
    apply({ renderer, camera, descriptor }) {
      if (!renderer || !camera || !descriptor?.surface || !descriptor?.frame) {
        throw new TypeError("Three presentation output adapter requires renderer, camera, and descriptor.");
      }
      const width = Math.max(0, descriptor.surface.cssWidth);
      const height = Math.max(0, descriptor.surface.cssHeight);
      const viewport = descriptor.frame.viewport;
      const glY = height - viewport.y - viewport.height;
      renderer.setPixelRatio?.(descriptor.render.pixelRatio);
      renderer.setSize?.(width, height, false);
      renderer.setScissorTest?.(false);
      renderer.setViewport?.(0, 0, width, height);
      renderer.setClearColor?.(descriptor.frame.barColor, 1);
      renderer.clear?.(true, true, true);
      renderer.setViewport?.(viewport.x, glY, viewport.width, viewport.height);
      renderer.setScissor?.(viewport.x, glY, viewport.width, viewport.height);
      renderer.setScissorTest?.(!["native", "stretch"].includes(descriptor.frame.mode));
      camera.aspect = descriptor.cameraAspect;
      camera.updateProjectionMatrix?.();
      lastDescriptor = structuredClone(descriptor);
      return structuredClone(descriptor);
    },
    getDescriptor: () => structuredClone(lastDescriptor),
    reset() { lastDescriptor = null; }
  });
}
