import {createEngine} from 'nexusengine';
import {createAuthoringDomain} from 'nexusengine/domains/authoring';
export function newEngine(){return createEngine({kits:createAuthoringDomain()});}
const counters=new WeakMap();
export function operations(engine){const p=engine.n.authoringProject;const command=(id,args)=>p.execute({requestId:`fixture-${counters.set(engine,(counters.get(engine)??0)+1).get(engine)}`,epoch:p.context().epoch,operations:[{id,args}]});return {command,edit:(id,args)=>command(id,{expectedRevision:p.getDocument(args.id).revision,...args})};}
export function building(engine=newEngine(),{animated=false}={}){
 const {command,edit}=operations(engine),p=engine.n.authoringProject;
 command('mesh.cube',{id:'building'});edit('uv.unwrap',{id:'building',parameters:{resolution:64,padding:2}});
 const mesh=structuredClone(p.getDocument('building').content);
 mesh.attributes.push({id:'material',domain:'face',arity:1,values:Object.fromEntries(mesh.faces.map((f,i)=>[f.id,[i<4?0:1]]))});
 edit('mesh.replace',{id:'building',mesh});
 const pixels=new Uint8Array(64*64*4);
 for(let y=0;y<64;y++)for(let x=0;x<64;x++){const checker=((x>>3)+(y>>3))%2;pixels.set(checker?[44,93,154,255]:[219,185,111,255],(y*64+x)*4);}
 const tile=Array.from(pixels,b=>b.toString(16).padStart(2,'0')).join('');
 command('paint.set',{id:'checker',content:{width:64,height:64,colorSpace:'srgb',layers:[{id:'base',opacity:1,blend:'normal',color:[1,1,1,1],tiles:{'0:0':tile}}]}});
 for(const [id,color]of [['normal',[.5,.5,1,1]],['mr',[1,.8,.1,1]],['emission',[.06,.04,.01,1]]])command('paint.set',{id,content:{width:4,height:4,colorSpace:id==='emission'?'srgb':'linear',layers:[{id:'base',opacity:1,blend:'normal',color,tiles:{}}]}});
 command('material.set',{id:'walls',content:{baseColor:[1,1,1,1],metallic:.1,roughness:.8,emissive:[.2,.2,.2],textures:{baseColor:{imageId:'checker'},normal:{imageId:'normal'},metallicRoughness:{imageId:'mr'},emissive:{imageId:'emission'}}}});
 command('material.set',{id:'roof',content:{baseColor:[.15,.18,.21,1],roughness:.9}});
 const node={id:'building-001',name:'Building 001',parent:'buildings',meshId:'building',materials:['walls','roof']};
 if(animated){
  command('rig.set',{id:'rig',content:{bones:[{id:'root',name:'Root',parent:null,rest:{},length:1},{id:'tip',name:'Tip',parent:'root',rest:{translation:[0,1,0]},length:1}]}});
  command('skin.bind',{id:'skin',meshId:'building',rigId:'rig'});
  command('animation.shape',{id:'shape',meshId:'building',keys:[{id:'bulge',weight:.1,deltas:{v0:[0,.2,0],v1:[.1,0,0]}}]});
  command('animation.set',{id:'animation',content:{rigId:'rig',shapeId:'shape',clips:[{id:'bend',name:'Bend',duration:1,tracks:[
   {id:'bend-tip',target:'tip',property:'rotation',interpolation:'LINEAR',keys:[{time:0,value:[0,0,0,1]},{time:1,value:[0,0,Math.sin(Math.PI/8),Math.cos(Math.PI/8)]}]},
   {id:'morph',target:'bulge',property:'weight',interpolation:'LINEAR',keys:[{time:0,value:[.1]},{time:1,value:[.8]}]}
  ]}]}});
  Object.assign(node,{rigId:'rig',skinId:'skin',shapeId:'shape',animationIds:['animation']});
 }
 command('assembly.set',{id:'scene',content:{nodes:[{id:'buildings',name:'Buildings',transform:{translation:[1.25,0,-.5],rotation:[0,Math.sin(.15),0,Math.cos(.15)]}},node,{id:'camera-node',name:'Camera',transform:{translation:[0,4,8]}},{id:'light-node',name:'Key light',transform:{translation:[3,6,4]}}],cameras:[{id:'camera',nodeId:'camera-node',yfov:.7,near:.1,far:100}],lights:[{id:'light',nodeId:'light-node',type:'directional',color:[1,.9,.8],intensity:1.2}]}});
 return engine;
}
export function pointsAt(engine,assemblyId,time=0){
 const p=engine.n.authoringProject,packet=engine.n.authoringPublishing.prepare({assemblyId}),points=[];
 for(const node of packet.assembly.nodes.filter(n=>n.included&&n.meshId)){
  const mesh=structuredClone(p.getDocument(node.meshId).content),animation=node.animationIds.length?p.getDocument(node.animationIds[0]).content:null;
  const sample=animation?engine.n.authoringAnimation.sample(node.animationIds[0],animation.clips[0].id,time):{pose:{},weights:{}};
  if(node.shapeId)for(const key of p.getDocument(node.shapeId).content.keys)for(const v of mesh.vertices){const weight=sample.weights[key.id]??key.weight,delta=key.deltas[v.id];if(delta)v.position=v.position.map((x,i)=>x+delta[i]*weight);}
  const vertices=node.skinId?engine.n.authoringSkin.deform(p.getDocument(node.skinId).content,mesh,p.getDocument(node.rigId).content,sample.pose).vertices:mesh.vertices;
  for(const v of vertices){const m=node.worldMatrix,a=v.position;points.push([0,1,2].map(i=>(m[i]*a[0]+m[4+i]*a[1]+m[8+i]*a[2]+m[12+i])*packet.assembly.units.metersPerUnit));}
 }
 return points;
}
export function pointCloudError(a,b){const directed=(x,y)=>Math.max(...x.map(p=>Math.min(...y.map(q=>Math.hypot(...p.map((v,i)=>v-q[i]))))));return Math.max(directed(a,b),directed(b,a));}
