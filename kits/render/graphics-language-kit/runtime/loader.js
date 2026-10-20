const node = typeof process !== "undefined" && Boolean(process.versions?.node);
async function bytes(url) {
  if (node && url.protocol === "file:") return new Uint8Array(await (await import("node:fs/promises")).readFile(url));
  const r = await fetch(url); if (!r.ok) throw Error(`NexusGL asset ${url}: HTTP ${r.status}`); return new Uint8Array(await r.arrayBuffer());
}
async function digest(value) {
  const crypto = globalThis.crypto ?? (await import("node:crypto")).webcrypto;
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", value))].map(v => v.toString(16).padStart(2, "0")).join("");
}
export async function loadNexusGLRuntime(backend = "auto", { maximumMemoryBytes = 144 * 1024 ** 2 } = {}) {
  const base = new URL("./artifacts/", import.meta.url);
  const manifest = JSON.parse(new TextDecoder().decode(await bytes(new URL("manifest.json", base))));
  const native = node && manifest.files.some(f => f.path === `nexusgl-${process.platform}-${process.arch}.node`);
  if (backend === "auto") backend = native ? "native" : "wasm";
  if (!["native", "wasm"].includes(backend) || (backend === "native" && !native)) throw Error(`Unsupported NexusGL backend: ${backend}`);
  async function checked(name) {
    const record = manifest.files.find(f => f.path === name); if (!record) throw Error(`Missing NexusGL artifact: ${name}`);
    const data = await bytes(new URL(name, base)); if (data.length !== record.bytes || await digest(data) !== record.sha256) throw Error(`NexusGL artifact integrity mismatch: ${name}`); return data;
  }
  if (backend === "native") {
    const name = `nexusgl-${process.platform}-${process.arch}.node`; await checked(name);
    const { createRequire } = await import("node:module");
    const { fileURLToPath } = await import("node:url");
    return { backend, ...createRequire(import.meta.url)(fileURLToPath(new URL(name, base))) };
  }
  await checked("nexusgl.mjs"); const wasmBinary = await checked("nexusgl.wasm");
  const { default: create } = await import(new URL("nexusgl.mjs", base).href);
  if (!Number.isSafeInteger(maximumMemoryBytes) || maximumMemoryBytes < 16 * 1024 ** 2 || maximumMemoryBytes > 512 * 1024 ** 2) throw RangeError('WASM heap reservation must be 16..512 MiB');
  const m = await create({ wasmBinary, wasmMemory: new WebAssembly.Memory({ initial: 256, maximum: Math.floor(maximumMemoryBytes / 65536) }) });
  const check = value => { if (!value) throw Error(m.UTF8ToString(m._nx_last_error()) || "NexusGL allocation failed"); return value; };
  const memory = (array, invoke) => {
    const p = check(m._malloc(array.byteLength || 8));
    try { m.HEAPU8.set(new Uint8Array(array.buffer, array.byteOffset, array.byteLength), p); return invoke(p); } finally { m._free(p); }
  };
  return {
    backend,
    memoryBytes: () => m.HEAPU8.byteLength,
    defaults(kind) { const result = new Float64Array(kind === 0 ? 21 : kind === 1 ? 45 : 9); return memory(result, p => { m._ng_defaults(kind, p); result.set(new Float64Array(m.HEAPU8.buffer, p, result.length)); return result; }); },
    deviceCreate: () => check(m._nx_device_create()), deviceDestroy: d => check(m._nx_device_destroy(d)),
    sceneCreate: d => check(m._nx_scene_create(d)), sceneDestroy: (d, s) => check(m._nx_scene_destroy(d, s)),
    material: (d, s, values, color, normal) => memory(values, p => check(m._ng_material(d, s, p, color, normal))),
    view: (d, s, values) => memory(values, p => check(m._ng_view(d, s, p))),
    light: (d, s, values) => memory(values, p => check(m._ng_light(d, s, p))),
    texture: (d, s, w, h, rgba, filter, normal) => memory(rgba, p => check(m._nx_texture_create(d, s, w, h, p, w * 4, filter, normal))),
    draw: (d, s, values, count, color, material, casts, two) => memory(values, p => check(m._ng_draw(d, s, p, count, color, material, casts, two))),
    background: (d, s, ...rgba) => check(m._nx_scene_set_background(d, s, ...rgba)),
    limits: (d, amount, fragments) => check(m._nx_device_set_limits(d, BigInt(amount), BigInt(fragments))),
    clearGeometry: (d, s) => check(m._nx_scene_clear_geometry(d, s)),
    render(d, s, width, height, quality) {
      const frame = check(m._ng_render(d, s, width, height, quality)); const p = m._ng_pixels(frame);
      return new Uint8ClampedArray(m.HEAPU8.subarray(p, p + width * height * 4));
    }
  };
}

export async function loadNativeWindow() {
  if (!node || process.platform !== 'darwin' || process.arch !== 'arm64') throw Error('Native window adapter supports macOS arm64; use a compatible host adapter');
  const base = new URL('./artifacts/', import.meta.url);
  const manifest = JSON.parse(new TextDecoder().decode(await bytes(new URL('manifest.json', base))));
  const name = 'nexusgl-window-darwin-arm64.node', entry = manifest.files.find(f => f.path === name);
  const data = await bytes(new URL(name, base));
  if (!entry || entry.bytes !== data.length || entry.sha256 !== await digest(data)) throw Error('Native window artifact integrity mismatch');
  const [{ createRequire }, { fileURLToPath }] = await Promise.all([import('node:module'), import('node:url')]);
  return createRequire(import.meta.url)(fileURLToPath(new URL(name, base)));
}
