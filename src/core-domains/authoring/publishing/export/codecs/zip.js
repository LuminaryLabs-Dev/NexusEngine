import { asBytes, concat, safePath, fail, text, utf8 } from '../../../contracts/io.js';
import { crc32, inflateBounded } from './png.js';
export function encodeUSDZ(entries){
 const local=[],central=[];let offset=0;
 for(const [name,value] of Object.entries(entries)){
  safePath(name);const file=utf8.encode(name),bytes=asBytes(value),crc=crc32(bytes);let padding=(64-(offset+30+file.length)%64)%64;if(padding>0&&padding<4)padding+=64;
  const header=new Uint8Array(30+file.length+padding),v=new DataView(header.buffer);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x800,true);v.setUint16(12,33,true);v.setUint32(14,crc,true);v.setUint32(18,bytes.length,true);v.setUint32(22,bytes.length,true);v.setUint16(26,file.length,true);v.setUint16(28,padding,true);header.set(file,30);
  if(padding){v.setUint16(30+file.length,0xffff,true);v.setUint16(32+file.length,padding-4,true);}
  const ch=new Uint8Array(46+file.length),cv=new DataView(ch.buffer);cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x800,true);cv.setUint16(14,33,true);cv.setUint32(16,crc,true);cv.setUint32(20,bytes.length,true);cv.setUint32(24,bytes.length,true);cv.setUint16(28,file.length,true);cv.setUint32(42,offset,true);ch.set(file,46);
  local.push(header,bytes);central.push(ch);offset+=header.length+bytes.length;
 }
 const directory=concat(central),end=new Uint8Array(22),ev=new DataView(end.buffer);ev.setUint32(0,0x06054b50,true);ev.setUint16(8,central.length,true);ev.setUint16(10,central.length,true);ev.setUint32(12,directory.length,true);ev.setUint32(16,offset,true);
 return concat([...local,directory,end]);
}
export async function decodeUSDZ(input){
 const bytes=asBytes(input),v=new DataView(bytes.buffer,bytes.byteOffset,bytes.length);let end=-1;
 for(let p=bytes.length-22;p>=Math.max(0,bytes.length-65557);p--)if(v.getUint32(p,true)===0x06054b50){end=p;break;}
 if(end<0||end+22+v.getUint16(end+20,true)!==bytes.length)throw fail('AUTHORING_ZIP','Missing/truncated ZIP directory.');
 const count=v.getUint16(end+10,true),dirSize=v.getUint32(end+12,true),dir=v.getUint32(end+16,true);
 if(count>4096||v.getUint16(end+4,true)||v.getUint16(end+6,true)||v.getUint16(end+8,true)!==count||dir+dirSize!==end)throw fail('AUTHORING_ZIP','Unsupported ZIP layout.');
 const entries=Object.create(null),checks=[];let p=dir,total=0;
 for(let k=0;k<count;k++){
  if(p+46>end||v.getUint32(p,true)!==0x02014b50)throw fail('AUTHORING_ZIP','Bad central directory.');
  const flags=v.getUint16(p+8,true),method=v.getUint16(p+10,true),crc=v.getUint32(p+16,true),packed=v.getUint32(p+20,true),size=v.getUint32(p+24,true),nl=v.getUint16(p+28,true),xl=v.getUint16(p+30,true),cl=v.getUint16(p+32,true),start=v.getUint32(p+42,true);
  if(p+46+nl+xl+cl>end||start+30>dir||v.getUint32(start,true)!==0x04034b50||flags&1||method!==0)throw fail('AUTHORING_ZIP','USDZ requires unencrypted, stored entries.');
  const name=safePath(text(bytes.subarray(p+46,p+46+nl))),localName=v.getUint16(start+26,true),localExtra=v.getUint16(start+28,true),data=start+30+localName+localExtra;
  if(entries[name]||text(bytes.subarray(start+30,start+30+localName))!==name||packed!==size||data%64||data+size>dir||(total+=size)>256*1024*1024)throw fail('AUTHORING_ZIP','Invalid name, size, alignment or package budget.');
  const value=bytes.slice(data,data+size);if(crc32(value)!==crc||v.getUint32(start+14,true)!==crc)throw fail('AUTHORING_ZIP','CRC mismatch.');entries[name]=value;checks.push({name,dataOffset:data,byteLength:size});p+=46+nl+xl+cl;
 }
 if(p!==end)throw fail('AUTHORING_ZIP','Directory size mismatch.');
 return {entries,checks};
}
