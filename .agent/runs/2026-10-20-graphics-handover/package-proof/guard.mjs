import {isBuiltin} from 'node:module';
const base=new URL('./',import.meta.url).href;
export async function resolve(specifier,context,next){
  const resolved=await next(specifier,context);
  if(!isBuiltin(specifier)&&!resolved.url.startsWith(base)&&!resolved.url.startsWith('node:'))throw Error('Unexpected dependency outside packed consumer: '+resolved.url);
  return resolved;
}
