let loaded;
export async function loadNativeRuntime(){
  if(loaded)return loaded;
  if(typeof process==='undefined'||!process.versions?.node)throw Object.assign(new Error('Embedded Camel browser runtime has not passed validation'),{code:'CAMEL_TARGET_UNAVAILABLE'});
  const {createRequire}=await import('node:module');const require=createRequire(import.meta.url);
  const {readFile}=await import('node:fs/promises');const {createHash}=await import('node:crypto');
  const path=new URL(`artifacts/${process.platform}-${process.arch}.node`,import.meta.url);
  const manifest=JSON.parse(await readFile(new URL('artifacts/integrity.json',import.meta.url),'utf8'));
  const expected=manifest.artifacts[`${process.platform}-${process.arch}`];
  if(!expected)throw Object.assign(new Error(`No validated Camel artifact for ${process.platform}-${process.arch}`),{code:'CAMEL_TARGET_UNAVAILABLE'});
  const actual=createHash('sha256').update(await readFile(path)).digest('hex');if(actual!==expected.sha256)throw new Error('Camel native artifact integrity mismatch');
  const {fileURLToPath}=await import("node:url");
  loaded=require(fileURLToPath(path));return loaded;
}
