import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const kit=path.resolve(fileURLToPath(new URL('../..',import.meta.url)));
const root=path.join(kit,'runtime/source');
const output=path.resolve(kit,'../../..','build/graphics-runtime/native-tests');
mkdirSync(output,{recursive:true});
const compiler=process.env.CXX||'clang++';
const probe=spawnSync(compiler,['--version'],{encoding:'utf8'});
if(probe.status!==0){console.error(`Native compiler unavailable: ${compiler}`);process.exit(1);}
const walk=(dir)=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):e.name.endsWith('.cpp')?[path.join(dir,e.name)]:[]);
const source=[...walk(path.join(root,'src')),path.join(root,'adapters/c_api.cpp')];
const args=['-std=c++17','-Wall','-Wextra','-Werror','-O1','-g','-I',path.join(root,'include')];
if(process.argv.includes('--sanitize'))args.push('-fsanitize=address,undefined','-fno-omit-frame-pointer');
for(const fixture of ['transactions','resources','transforms','shadow-cache','memory-reuse']){
 const binary=path.join(output,fixture);
 const built=spawnSync(compiler,[...args,...source,path.join(kit,'tests/native',`${fixture}.cpp`),'-o',binary],{stdio:'inherit'});
 if(built.status!==0)process.exit(built.status??1);
 const ran=spawnSync(binary,[],{stdio:'inherit',env:{...process.env,ASAN_OPTIONS:process.platform==='darwin'?'detect_leaks=0':'detect_leaks=1'}});
 if(ran.status!==0)process.exit(ran.status??1);
}
console.log('native source fixtures PASS');
