function requireFunction(value, label) {
  if (typeof value !== "function") throw new TypeError(`${label} must be a function.`);
  return value;
}

function flipPixels(source, size) {
  const output = new Uint8ClampedArray(source.length);
  const row = size * 4;
  for (let y = 0; y < size; y += 1) {
    output.set(source.subarray((size - 1 - y) * row, (size - y) * row), y * row);
  }
  return output;
}

function defaultEncodeAtlas({ pixels, width, height, document = globalThis.document }) {
  if (!document?.createElement) throw new Error("Three capture atlas encoding requires a document or encodeAtlas option.");
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not create a 2D atlas encoding context.");
  const image = context.createImageData(width, height);
  image.data.set(pixels);
  context.putImageData(image, 0, 0);
  return { assetId: canvas.toDataURL("image/png"), kind: "image-data-url", metadata: { width, height, mimeType: "image/png" } };
}

export function createThreeObjectCaptureProvider(options = {}) {
  const THREE = options.THREE;
  if (!THREE) throw new TypeError("createThreeObjectCaptureProvider requires THREE.");
  const renderer = options.renderer;
  if (!renderer?.setRenderTarget || !renderer?.render || !renderer?.readRenderTargetPixels) {
    throw new TypeError("createThreeObjectCaptureProvider requires a WebGLRenderer-compatible renderer.");
  }
  const resolveSubject = requireFunction(options.resolveSubject, "Three capture resolveSubject");
  const encodeAtlas = options.encodeAtlas ?? defaultEncodeAtlas;
  const cancelled = new Set();
  let engine = null;
  let world = null;

  async function capture(request, context = {}) {
    const frameSize = request.output.frameSize;
    const azimuthCount = request.viewSet.azimuthCount;
    const elevations = request.viewSet.elevations;
    const columns = azimuthCount;
    const rows = elevations.length;
    const atlasWidth = columns * frameSize;
    const atlasHeight = rows * frameSize;
    const atlasPixels = new Uint8ClampedArray(atlasWidth * atlasHeight * 4);
    const subjectSource = await resolveSubject(request.subject, { request, engine, world, THREE });
    if (!subjectSource?.isObject3D) throw new TypeError("Three capture resolveSubject() must return a THREE.Object3D.");
    const subject = subjectSource.clone(true);
    const scene = new THREE.Scene();
    scene.background = null;
    scene.add(subject);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, options.hemisphereIntensity ?? 1.5));
    const key = new THREE.DirectionalLight(0xffffff, options.keyIntensity ?? 2.1);
    key.position.set(4, 7, 5);
    scene.add(key);

    subject.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(subject);
    if (bounds.isEmpty()) throw new Error(`Capture subject ${request.subject.objectId} has empty bounds.`);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const groundingY = request.framing.preserveGrounding ? bounds.min.y : center.y;
    subject.position.x -= center.x;
    subject.position.z -= center.z;
    subject.position.y -= groundingY;
    subject.updateMatrixWorld(true);

    const target = new THREE.Vector3(0, Math.max(0, size.y * 0.5), 0);
    const camera = new THREE.PerspectiveCamera(options.fov ?? 32, 1, 0.01, 10000);
    const padded = Math.max(size.x, size.y, size.z) * (1 + request.framing.padding * 2);
    const distance = Math.max(0.1, padded / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) * 0.5)));
    camera.near = Math.max(0.01, distance - padded * 2);
    camera.far = distance + padded * 3;
    camera.updateProjectionMatrix();

    const targetTexture = new THREE.WebGLRenderTarget(frameSize, frameSize, {
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
      depthBuffer: true,
      stencilBuffer: false
    });
    const oldTarget = renderer.getRenderTarget?.() ?? null;
    const oldAutoClear = renderer.autoClear;
    const oldAlpha = renderer.getClearAlpha?.() ?? 1;
    const oldColor = renderer.getClearColor?.(new THREE.Color()) ?? new THREE.Color(0x000000);
    renderer.autoClear = true;
    renderer.setClearColor(0x000000, 0);

    const frames = [];
    try {
      const total = azimuthCount * rows;
      let completed = 0;
      for (let row = 0; row < rows; row += 1) {
        const elevation = elevations[row];
        const elevationRadians = THREE.MathUtils.degToRad(elevation);
        for (let column = 0; column < columns; column += 1) {
          if (cancelled.has(context.jobId) || context.isCancelled?.()) throw Object.assign(new Error("Three object capture cancelled."), { code: "capture.cancelled" });
          const azimuthDegrees = column * (360 / azimuthCount);
          const azimuth = THREE.MathUtils.degToRad(azimuthDegrees);
          const horizontalDistance = Math.cos(elevationRadians) * distance;
          camera.position.set(
            Math.sin(azimuth) * horizontalDistance,
            target.y + Math.sin(elevationRadians) * distance,
            Math.cos(azimuth) * horizontalDistance
          );
          camera.lookAt(target);
          camera.updateMatrixWorld(true);
          renderer.setRenderTarget(targetTexture);
          renderer.clear(true, true, true);
          renderer.render(scene, camera);
          const raw = new Uint8Array(frameSize * frameSize * 4);
          renderer.readRenderTargetPixels(targetTexture, 0, 0, frameSize, frameSize, raw);
          const pixels = flipPixels(raw, frameSize);
          const targetX = column * frameSize;
          const targetY = row * frameSize;
          for (let y = 0; y < frameSize; y += 1) {
            const sourceOffset = y * frameSize * 4;
            const targetOffset = ((targetY + y) * atlasWidth + targetX) * 4;
            atlasPixels.set(pixels.subarray(sourceOffset, sourceOffset + frameSize * 4), targetOffset);
          }
          frames.push({ frameIndex: completed, azimuthDegrees, elevationDegrees: elevation, atlasCell: [column, row] });
          completed += 1;
          context.updateProgress?.(completed, total, `Captured tree view ${completed}/${total}`);
        }
      }

      const encoded = await encodeAtlas({
        pixels: atlasPixels,
        width: atlasWidth,
        height: atlasHeight,
        frameSize,
        columns,
        rows,
        request,
        document: options.document
      });
      const reference = typeof encoded === "string"
        ? { assetId: encoded, kind: "image-data-url", metadata: { width: atlasWidth, height: atlasHeight } }
        : encoded;
      const observations = Object.fromEntries(request.observations.map((name) => [
        name,
        {
          ...reference,
          metadata: { ...(reference.metadata ?? {}), observation: name, sharedColorAtlas: !["color", "opacity"].includes(name) }
        }
      ]));
      return {
        id: `${request.id}:three-result`,
        observations,
        frames,
        metadata: {
          provider: options.id ?? "three-object-capture",
          atlas: { width: atlasWidth, height: atlasHeight, frameSize, columns, rows },
          bounds: { size: size.toArray(), center: center.toArray() }
        }
      };
    } finally {
      renderer.setRenderTarget(oldTarget);
      renderer.setClearColor(oldColor, oldAlpha);
      renderer.autoClear = oldAutoClear;
      targetTexture.dispose();
      scene.remove(subject);
      cancelled.delete(context.jobId);
      options.disposeSubject?.(subject, { request });
    }
  }

  return Object.freeze({
    id: options.id ?? "three-object-capture",
    version: options.version ?? "0.1.0",
    metadata: { renderer: "three", output: "portable-atlas", ...(options.metadata ?? {}) },
    initialize(context = {}) {
      engine = context.engine ?? null;
      world = context.world ?? null;
    },
    capture,
    cancel(jobId) {
      cancelled.add(String(jobId));
      return true;
    },
    dispose() {
      cancelled.clear();
      engine = null;
      world = null;
    }
  });
}

export default createThreeObjectCaptureProvider;
