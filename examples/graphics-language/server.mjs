import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root=resolve(fileURLToPath(new URL('../../',import.meta.url)));
export async function startServer(port=0) {
  const pkg=JSON.parse(await readFile(resolve(root,'package.json'),'utf8'));
  const imports=Object.fromEntries(Object.entries(pkg.exports).filter(([,target])=>typeof target==='string'&&!target.includes('*')).map(([key,target])=>[key==='.'?'nexusengine':'nexusengine/'+key.slice(2),'/'+target.slice(2)]));
  const server=createServer(async(req,res)=>{
    try {
      const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
      const file=resolve(root,'.'+(pathname==='/'?'/examples/graphics-language/index.html':pathname));
      const within=relative(root,file);
      if(within.startsWith('..')||within.includes('node_modules')||!['.html','.js','.mjs','.wasm','.json'].includes(extname(file))) {res.writeHead(404).end();return;}
      let data=await readFile(file);
      if(file.endsWith('graphics-language/index.html'))data=data.toString().replace('__IMPORT_MAP__',JSON.stringify({imports}));
      res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.wasm':'application/wasm','.json':'application/json'})[extname(file)]);
      res.end(data);
    }catch {res.writeHead(404).end();}
  });
  await new Promise(r=>server.listen(port,'127.0.0.1',r));
  return {server,url:`http://127.0.0.1:${server.address().port}/examples/graphics-language/index.html`};
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){const {url}=await startServer(Number(process.env.PORT??0));console.log(url);}
