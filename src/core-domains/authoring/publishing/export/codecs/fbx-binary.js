import { asBytes, concat, utf8, text, u32, fail } from '../../../contracts/io.js';
import { inflateBounded } from './png.js';
const MAGIC=Uint8Array.from([75,97,121,100,97,114,97,32,70,66,88,32,66,105,110,97,114,121,32,32,0,26,0]);
export const N=(name,props=[],children=[])=>({name,props,children});
export const P=(type,value)=>({type,value});
function scalar(type,value){
 const size={Y:2,C:1,I:4,F:4,D:8,L:8}[type],out=new Uint8Array(1+size),v=new DataView(out.buffer);out[0]=type.charCodeAt(0);
 if(type==='L')v.setBigInt64(1,BigInt(value),true);else if(type==='C')out[1]=value?1:0;
 else v[{Y:'setInt16',I:'setInt32',F:'setFloat32',D:'setFloat64'}[type]](1,value,true);return out;
}
function property(p){
 if(!p||typeof p.type!=='string')throw fail('AUTHORING_FBX','Typed FBX property required.');const {type,value}=p;
 if(['Y','C','I','F','D','L'].includes(type))return scalar(type,value);
 if(type==='S'||type==='R'){const bytes=type==='S'?utf8.encode(value):asBytes(value);return concat([Uint8Array.of(type.charCodeAt(0)),u32(bytes.length),bytes]);}
 const size={f:4,d:8,i:4,l:8,b:1,c:1}[type];if(!size||!Array.isArray(value))throw fail('AUTHORING_FBX','Unsupported property type.');
 const bytes=new Uint8Array(value.length*size),v=new DataView(bytes.buffer);
 value.forEach((n,i)=>{if(type==='l')v.setBigInt64(i*size,BigInt(n),true);else if(type==='b'||type==='c')bytes[i]=Number(n);else v[{f:'setFloat32',d:'setFloat64',i:'setInt32'}[type]](i*size,n,true);});
 return concat([Uint8Array.of(type.charCodeAt(0)),u32(value.length),u32(0),u32(bytes.length),bytes]);
}
export function encodeFBXTree(nodes){
 function node(n,start){const name=utf8.encode(n.name);if(name.length>255)throw fail('AUTHORING_FBX','Node name too long.');const properties=concat(n.props.map(property));let offset=start+13+name.length+properties.length;
  const children=[];for(const child of n.children){const bytes=node(child,offset);children.push(bytes);offset+=bytes.length;}
  if(n.children.length){children.push(new Uint8Array(13));offset+=13;}
  return concat([u32(offset),u32(n.props.length),u32(properties.length),Uint8Array.of(name.length),name,properties,...children]);}
 const parts=[MAGIC,u32(7400)];let offset=27;for(const n of nodes){const bytes=node(n,offset);parts.push(bytes);offset+=bytes.length;}
 parts.push(new Uint8Array(13));offset+=13;
 const foot=Uint8Array.from([250,188,171,9,208,200,212,102,177,118,251,131,28,247,38,126]);parts.push(foot);offset+=foot.length;
 parts.push(new Uint8Array(16-offset%16),new Uint8Array(4),u32(7400),new Uint8Array(120),Uint8Array.from([248,90,140,106,222,245,217,126,236,233,12,227,117,143,41,11]));return concat(parts);
}
export async function decodeFBXTree(input){
 const bytes=asBytes(input);if(!MAGIC.every((n,i)=>n===bytes[i]))return decodeAscii(bytes);
 const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.length);let p=23;const version=v.getUint32(p,true);p+=4;if(version<7000||version>7700)throw fail('AUTHORING_FBX_VERSION','Unsupported FBX binary version.');
 let nodeCount=0,total=0;const header=version>=7500?25:13;
 const bound=n=>{if(!Number.isSafeInteger(n)||n<0||p+n>bytes.length)throw fail('AUTHORING_FBX_TRUNCATED','FBX input exceeds bounds.');};
 const read32=()=>{bound(4);const n=v.getUint32(p,true);p+=4;return n;};
 const read64=()=>{bound(8);const n=Number(v.getBigUint64(p,true));p+=8;if(!Number.isSafeInteger(n))throw fail('AUTHORING_FBX_RANGE','Unsafe 64-bit FBX value.');return n;};
 async function prop(){bound(1);const type=String.fromCharCode(bytes[p++]);
  if(type==='S'||type==='R'){const length=read32();bound(length);const data=bytes.slice(p,p+length);p+=length;return type==='S'?text(data):data;}
  const sizes={Y:2,C:1,I:4,F:4,D:8,L:8},size=sizes[type];
  if(size){bound(size);const value=type==='L'?Number(v.getBigInt64(p,true)):type==='C'?Boolean(bytes[p]):v[{Y:'getInt16',I:'getInt32',F:'getFloat32',D:'getFloat64'}[type]](p,true);p+=size;if(typeof value==='number'&&!Number.isFinite(value))throw fail('AUTHORING_FBX_RANGE','Nonfinite scalar.');return value;}
  const stride={f:4,d:8,i:4,l:8,b:1,c:1}[type];if(!stride)throw fail('AUTHORING_FBX_PROPERTY',`Unsupported FBX property type ${type}.`);
  const count=read32(),encoding=read32(),packed=read32();if(count>16000000||(total+=count*stride)>256*1024*1024||![0,1].includes(encoding))throw fail('AUTHORING_BYTE_BUDGET','FBX array budget exceeded.');bound(packed);let data=bytes.subarray(p,p+packed);p+=packed;
  if(encoding===1)data=await inflateBounded(data,'deflate',count*stride);if(data.length!==count*stride)throw fail('AUTHORING_FBX_ARRAY','FBX array length mismatch.');
  const view=new DataView(data.buffer,data.byteOffset,data.length);return Array.from({length:count},(_,i)=>type==='l'?Number(view.getBigInt64(i*stride,true)):['b','c'].includes(type)?data[i]:view[{f:'getFloat32',d:'getFloat64',i:'getInt32'}[type]](i*stride,true));
 }
 async function node(depth,parentEnd=bytes.length){
  bound(header);const start=p,end=version>=7500?read64():read32(),count=version>=7500?read64():read32(),length=version>=7500?read64():read32(),nl=bytes[p++];
  if(end===0){if(count||length||nl)throw fail('AUTHORING_FBX_NULL','Malformed null record.');return null;}
  if(depth>256||++nodeCount>1000000||end<=start+header||end>parentEnd||count>1000000)throw fail('AUTHORING_FBX_BUDGET','Invalid node depth/count/end offset.');
  bound(nl);const name=text(bytes.subarray(p,p+nl));p+=nl;const props=[],propsStart=p;
  for(let i=0;i<count;i++)props.push(await prop());if(p-propsStart!==length||p>end)throw fail('AUTHORING_FBX_PROPERTY','Property-list length mismatch.');
  const children=[];while(p<end){const child=await node(depth+1,end);if(!child){if(p!==end)throw fail('AUTHORING_FBX_NULL','Unexpected null record.');break;}children.push(child);}if(p!==end)throw fail('AUTHORING_FBX_NODE','Node length mismatch.');return {name,props,children};
 }
 const nodes=[];while(p+header<=bytes.length){const n=await node(0);if(!n)break;nodes.push(n);}return {version,nodes};
}
// Decode the standard text container without a geometry conversion. Both
// containers feed the same semantic importer and its existing profile checks.
function decodeAscii(bytes){
 if(bytes.length>256*1024*1024)throw fail('AUTHORING_BYTE_BUDGET','FBX text budget exceeded.');
 const source=text(bytes);if(!/^\s*;\s*FBX 7\.[0-7]\.\d+ project file/.test(source))throw fail('AUTHORING_FBX_BINARY_REQUIRED','Expected binary or ASCII FBX 7.x.');
 let at=0,count=0,total=0;
 const bad=message=>fail('AUTHORING_FBX_ASCII',`${message} at character ${at}.`);
 function space(lines=true){while(at<source.length){const c=source[at];if(c===';'){while(at<source.length&&!/[\r\n]/.test(source[at]))at++;}else if(c===' '||c==='\t'||(lines&&/[\r\n]/.test(c)))at++;else break;}}
 function number(){const start=at;while(at<source.length&&/[+\-\d.eE]/.test(source[at]))at++;const raw=source.slice(start,at);if(!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(raw))throw bad('Invalid number');const n=Number(raw);if(!Number.isFinite(n)||(!/[.eE]/.test(raw)&&!Number.isSafeInteger(n)))throw bad('Unsafe number');return n;}
 function scalar(){space(false);if(source[at]!=='"'){if(/[+\-\d.]/.test(source[at]??''))return number();const m=/^[A-Za-z_][A-Za-z_0-9]*/.exec(source.slice(at,at+256));if(!m)throw bad('Expected property');at+=m[0].length;return m[0];}
  at++;let result='',start=at;while(at<source.length){const c=source[at++];if(c==='"')return result+source.slice(start,at-1);if(c==='\\'){result+=source.slice(start,at-1);const next=source[at++];if(next!=='"'&&next!=='\\')throw bad('Unsupported string escape');result+=next;start=at;}}throw bad('Unterminated string');}
 function nodes(depth=0,nested=false){if(depth>256)throw bad('Node depth budget exceeded');const out=[];while(true){space();if(at>=source.length){if(nested)throw bad('Unclosed node');return out;}if(source[at]==='}'){if(!nested)throw bad('Unexpected closing brace');at++;return out;}
  if(++count>1000000)throw bad('Node count budget exceeded');const m=/^[A-Za-z_][A-Za-z_0-9]*/.exec(source.slice(at,at+256));if(!m)throw bad('Expected node name');const name=m[0];at+=name.length;space(false);if(source[at++]!==':')throw bad('Expected colon');space(false);
  if(source[at]==='*'){at++;const length=number();if(!Number.isSafeInteger(length)||length<0||length>16000000||(total+=length*8)>256*1024*1024)throw fail('AUTHORING_BYTE_BUDGET','FBX array budget exceeded.');space();if(source[at++]!=='{')throw bad('Expected array body');space();if(source[at++]!=='a')throw bad('Expected array data');space();if(source[at++]!==':')throw bad('Expected array colon');const values=[];space();while(source[at]!=='}'){if(values.length>=length)throw bad('Excess array values');values.push(number());space();if(source[at]===','){at++;space();}else if(source[at]!=='}')throw bad('Expected array separator');}at++;if(values.length!==length)throw bad('Array count mismatch');out.push({name,props:[values],children:[]});continue;}
  const props=[];while(at<source.length&&!/[\r\n{}]/.test(source[at])){props.push(scalar());if(props.length>1000000)throw bad('Property count budget exceeded');space(false);if(source[at]!==',')break;at++;space();}
  space(false);let children=[];if(source[at]==='{'){at++;children=nodes(depth+1,true);}
  if(name==='Content'&&props.length===1&&typeof props[0]==='string'){
   const encoded=props[0];if(/[^A-Za-z0-9+/=]/.test(encoded)||(total+=Math.ceil(encoded.length*3/4))>256*1024*1024)throw bad('Invalid or oversized embedded content');
   try{const raw=atob(encoded);props[0]=Uint8Array.from(raw,c=>c.charCodeAt(0));}catch{throw bad('Invalid embedded content base64');}
  }
  out.push({name,props,children});
 }}
 const result=nodes();
 const header=result.find(n=>n.name==='FBXHeaderExtension'),fileVersion=value(header,'FBXVersion');
 if(!Number.isInteger(fileVersion)||fileVersion<7000||fileVersion>7700)throw fail('AUTHORING_FBX_VERSION','Unsupported ASCII FBX version.');
 return {version:fileVersion,nodes:result};
}
export const child=(n,name)=>n?.children.find(c=>c.name===name);
export const children=(n,name)=>n?.children.filter(c=>c.name===name)??[];
export const value=(n,name,fallback=null)=>child(n,name)?.props[0]??fallback;
export function properties(n){return Object.fromEntries(children(child(n,'Properties70'),'P').map(p=>[p.props[0],p.props.length>5?p.props.slice(4):p.props[4]]));}
