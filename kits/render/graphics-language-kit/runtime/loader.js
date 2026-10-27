const node = typeof process !== "undefined" && Boolean(process.versions?.node);
async function bytes(url) {
  if (node && url.protocol === "file:") return new Uint8Array(await (await import("node:fs/promises")).readFile(url));
  const r = await fetch(url); if (!r.ok) throw Error(`NexusGL asset ${url}: HTTP ${r.status}`); return new Uint8Array(await r.arrayBuffer());
}
async function digest(value) {
  const crypto = globalThis.crypto ?? (await import("node:crypto")).webcrypto;
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", value))].map(v => v.toString(16).padStart(2, "0")).join("");
}
const statisticFields=['abiVersion','sceneRevision','meshUploads','uploadedBytes','copiedBytes','validatedVertices','transformedVertices','committedTransactions','abortedTransactions','residentBytes','stagingBytes','renderAllocations','shadowCacheHits','shadowCacheMisses','shadowCacheBypasses','shadowCacheBytes','fragmentCapacity'];
const statistics=values=>Object.fromEntries(statisticFields.map((key,i)=>[key,values[i]]));
function validateManifest(manifest) {
  if(manifest.schema!=='nexusengine.nexusgl-artifacts/2'||manifest.abi!==2||!manifest.targets||!Array.isArray(manifest.files))throw Error('Unsupported NexusGL runtime manifest/ABI; rebuild matching native and WASM artifacts');
  const expected=['nexusgl.mjs','nexusgl.wasm','nexusgl-darwin-arm64.node','nexusgl-window-darwin-arm64.node'];
  if(manifest.files.length!==expected.length||expected.some(name=>manifest.files.filter(f=>f.path===name).length!==1))throw Error('Incomplete NexusGL runtime artifact inventory');
  const features=['transactions','resident-meshes','instances','render-into','diagnostics'];
  if(!Array.isArray(manifest.capabilities)||manifest.capabilities.length!==features.length||new Set(manifest.capabilities).size!==features.length)throw Error('Invalid NexusGL runtime capabilities');
  for(const feature of features)if(!manifest.capabilities.includes(feature))throw Error(`Missing NexusGL runtime capability: ${feature}`);
  for(const entry of manifest.files){const expectedTarget=entry.path.endsWith('.wasm')||entry.path.endsWith('.mjs')?'wasm':entry.path.includes('-window-')?'window':'native';const target=manifest.targets[entry.target];if(entry.target!==expectedTarget||!target||!entry.sourceDigest||entry.sourceDigest!==target.sourceDigest||JSON.stringify(entry.build?.options)!==JSON.stringify(target.options))throw Error(`Stale or mixed NexusGL source/ABI identity: ${entry.path}`);}
}
export async function loadNexusGLRuntime(backend = "auto", { maximumMemoryBytes = 144 * 1024 ** 2 } = {}) {
  const base = new URL("./artifacts/", import.meta.url);
  const manifest = JSON.parse(new TextDecoder().decode(await bytes(new URL("manifest.json", base))));
  validateManifest(manifest);
  const native = node && manifest.files.some(f => f.path === `nexusgl-${process.platform}-${process.arch}.node`);
  if (backend === "auto") backend = native ? "native" : "wasm";
  if (!["native", "wasm"].includes(backend) || (backend === "native" && !native)) throw Error(`Unsupported NexusGL backend: ${backend}`);
  async function checked(name) {
    const record = manifest.files.find(f => f.path === name); if (!record) throw Error(`Missing NexusGL artifact: ${name}`);
    const data = await bytes(new URL(name, base)); if (data.length !== record.bytes || await digest(data) !== record.sha256) throw Error(`NexusGL artifact integrity mismatch: ${name}`); return data;
  }
  if (backend === "native") {
    const name = `nexusgl-${process.platform}-${process.arch}.node`; await checked(name);
    const { createRequire } = await import("node:module");const { fileURLToPath } = await import("node:url");
    const api=createRequire(import.meta.url)(fileURLToPath(new URL(name, base)));
    for(const method of ['abi','beginUpdate','commitUpdate','abortUpdate','mesh','instance','instanceOrder','statistics','renderInto'])if(typeof api[method]!=='function')throw Error(`Missing NexusGL ABI2 operation: ${method}`);
    if(api.abi()!==2)throw Error('NexusGL runtime ABI mismatch');
    return {backend,...api,
      mesh:(d,s,h,v,i)=>api.mesh(d,s,h,v,v.length/12,i,i.length),
      instanceOrder:(d,s,handles)=>api.instanceOrder(d,s,new BigUint64Array(handles),handles.length),
      textureResource:(d,s,h,w,height,p,f,n)=>h?api.textureUpdate(d,s,h,w,height,p,f,n):api.texture(d,s,w,height,p,f,n),
      releaseResource:(d,s,kind,h)=>({geometry:api.releaseMesh,material:api.releaseMaterial,texture:api.releaseTexture}[kind])(d,s,h),
      statistics:(d,s)=>statistics(api.statistics(d,s))
    };
  }
  await checked("nexusgl.mjs"); const wasmBinary = await checked("nexusgl.wasm");
  const { default: create } = await import(new URL("nexusgl.mjs", base).href);
  if (!Number.isSafeInteger(maximumMemoryBytes) || maximumMemoryBytes < 16 * 1024 ** 2 || maximumMemoryBytes > 512 * 1024 ** 2) throw RangeError('WASM heap reservation must be 16..512 MiB');
  const m = await create({ wasmBinary, wasmMemory: new WebAssembly.Memory({ initial: 256, maximum: Math.floor(maximumMemoryBytes / 65536) }) });
  if(typeof m._nx_get_abi_version!=='function'||m._nx_get_abi_version()!==2)throw Error('NexusGL runtime ABI mismatch');
  const check = (value,bridge=false) => { if (!value) throw Error(m.UTF8ToString(bridge?m._ng_last_error():m._nx_last_error()) || "NexusGL allocation failed"); return value; };
  // One bounded arena per runtime. Obtain fresh heap views after every call that
  // can grow WASM memory, including rendering and allocation.
  let scratch=0,capacity=0,readbackBytes=0;
  const memory=(arrays,invoke)=>{
    let size=0;const offsets=arrays.map(a=>{size=Math.ceil(size/8)*8;const at=size;size+=a.byteLength;return at;});
    if(size>maximumMemoryBytes/2)throw RangeError('NexusGL upload staging budget exceeded');
    if(size>capacity||!scratch){const target=Math.max(8,size);const next=m._malloc(target);if(!next)throw RangeError('NexusGL staging allocation failed');if(scratch)m._free(scratch);scratch=next;capacity=target;}
    arrays.forEach((a,i)=>m.HEAPU8.set(new Uint8Array(a.buffer,a.byteOffset,a.byteLength),scratch+offsets[i]));
    return invoke(...offsets.map(n=>scratch+n));
  };
  const vector=(v,Type,length)=>{if(!(v instanceof Type)||v.length<length)throw TypeError('Invalid bridge array type or length');return v;};
  const doubles=(v,length)=>{vector(v,Float64Array,length);if(v.some(n=>!Number.isFinite(n)))throw TypeError('Nonfinite bridge array');return v;};
  const one=(a,invoke)=>memory([a],invoke);
  const count=(value,max)=>{if(!Number.isSafeInteger(value)||value<0||value>max)throw TypeError('Invalid bridge element count');return value;};
  const api={
    backend,memoryBytes:()=>m.HEAPU8.byteLength,
    defaults(kind){count(kind,2);const result=new Float64Array(kind===0?21:kind===1?45:9);return one(result,p=>{m._ng_defaults(kind,p);result.set(new Float64Array(m.HEAPU8.buffer,p,result.length));return result;});},
    deviceCreate:()=>check(m._nx_device_create()),deviceDestroy:d=>{if(scratch)m._free(scratch);scratch=capacity=0;return check(m._ng_device_destroy(d));},
    sceneCreate:d=>check(m._nx_scene_create(d)),sceneDestroy:(d,s)=>check(m._nx_scene_destroy(d,s)),
    sceneRevision:(d,s)=>m._nx_scene_revision(d,s),beginUpdate:(d,s,r)=>check(m._nx_scene_begin(d,s,r)),commitUpdate:(d,s)=>check(m._nx_scene_commit(d,s)),abortUpdate:(d,s)=>check(m._nx_scene_abort(d,s)),
    material:(d,s,v,c,n)=>one(doubles(v,21),p=>check(m._ng_material(d,s,p,c,n),true)),
    materialResource:(d,s,h,v,c,n)=>one(doubles(v,21),p=>check(m._ng_material_update(d,s,h,p,c,n),true)),
    view:(d,s,v)=>one(doubles(v,45),p=>check(m._ng_view(d,s,p),true)),light:(d,s,v)=>one(doubles(v,9),p=>check(m._ng_light(d,s,p),true)),
    texture:(d,s,w,h,rgba,f,n)=>one(vector(rgba,Uint8Array,w*h*4),p=>check(m._nx_texture_create(d,s,w,h,p,w*4,f,n))),
    textureResource:(d,s,id,w,h,rgba,f,n)=>one(vector(rgba,Uint8Array,w*h*4),p=>id?(check(m._nx_texture_update(d,s,id,w,h,p,w*4,f,n)),id):check(m._nx_texture_create(d,s,w,h,p,w*4,f,n))),
    mesh:(d,s,h,v,i)=>{doubles(v,0);vector(i,Uint32Array,0);count(v.length/12,v.length);return memory([v,i],(p,indices)=>check(m._ng_mesh(d,s,h,p,v.length/12,indices,i.length),true));},
    instance:(d,s,h,mesh,material,matrix,color,casts,two)=>one(doubles(matrix,16),p=>check(m._ng_instance(d,s,h,mesh,material,p,color,casts,two),true)),
    instanceOrder:(d,s,h)=>one(new BigUint64Array(h),p=>check(m._nx_instance_order(d,s,p,h.length))),
    releaseInstance:(d,s,h)=>check(m._nx_instance_release(d,s,h)),
    releaseResource:(d,s,k,h)=>check(({geometry:m._nx_mesh_release,material:m._nx_material_release,texture:m._nx_texture_release}[k])(d,s,h)),
    draw:(d,s,v,c,color,material,casts,two)=>{doubles(v,0);count(c,v.length/36);return one(v,p=>check(m._ng_draw(d,s,p,c,color,material,casts,two),true));},
    background:(d,s,...rgba)=>check(m._nx_scene_set_background(d,s,...rgba)),
    limits:(d,b,f)=>check(m._nx_device_set_limits(d,BigInt(b),BigInt(f))),shadowCacheLimit:(d,b)=>check(m._nx_device_set_shadow_cache_limit(d,BigInt(b))),
    clearGeometry:(d,s)=>check(m._nx_scene_clear_geometry(d,s)),
    renderInto(d,s,w,h,q,destination){if(!(destination instanceof Uint8ClampedArray)||destination.length!==w*h*4)throw TypeError('Invalid output destination');const frame=check(m._ng_render(d,s,w,h,q),true);const p=m._ng_pixels(frame);destination.set(m.HEAPU8.subarray(p,p+w*h*4));readbackBytes+=destination.byteLength;return true;},
    render(d,s,w,h,q){const pixels=new Uint8ClampedArray(w*h*4);api.renderInto(d,s,w,h,q,pixels);return pixels;},
    statistics(d,s){const a=new Float64Array(17);return one(a,p=>{check(m._ng_statistics(d,s,p),true);a.set(new Float64Array(m.HEAPU8.buffer,p,17));const result=statistics(a);result.copiedBytes+=readbackBytes;result.stagingCapacityBytes=capacity;return result;});}
  };return api;
}

export async function loadNativeWindow() {
  if (!node || process.platform !== 'darwin' || process.arch !== 'arm64') throw Error('Native window adapter supports macOS arm64; use a compatible host adapter');
  const base = new URL('./artifacts/', import.meta.url);
  const manifest = JSON.parse(new TextDecoder().decode(await bytes(new URL('manifest.json', base))));
  validateManifest(manifest);
  const name = 'nexusgl-window-darwin-arm64.node', entry = manifest.files.find(f => f.path === name);
  const data = await bytes(new URL(name, base));
  if (!entry || entry.bytes !== data.length || entry.sha256 !== await digest(data)) throw Error('Native window artifact integrity mismatch');
  const [{ createRequire }, { fileURLToPath }] = await Promise.all([import('node:module'), import('node:url')]);
  return createRequire(import.meta.url)(fileURLToPath(new URL(name, base)));
}
