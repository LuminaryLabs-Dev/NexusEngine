import { asBytes, concat, u32, fail, hex, unhex } from '../../../contracts/io.js';
import { srgbToLinear, linearToSrgb } from '../../../paint/image.js';
const TABLE=Uint32Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=(n&1)?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
export function crc32(bytes){let crc=0xffffffff;for(const b of bytes)crc=TABLE[(crc^b)&255]^(crc>>>8);return (crc^0xffffffff)>>>0;}
const pngSignature=Uint8Array.of(137,80,78,71,13,10,26,10);
function chunk(type,data){const name=new TextEncoder().encode(type);return concat([u32(data.length,false),name,data,u32(crc32(concat([name,data])),false)]);}
function adler32(data){let a=1,b=0;for(const n of data){a=(a+n)%65521;b=(b+a)%65521;}return ((b<<16)|a)>>>0;}
function storedZlib(data){const out=[Uint8Array.of(0x78,0x01)];for(let p=0;p<data.length;p+=65535){const part=data.subarray(p,p+65535),length=part.length;
 out.push(Uint8Array.of(p+length===data.length?1:0,length&255,length>>>8,(~length)&255,((~length)>>>8)&255),part);}
 out.push(u32(adler32(data),false));return concat(out);}
export function encodePNG({width,height,data}) {
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width>4096||height>4096||asBytes(data).length!==width*height*4)throw fail('AUTHORING_IMAGE','Invalid RGBA8 dimensions.');
 const rows=new Uint8Array((width*4+1)*height);for(let y=0;y<height;y++)rows.set(data.subarray(y*width*4,(y+1)*width*4),y*(width*4+1)+1);
 const ihdr=concat([u32(width,false),u32(height,false),Uint8Array.of(8,6,0,0,0)]);
 return concat([pngSignature,chunk('IHDR',ihdr),chunk('IDAT',storedZlib(rows)),chunk('IEND',new Uint8Array())]);
}
export async function inflateBounded(data,format,limit){
 if(!globalThis.DecompressionStream)throw fail('AUTHORING_CODEC_UNAVAILABLE','This environment needs DecompressionStream to decode compressed input.');
 const reader=new Blob([asBytes(data)]).stream().pipeThrough(new DecompressionStream(format)).getReader();let total=0;const parts=[];
 try{while(true){const {done,value}=await reader.read();if(done)break;if((total+=value.length)>limit)throw fail('AUTHORING_BYTE_BUDGET','Decoded input exceeds budget.');parts.push(value);}}finally{await reader.cancel().catch(()=>{});}
 return concat(parts);
}
export async function decodePNG(input){
 const bytes=asBytes(input),view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 if(!pngSignature.every((n,i)=>bytes[i]===n))throw fail('AUTHORING_IMAGE','Expected PNG bytes.');
 const chunks=[];let width,height,depth,type,palette,transparency,end=false;
 for(let p=8;p+12<=bytes.length;){const length=view.getUint32(p),tag=new TextDecoder().decode(bytes.subarray(p+4,p+8));
   if(p+12+length>bytes.length)throw fail('AUTHORING_IMAGE','Truncated PNG chunk.');const data=bytes.subarray(p+8,p+8+length);
   if(crc32(bytes.subarray(p+4,p+8+length))!==view.getUint32(p+8+length))throw fail('AUTHORING_IMAGE','PNG CRC mismatch.');
   if(tag==='IHDR'){if(width!==undefined||length!==13)throw fail('AUTHORING_IMAGE','Invalid IHDR.');width=view.getUint32(p+8);height=view.getUint32(p+12);depth=data[8];type=data[9];
     if(width<1||height<1||width>4096||height>4096||depth!==8||![0,2,3,4,6].includes(type)||data[10]||data[11]||data[12])throw fail('AUTHORING_IMAGE_PROFILE','Only non-interlaced 8-bit PNG up to 4096px is supported.');}
   else if(tag==='IDAT')chunks.push(data);else if(tag==='PLTE')palette=data;else if(tag==='tRNS')transparency=data;else if(tag==='IEND'){end=true;break;}
   else if(tag[0]===tag[0].toUpperCase())throw fail('AUTHORING_IMAGE_PROFILE',`Unknown critical PNG chunk ${tag}.`);
   p+=length+12;
 }
 if(!end||!width||!chunks.length)throw fail('AUTHORING_IMAGE','PNG is incomplete.');
 const bpp={0:1,2:3,3:1,4:2,6:4}[type],stride=width*bpp,raw=await inflateBounded(concat(chunks),'deflate',(stride+1)*height);
 if(raw.length!==(stride+1)*height)throw fail('AUTHORING_IMAGE','PNG decoded length mismatch.');const scan=new Uint8Array(stride*height);
 const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
 for(let y=0;y<height;y++){const filter=raw[y*(stride+1)];if(filter>4)throw fail('AUTHORING_IMAGE','Invalid PNG filter.');
   for(let x=0;x<stride;x++){const i=y*stride+x,a=x>=bpp?scan[i-bpp]:0,b=y?scan[i-stride]:0,c=y&&x>=bpp?scan[i-stride-bpp]:0;
    scan[i]=(raw[y*(stride+1)+1+x]+[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][filter])&255;}}
 const data=new Uint8Array(width*height*4);for(let i=0;i<width*height;i++){
  const o=i*4,j=i*bpp;let r,g,b,a=255;
  if(type===6){[r,g,b,a]=scan.subarray(j,j+4);}else if(type===2){[r,g,b]=scan.subarray(j,j+3);if(transparency?.length===6&&r===transparency[1]&&g===transparency[3]&&b===transparency[5])a=0;}
  else if(type===3){const p=scan[j];if(!palette||p*3+2>=palette.length)throw fail('AUTHORING_IMAGE','Invalid palette reference.');[r,g,b]=palette.subarray(p*3,p*3+3);a=transparency?.[p]??255;}
  else{r=g=b=scan[j];if(type===4)a=scan[j+1];else if(transparency?.length===2&&r===transparency[1])a=0;}
  data.set([r,g,b,a],o);
 }
 return {width,height,data};
}
export function rasterPixels(raster,colorSpace=raster.colorSpace){
 if(raster.format!=='rgba8'||raster.tileSize!==64)throw fail('AUTHORING_IMAGE','Unsupported raster packet.');
 const data=new Uint8Array(raster.width*raster.height*4),tiles=new Map(Object.entries(raster.tiles).map(([k,v])=>[k,unhex(v)]));
 for(let y=0;y<raster.height;y++)for(let x=0;x<raster.width;x++){
   const tile=tiles.get(`${x>>6}:${y>>6}`),at=((y%64)*64+x%64)*4,o=(y*raster.width+x)*4;
   for(let c=0;c<4;c++){let n=(tile?tile[at+c]:raster.background[c])/255;
    if(c<3&&colorSpace!==raster.colorSpace)n=colorSpace==='srgb'?linearToSrgb(n):srgbToLinear(n);
    data[o+c]=Math.round(Math.max(0,Math.min(1,n))*255);}
 }
 return {width:raster.width,height:raster.height,data};
}
export function imageDocument(pixels,colorSpace){
 const tiles={};for(let ty=0;ty<Math.ceil(pixels.height/64);ty++)for(let tx=0;tx<Math.ceil(pixels.width/64);tx++){
   const b=new Uint8Array(64*64*4);for(let y=0;y<64&&ty*64+y<pixels.height;y++)for(let x=0;x<64&&tx*64+x<pixels.width;x++)b.set(pixels.data.subarray(((ty*64+y)*pixels.width+tx*64+x)*4,((ty*64+y)*pixels.width+tx*64+x)*4+4),(y*64+x)*4);
   tiles[`${tx}:${ty}`]=hex(b);
 }
 return {width:pixels.width,height:pixels.height,colorSpace,layers:[{id:'imported',opacity:1,blend:'normal',color:[0,0,0,0],tiles}]};
}
