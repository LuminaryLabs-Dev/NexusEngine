import { spawnSync } from 'node:child_process';
for(const file of ['contract.mjs','handover.mjs','normals.mjs']) {
  const result=spawnSync(process.execPath,['--expose-gc',new URL(file,import.meta.url).pathname],{stdio:'inherit'});
  if(result.status!==0)process.exit(result.status??1);
}
