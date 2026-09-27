import { fail } from '../../../contracts/io.js';
/** Bounded USDA lexical reader; composition arcs and binary crates are explicit unsupported profiles. */
export function parseUSDA(text){
 if(!text.startsWith('#usda 1.0'))throw fail('AUTHORING_USDA','Expected USDA 1.0.');
 const tokens=[];let p=0;
 while(p<text.length){const c=text[p];if(/\s/.test(c)){p++;continue;}if(c==='#'){while(p<text.length&&text[p]!=='\n')p++;continue;}
  if(c==='"'){const start=p++;let escape=false;while(p<text.length){const cc=text[p++];if(!escape&&cc==='"')break;escape=!escape&&cc==='\\';}
   try{tokens.push({kind:'string',value:JSON.parse(text.slice(start,p))});}catch{throw fail('AUTHORING_USDA','Malformed string.');}continue;}
  if(c==='@'||c==='<'){const end=c==='@'?'@':'>',start=++p;while(p<text.length&&text[p]!==end)p++;if(p>=text.length)throw fail('AUTHORING_USDA','Unterminated path/asset.');tokens.push({kind:c==='@'?'asset':'path',value:text.slice(start,p++)});continue;}
  const number=/^[+-]?(?:(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)/.exec(text.slice(p));if(number){const value=Number(number[0]);if(!Number.isFinite(value))throw fail('AUTHORING_USDA','Non-finite number.');tokens.push({kind:'number',value});p+=number[0].length;continue;}
  const id=/^[A-Za-z_][A-Za-z0-9_:.-]*/.exec(text.slice(p));if(id){tokens.push({kind:'id',value:id[0]});p+=id[0].length;continue;}
  if('(){}[]=,:'.includes(c)){tokens.push({kind:c,value:c});p++;continue;}throw fail('AUTHORING_USDA',`Unexpected USDA token at ${p}.`);
 }
 if(tokens.length>16000000)throw fail('AUTHORING_IMPORT_BUDGET','USDA token limit exceeded.');
 let i=0,nodes=0;const peek=()=>tokens[i]?.value,take=()=>{if(!tokens[i])throw fail('AUTHORING_USDA','Unexpected end of USDA.');return tokens[i++];},expect=x=>{if(take().value!==x)throw fail('AUTHORING_USDA',`Expected ${x}.`);};
 function val(depth=0){if(depth>128)throw fail('AUTHORING_USDA','Value nesting too deep.');const t=take();
  if(t.kind==='path')return {$path:t.value};if(t.kind==='asset')return {$asset:t.value};if(['string','number'].includes(t.kind))return t.value;
  if(t.value==='true'||t.value==='false')return t.value==='true';if(t.value==='None')return null;
  if(t.value==='['||t.value==='('){const end=t.value==='['?']':')',result=[];while(peek()!==end){result.push(val(depth+1));if(peek()===',')take();}take();return result;}
  if(t.value==='{'){const map={};while(peek()!=='}'){const key=take().value;expect(':');map[key]=val(depth+1);if(peek()===',')take();}take();return map;}
  if(t.kind==='id')return t.value;throw fail('AUTHORING_USDA','Unsupported value.');
 }
 function fields(until){const out={};while(peek()!==until){const words=[];while(peek()!=='='){const t=take();if(t.value==='['){expect(']');words[words.length-1]+='[]';}else words.push(t.value);if(words.length>8)throw fail('AUTHORING_USDA','Malformed property declaration.');}
   take();const name=words.pop();if(Object.hasOwn(out,name))throw fail('AUTHORING_USDA','Duplicate property.');out[name]={type:words.join(' '),value:val()};if(peek()==='('){take();out[name].metadata=fields(')');expect(')');}if(peek()===',')take();}return out;}
 function prim(parent='',depth=0){if(depth>128||++nodes>100000)throw fail('AUTHORING_USDA','Prim hierarchy budget exceeded.');const spec=take().value;if(!['def','over','class'].includes(spec))throw fail('AUTHORING_USDA','Expected a prim specifier.');
  let type='',name;if(tokens[i]?.kind==='id')type=take().value;name=take();if(name.kind!=='string'||!/^[_A-Za-z][_A-Za-z0-9]*$/.test(name.value))throw fail('AUTHORING_USDA','Invalid prim identifier.');
  let metadata={};if(peek()==='('){take();metadata=fields(')');expect(')');}expect('{');const out={type,name:name.value,path:parent+'/'+name.value,metadata,properties:{},children:[]};
  while(peek()!=='}'){
   if(['def','over','class'].includes(peek())){out.children.push(prim(out.path,depth+1));continue;}
   if(peek()==='variantSet')throw fail('AUTHORING_USDA_COMPOSITION','Variant composition is not implemented in this import profile.');
   const words=[];
   while(['custom','uniform','varying','prepend','append','delete','add','reorder'].includes(peek())) words.push(take().value);
   const type=take();if(type.kind!=='id')throw fail('AUTHORING_USDA','Expected property type.');words.push(type.value);
   if(peek()==='['){take();expect(']');words[words.length-1]+='[]';}
   const name=take();if(name.kind!=='id')throw fail('AUTHORING_USDA','Expected property name.');
   const key=name.value,property={type:words.join(' '),value:null};
   if(peek()==='='){take();property.value=val();}
   if(Object.hasOwn(out.properties,key))throw fail('AUTHORING_USDA','Duplicate property.');
   if(peek()==='('){take();property.metadata=fields(')');expect(')');}out.properties[key]=property;if(peek()===',')take();
  }expect('}');return out;
 }
 let metadata={};if(peek()==='('){take();metadata=fields(')');expect(')');}const roots=[];while(i<tokens.length)roots.push(prim());return {metadata,roots};
}
export const get=(n,key,fallback=null)=>n?.properties?.[key]?.value??fallback;
export const pathValue=v=>v?.$path??(Array.isArray(v)?v[0]?.$path:null);
