import assert from 'node:assert/strict';
import { createNexusGLProvider } from 'nexusengine/domains/render/graphics-language';
import { compare } from './helpers.mjs';
import { identity } from '../../../../examples/graphics-language/scene.js';
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const mul=(m,v,w=0)=>[0,1,2].map(i=>m[i]*v[0]+m[4+i]*v[1]+m[8+i]*v[2]+m[12+i]*w);
const positions=[-.45,-.4,.35,.4,-.35,.35,0,.5,.35],normal=[.4,.2,.8944271909999],tangent=[1,0,-.4472136];
for(const backend of process.platform==='darwin'&&process.arch==='arm64'?['native','wasm']:['wasm']) {
  const p=createNexusGLProvider({backend});await p.initialize();
  p.createResource({id:'normal-map',kind:'texture',data:{width:1,height:1,rgba:[180,105,235,255],normalMap:true}});
  p.createResource({id:'m',kind:'material',data:{shading:'pbr',roughness:.55,metallic:.2,normalTexture:'normal-map',tint:[.5,.8,.3]}});
  const render=(geometry,transform)=>{
    p.beginFrame({frameId:'normal',width:100,height:80,view:{shadowResolution:16,exposure:1,closedBackFaces:false}});
    p.executePass({frameId:'normal',passId:'main',sequence:0,kind:'render'},[{geometryId:geometry,materialId:'m',transform}]);p.submitFrame('normal');return p.getCompletedFrame().pixels;
  };
  for(const sign of [1,-1]) {
    const m=[1.2*sign,.15,.1,0,.3,.8,.12,0,.14,.1,.9,0,.02,-.03,.1,1];
    const cols=[[m[0],m[1],m[2]],[m[4],m[5],m[6]],[m[8],m[9],m[10]]];
    const cofactors=[cross(cols[1],cols[2]),cross(cols[2],cols[0]),cross(cols[0],cols[1])],det=dot(cols[0],cofactors[0]);
    const n=[0,1,2].map(i=>(cofactors[0][i]*normal[0]+cofactors[1][i]*normal[1]+cofactors[2][i]*normal[2])/det);
    const geometry={positions,normals:[...normal,...normal,...normal],tangents:[...tangent,...tangent,...tangent],uvs:[0,0,1,0,.5,1],castsShadow:false};
    const baked={...geometry,positions:[0,3,6].flatMap(at=>mul(m,positions.slice(at,at+3),1)),normals:[...n,...n,...n],tangents:Array.from({length:3},()=>mul(m,tangent)).flat(),handedness:Array(3).fill(det<0?-1:1)};
    if(p.getDiagnostics().resources===2) {p.createResource({id:'source',kind:'geometry',data:geometry});p.createResource({id:'baked',kind:'geometry',data:baked});}
    else {p.updateResource({id:'source',kind:'geometry',data:geometry});p.updateResource({id:'baked',kind:'geometry',data:baked});}
    const transformed=render('source',m),reference=render('baked',identity());
    compare(transformed,reference,1);
    assert(transformed.filter((v,i)=>i%4!==3&&v!==0).length>100,'Normal fixture must contain visible shaded geometry');
  }
  // Column-major projection translation must move the triangle to the right.
  p.reset();p.createResource({id:'point',kind:'geometry',data:{positions:[-.08,-.08,.5,.08,-.08,.5,0,.08,.5],castsShadow:false}});
  p.createResource({id:'red',kind:'material',data:{shading:'unlit',tint:[1,0,0]}});
  const projection=identity();projection[12]=.5;
  p.beginFrame({frameId:'projection',width:100,height:100,view:{projection,shadowResolution:16,exposure:1}});
  p.executePass({frameId:'projection',passId:'main',kind:'render',sequence:0},[{geometryId:'point',materialId:'red'}]);p.submitFrame('projection');
  const pixels=p.getCompletedFrame().pixels;
  assert(pixels[(50*100+75)*4]>100);assert.equal(pixels[(50*100+50)*4],0);
  p.dispose();
}
console.log('Transformed normals, mirrored tangent frames and column-major projections: passed');
