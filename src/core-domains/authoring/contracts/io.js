import { sha256Integrity } from '../../../foundation/sha256.js';
import { canonical, freeze, authoringError, requireText } from './value.js';
export const fail = authoringError;
export const utf8 = new TextEncoder();
export const text = (value) => new TextDecoder('utf-8', { fatal: true }).decode(asBytes(value));
export function asBytes(value, max = 256 * 1024 * 1024) {
  const bytes = value instanceof Uint8Array ? value : value instanceof ArrayBuffer ? new Uint8Array(value) : null;
  if (!bytes || bytes.byteLength > max) throw fail('AUTHORING_BYTE_BUDGET', 'Expected bounded Uint8Array or ArrayBuffer bytes.');
  return bytes;
}
export const digest = (value) => sha256Integrity(asBytes(value));
export const jsonBytes = (value) => utf8.encode(JSON.stringify(canonical(value)));
export const copy = (value) => structuredClone(value);
export const record = (value) => freeze(canonical(value));
export function abort(signal) {
  if (signal?.aborted) throw fail('AUTHORING_CANCELLED', 'Authoring operation cancelled.');
}
export function safePath(value) {
  requireText(value, 'relative resource path');
  if (/^[a-z][a-z0-9+.-]*:/i.test(value) || /[\\\x00-\x1f]/.test(value) || value.split('/').some(p => !p || p === '.' || p === '..'))
    throw fail('AUTHORING_UNSAFE_PATH', `Unsafe relative resource path: ${value}`);
  return value;
}
export function concat(parts) {
  const size = parts.reduce((n,p) => n + p.length, 0);
  if (size > 256 * 1024 * 1024) throw fail('AUTHORING_BYTE_BUDGET', 'Encoded artifact exceeds 256 MiB.');
  const out = new Uint8Array(size); let offset=0;
  for (const part of parts) { out.set(part,offset);offset+=part.length; }
  return out;
}
export function u32(value, little=true) { const b=new Uint8Array(4);new DataView(b.buffer).setUint32(0,value,little);return b; }
export const hex = (bytes) => Array.from(bytes, b=>b.toString(16).padStart(2,'0')).join('');
export function unhex(value) {
  if (typeof value!=='string' || value.length%2 || !/^[0-9a-f]*$/.test(value)) throw fail('AUTHORING_HEX','Malformed hexadecimal bytes.');
  return Uint8Array.from({length:value.length/2},(_,i)=>parseInt(value.slice(i*2,i*2+2),16));
}
export function report(issues=[], extra={}) {
  return record({ status: issues.some(i=>i.severity==='error')?'invalid':'valid',
    errors:issues.filter(i=>i.severity==='error').length, warnings:issues.filter(i=>i.severity==='warning').length,
    issues, ...extra });
}
export const issue=(code,message,severity='error',details={})=>({code,message,severity,details});
export function resourcesOf(resources={}) {
  const result=Object.create(null);
  let total=0,count=0;
  for(const [path,value] of Object.entries(resources)) {
    const bytes=asBytes(value);if(++count>4096||(total+=bytes.length)>256*1024*1024)throw fail('AUTHORING_BYTE_BUDGET','Resource bundle exceeds its count/byte budget.');
    result[safePath(path)]=bytes.slice();
  }
  return result;
}
export function resource(uri, resources) {
  if(typeof uri!=='string') throw fail('AUTHORING_RESOURCE','Expected a resource URI.');
  if(uri.startsWith('data:')) {
    const m=/^data:([^;,]+)?;base64,([A-Za-z0-9+/]*={0,2})$/.exec(uri);
    if(!m || m[2].length>350000000) throw fail('AUTHORING_RESOURCE','Unsupported or oversized data URI.');
    return Uint8Array.from(atob(m[2]),c=>c.charCodeAt(0));
  }
  let path;try{path=decodeURIComponent(uri);}catch{throw fail('AUTHORING_RESOURCE','Malformed resource URI.');}
  const value=resources[safePath(path)];
  if(!value) throw fail('AUTHORING_RESOURCE_MISSING', `Provide bytes for ${path}; import never fetches network resources implicitly.`);
  return asBytes(value);
}

export function append(target, values) { for (const value of values) target.push(value); return target; }
