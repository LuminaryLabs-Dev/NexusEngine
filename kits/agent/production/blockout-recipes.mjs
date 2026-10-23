// Recipes compose discovered native Project operations. They never replace Core geometry.
export const AUTHORING_RECIPES = [
  {id:'hinged-door',method:'rigid-hinge',axis:'Y',units:'meters',parameters:['width','height','depth','thickness','gap','angle','duration'],stages:['brief','blockout','surface','articulation','inspect','publish']},
  {id:'lidded-chest',method:'rigid-hinge',axis:'X',units:'meters',parameters:['width','height','depth','thickness','gap','angle','duration'],stages:['brief','blockout','surface','articulation','inspect','publish']}
];
export async function authorBlockoutAsset(kit, options={}, onStage=async()=>{}) {
  const variant=options.variant??'hinged-door', door=variant==='hinged-door';
  if(!AUTHORING_RECIPES.some(r=>r.id===variant))throw Error('Unknown authoring recipe.');
  const p={width:door?1:1.2,height:door?2.1:.6,depth:door?.18:.7,thickness:.06,gap:.03,angle:door?100:95,duration:1,...options};
  const id=options.id??(door?'door':'chest');
  if(!/^[a-z][a-z0-9-]{0,40}$/.test(id))throw Error('Use a short lowercase asset id.');
  for(const k of ['width','height','depth','thickness','gap','duration'])if(!Number.isFinite(p[k])||p[k]<=0||p[k]>20)throw Error(`Invalid ${k}.`);
  if(!Number.isFinite(p.angle)||p.angle<=0||p.angle>110||p.gap>=Math.min(p.width,p.height,p.depth)/3||p.thickness>=Math.min(p.width,p.height,p.depth)/2)throw Error('Invalid clearance, thickness or angle.');
  const discovery=(await kit.call('production.discover')).result;
  for(const op of ['mesh.cube','mesh.transform','uv.unwrap','material.set','rig.set','skin.bind','animation.set','assembly.set'])if(!discovery.tools.some(t=>t.id===op||t.name===op))throw Error(`Missing native operation ${op}.`);
  if((await kit.call('production.read')).result.documents.some(d=>d.id.startsWith(id+'-')))throw Error('Asset id already exists; choose a fresh id.');
  let sequence=0;
  async function command(operation,args){const epoch=(await kit.call('production.status')).result.context.epoch;const r=await kit.call('production.author',{request:{requestId:`${id}-recipe-${++sequence}`,epoch,operations:[{id:operation,args}]}});if(!r.ok)throw Error(JSON.stringify(r));return r;}
  const nodes=[],parts=[];
  const hinge=door?[-p.width/2,0,p.depth/2+p.thickness/2+p.gap]:[0,p.height+p.gap,-p.depth/2];
  async function box(name,dimensions,center,moving=false,material='body'){
    const meshId=`${id}-${name}`;await command('mesh.cube',{id:meshId,size:2});
    const doc=(await kit.call('production.read',{id:meshId})).result.document;
    await command('mesh.transform',{id:meshId,expectedRevision:doc.revision,scale:dimensions.map(x=>x/2),translation:center});
    const node={id:`${meshId}-node`,name:meshId,meshId,...(moving?{transform:{translation:hinge}}:{})};
    nodes.push(node);parts.push({name:meshId,dimensions,center,moving,material});
  }
  if(door){
    const bar=.1;
    await box('left-jamb',[bar,p.height,p.depth],[-p.width/2-bar/2,p.height/2,0]);
    await box('right-jamb',[bar,p.height,p.depth],[p.width/2+bar/2,p.height/2,0]);
    await box('header',[p.width+2*bar,bar,p.depth],[0,p.height+bar/2,0]);
    await box('panel',[p.width-2*p.gap,p.height-2*p.gap,p.thickness],[p.width/2,p.height/2,0],true,'panel');
  }else{
    const t=p.thickness;
    await box('base',[p.width,t,p.depth],[0,t/2,0]);
    for(const sign of [-1,1])await box(sign<0?'back-wall':'front-wall',[p.width,p.height-t,t],[0,(p.height+t)/2,sign*(p.depth-t)/2]);
    for(const sign of [-1,1])await box(sign<0?'left-wall':'right-wall',[t,p.height-t,p.depth-2*t],[sign*(p.width-t)/2,(p.height+t)/2,0]);
    await box('lid',[p.width,p.thickness,p.depth],[0,p.thickness/2,p.depth/2],true,'panel');
  }
  const assemblyId=`${id}-scene`;
  await command('assembly.set',{id:assemblyId,content:{units:{metersPerUnit:1,upAxis:'Y',handedness:'right'},nodes}});
  const brief={id,variant,assemblyId,parameters:p,hinge,axis:door?'Y':'X',angle:-p.angle,parts};
  await onStage('blockout',brief);
  // Large silhouette first; secondary moving hardware shares the same hinge.
  if(door){
    await box('handle',[.035,.25,.035],[p.width-.13,p.height*.5,p.thickness/2+.07],true,'metal');
    for(const y of [-.1,.1])await box(y<0?'lower-mount':'upper-mount',[.065,.04,.07],[p.width-.13,p.height*.5+y,p.thickness/2+.035],true,'metal');
  }else await box('latch',[.12,.12,.025],[0,0,p.depth+.013],true,'metal');
  for(const [name,color,metallic,roughness] of [['body',[.12,.18,.22,1],.15,.6],['panel',door?[.24,.48,.5,1]:[.5,.28,.11,1],.05,.5],['metal',[.65,.69,.72,1],.8,.25]])await command('material.set',{id:`${id}-${name}-material`,content:{baseColor:color,metallic,roughness}});
  for(const node of nodes){const part=parts.find(p=>p.name===node.meshId);const doc=(await kit.call('production.read',{id:node.meshId})).result.document;await command('uv.unwrap',{id:node.meshId,expectedRevision:doc.revision,parameters:{resolution:128,padding:2}});node.materials=[`${id}-${part.material}-material`];}
  await command('rig.set',{id:`${id}-rig`,content:{bones:[{id:'hinge',name:`${id} hinge`,parent:null,rest:{},length:.2}]}});
  const axis=door?[0,1,0]:[1,0,0],radians=-p.angle*Math.PI/180;
  const rotation=t=>[...axis.map(v=>v*Math.sin(radians*t/2)),Math.cos(radians*t/2)];
  await command('animation.set',{id:`${id}-animation`,content:{rigId:`${id}-rig`,clips:[{id:`${id}-open`,name:`${id} open`,duration:p.duration,tracks:[{id:'hinge-rotation',target:'hinge',property:'rotation',interpolation:'LINEAR',keys:[0,.5,1].map(t=>({time:t*p.duration,value:rotation(t)}))}]}]}});
  for(const node of nodes)if(parts.find(p=>p.name===node.meshId).moving){const skinId=`${node.meshId}-skin`;await command('skin.bind',{id:skinId,meshId:node.meshId,rigId:`${id}-rig`});Object.assign(node,{rigId:`${id}-rig`,skinId,animationIds:[`${id}-animation`]});}
  const existing=(await kit.call('production.read',{id:assemblyId})).result.document;
  await command('assembly.set',{id:assemblyId,expectedRevision:existing.revision,content:{units:{metersPerUnit:1,upAxis:'Y',handedness:'right'},nodes}});
  await onStage('articulation',brief);return brief;
}
