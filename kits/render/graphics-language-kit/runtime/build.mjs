import { spawnSync } from 'node:child_process';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, relative } from 'node:path';
import { createHash } from 'node:crypto';
const runtime=fileURLToPath(new URL('./',import.meta.url));
const root=resolve(runtime,'../../../..'), source=resolve(runtime,'source');
const sources=['adapters/c_api.cpp','src/math.cpp','src/renderer.cpp','src/render3d.cpp','src/lighting.cpp','src/gaussian.cpp','src/domains/scene/scene_dsk.cpp','src/domains/render/render_dsk.cpp','src/domains/render/kits/cpu_execution.cpp'].map(p=>resolve(source,p));
const hash=data=>createHash('sha256').update(data).digest('hex');
function run(command,args,extra={}) {
  const result=spawnSync(command,args,{stdio:'inherit',cwd:root,env:{...process.env,...extra}});
  if(result.error||result.status!==0)throw Error(`Build failed: ${command}: ${result.error?.message??result.status}`);
}
await mkdir(resolve(runtime,'artifacts'),{recursive:true});
await mkdir(resolve(root,'build/graphics-runtime/tmp'),{recursive:true});
const common=['-std=c++17','-O2','-Wall','-Wextra','-Wpedantic','-fexceptions','-I'+resolve(source,'include'),...sources,resolve(runtime,'bridge.cpp')];
let emscripten;
if(process.argv.includes('--wasm')) {
  const localSDK=resolve(root,'build/graphics-runtime/emsdk');
  const compiler=process.env.EMXX??(existsSync(localSDK)?resolve(localSDK,'upstream/emscripten/em++'):'em++');
  const extra={TMPDIR:resolve(root,'build/graphics-runtime/tmp')};
  if(existsSync(localSDK)) {
    extra.EMSDK_PYTHON=process.env.EMSDK_PYTHON??resolve(localSDK,'python/3.13.3_64bit/bin/python3');
    extra.EM_CACHE=process.env.EM_CACHE??resolve(localSDK,'upstream/emscripten/cache');
  }
  const version=spawnSync(compiler,['--version'],{encoding:'utf8',env:{...process.env,...extra}});
  if(version.error||version.status!==0)throw Error('WASM rebuild requires Emscripten; set EMXX or configure the SDK. Shipped artifacts do not require rebuilding.');
  emscripten=version.stdout.split('\n')[0];
  const funcs=['_malloc','_free','_nx_last_error','_nx_device_create','_nx_device_destroy','_nx_scene_create','_nx_scene_destroy','_nx_scene_clear_geometry','_nx_scene_set_background','_nx_device_set_limits','_nx_texture_create','_ng_defaults','_ng_material','_ng_view','_ng_light','_ng_draw','_ng_render','_ng_pixels'];
  run(compiler,[...common,'--no-entry','-sMODULARIZE=1','-sEXPORT_ES6=1','-sENVIRONMENT=web,worker,node','-sALLOW_MEMORY_GROWTH=1','-sIMPORTED_MEMORY=1','-sMAXIMUM_MEMORY=536870912','-sDISABLE_EXCEPTION_CATCHING=0','-sEXPORTED_FUNCTIONS='+JSON.stringify(funcs),'-sEXPORTED_RUNTIME_METHODS=["UTF8ToString","HEAPU8"]','-o',resolve(runtime,'artifacts/nexusgl.mjs')],extra);
}
if(process.argv.includes('--native')) {
  if(process.platform!=='darwin'||process.arch!=='arm64')throw Error('The bundled native build targets macOS arm64; use --wasm for portable builds');
  const headers='-I'+(process.env.NODE_INCLUDE??'/opt/homebrew/include/node');
  run('xcrun',['clang++',...common,'-DNEXUS_NODE','-DNAPI_VERSION=8',headers,'-bundle','-undefined','dynamic_lookup','-o',resolve(runtime,'artifacts/nexusgl-darwin-arm64.node')]);
  run('xcrun',['clang++','-std=c++17','-O2','-Wall','-Wextra','-Wpedantic','-fobjc-arc','-DNAPI_VERSION=8',headers,resolve(runtime,'window.mm'),'-bundle','-undefined','dynamic_lookup','-framework','AppKit','-framework','CoreGraphics','-o',resolve(runtime,'artifacts/nexusgl-window-darwin-arm64.node')]);
}
const files=[];
for(const name of (await readdir(resolve(runtime,'artifacts'))).filter(n=>/^nexusgl(?:-window-darwin-arm64|-darwin-arm64)?\.(?:mjs|wasm|node)$/.test(n)).sort()) {
  const bytes=await readFile(resolve(runtime,'artifacts',name));files.push({path:name,bytes:bytes.length,sha256:hash(bytes)});
}
const inputs=[];
for(const file of [...sources,resolve(runtime,'bridge.cpp'),resolve(runtime,'window.mm'),resolve(source,'provenance.json')])inputs.push({path:relative(runtime,file),sha256:hash(await readFile(file))});
await writeFile(resolve(runtime,'artifacts/manifest.json'),JSON.stringify({schema:'nexusengine.nexusgl-artifacts/1',abi:1,emscripten:emscripten??'6.0.12 (prebuilt WASM)',nativeABI:'N-API 8',compilerFlags:['C++17','O2','Wall','Wextra','Wpedantic'],inputs,files},null,2)+'\n');
console.log('Runtime artifacts:',files.map(f=>relative(root,resolve(runtime,'artifacts',f.path))).join(', '));
