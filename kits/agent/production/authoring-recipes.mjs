export { authorBlockoutAsset } from './blockout-recipes.mjs';
// Example decisions compose native modeling operations; the model still owns technique selection.
export const AUTHORING_RECIPES=[
 {id:'hinged-door',method:'profiled-panel-and-swept-hardware',axis:'Y',parameters:['width','height','depth','thickness','gap','angle','duration'],choices:['Reuse/import an existing door when suitable.','For a new hard-surface door: chamfer convex blanks, inset/extrude the panel, sweep a curved pull, articulate the completed mesh.'],gates:['profile and silhouette','edge highlights','hardware ergonomics','motion','consumer roundtrip']},
 {id:'lidded-chest',method:'hollow-extruded-body-and-profiled-lid',axis:'X',parameters:['width','height','depth','thickness','gap','angle','duration'],choices:['Use one inset/extruded shell for continuous interior surfaces.','Shape the lid and tapered latch separately; bevel convex components before attributes.'],gates:['hollow shell and rim','lid profile','centered latch','motion','consumer roundtrip']}
];
export async function authorHingedAsset(kit,options={},onStage=async()=>{}){
 const variant=options.variant??'hinged-door',door=variant==='hinged-door';if(!AUTHORING_RECIPES.some(r=>r.id===variant))throw Error('Unknown recipe.');
 const p={width:door?1:1.2,height:door?2.1:.6,depth:door?.18:.7,thickness:.06,gap:.03,angle:door?100:95,duration:1,...options};
 const id=options.id??(door?'door':'chest');if(!/^[a-z][a-z0-9-]{0,40}$/.test(id))throw Error('Use a short lowercase asset id.');
 for(const key of ['width','height','depth','thickness','gap','duration'])if(!Number.isFinite(p[key])||p[key]<=0||p[key]>20)throw Error('Invalid '+key);
 if(!Number.isFinite(p.angle)||p.angle<=0||p.angle>110||p.gap>=Math.min(p.width,p.height,p.depth)/3||p.thickness>=Math.min(p.width,p.height,p.depth)/2)throw Error('Invalid clearance, thickness or angle.');
 if((await kit.call('production.read')).result.documents.some(d=>d.id.startsWith(id+'-')))throw Error('Asset ID already exists.');
 const discovery=(await kit.call('production.discover')).result;for(const op of ['mesh.cube','mesh.create','mesh.primitive','mesh.transform','mesh.topology','mesh.attribute','curve.set','curve.sweep','uv.unwrap','material.set','rig.set','skin.bind','animation.set','assembly.set'])if(!discovery.tools.some(t=>t.id===op||t.name===op))throw Error('Missing native operation '+op);
 let sequence=0,lastContext;const call=async(n,a={})=>{const r=await kit.call(n,a);lastContext=r.after;if(!r.ok)throw Error(JSON.stringify(r));return r.result;};
 async function command(operation,args,selection){const epoch=lastContext?.epoch??(await call('production.status')).context.epoch;const request={requestId:`${id}-model-${++sequence}`,epoch,operations:[{id:operation,args}]};if(operation==='mesh.topology'||operation==='curve.sweep'){await call('production.author',{request,selection,preview:true});}return call('production.author',{request,...(selection?{selection}:{})});}
 const doc=async meshId=>(await call('production.read',{id:meshId})).document;
 const hinge=door?[-p.width/2,0,p.depth/2+p.thickness/2+p.gap]:[0,p.height+p.gap,-p.depth/2],nodes=[],parts=[],decisions=[];
 const add=(name,moving,material)=>{const meshId=`${id}-${name}`;nodes.push({id:meshId+'-node',name:meshId,meshId,...(moving?{transform:{translation:hinge}}:{})});parts.push({name:meshId,moving,material});return meshId;};
 async function box(name,dims,center,moving=false,material='body'){const meshId=add(name,moving,material);await command('mesh.cube',{id:meshId,size:2});await command('mesh.transform',{id:meshId,expectedRevision:(await doc(meshId)).revision,scale:dims.map(x=>x/2),translation:center});return meshId;}
 const assemblyId=`${id}-scene`;
 async function assemble(){const prior=(await call('production.read')).documents.find(d=>d.id===assemblyId);await command('assembly.set',{id:assemblyId,...(prior?{expectedRevision:prior.revision}:{}),content:{units:{metersPerUnit:1,upAxis:'Y',handedness:'right'},nodes}});}
 async function topology(meshId,parameters,selection){await command('mesh.topology',{id:meshId,expectedRevision:(await doc(meshId)).revision,parameters},selection);}
 async function face(meshId,axis,sign){const info=await call('production.inspect_geometry',{meshId,limit:100});const candidates=info.faces.filter(f=>f.normal[axis]*sign>.999);if(!candidates.length)throw Error('No planar target face in inspection page.');return candidates.sort((a,b)=>sign*(b.center[axis]-a.center[axis]))[0].id;}
 async function selectFace(meshId,axis,sign){return call('production.select_geometry',{meshId,expectedRevision:(await doc(meshId)).revision,mode:'face',ids:[await face(meshId,axis,sign)]});}
 async function inset(meshId,axis,sign,factor){const selection=await selectFace(meshId,axis,sign);await topology(meshId,{operation:'inset',factor},selection);}
 async function extrude(meshId,axis,sign,offset){const selection=await selectFace(meshId,axis,sign);await topology(meshId,{operation:'extrude',offset},selection);}
 const brief={id,variant,assemblyId,parameters:p,hinge,axis:door?'Y':'X',angle:-p.angle,parts,decisions,correction:null};
 if(door){
  await box('left-jamb',[.1,p.height,p.depth],[-p.width/2-.05,p.height/2,0]);await box('right-jamb',[.1,p.height,p.depth],[p.width/2+.05,p.height/2,0]);await box('header',[p.width+.2,.1,p.depth],[0,p.height+.05,0]);await box('panel',[p.width-2*p.gap,p.height-2*p.gap,p.thickness],[p.width/2,p.height/2,0],true,'panel');
 }else{await box('body',[p.width,p.height,p.depth],[0,p.height/2,0]);await box('lid',[p.width,p.thickness,p.depth],[0,p.thickness/2,p.depth/2],true,'panel');}
 await assemble();await onStage('blockout',brief);
 // Chamfer only still-convex components, before topology recesses, UVs or skinning.
 for(const part of parts)await topology(part.name,{operation:'bevel',width:Math.min(p.thickness*.12,.009),prefix:'soft'});
 if(door){
  const panel=`${id}-panel`;await inset(panel,2,1,.80);await extrude(panel,2,1,[0,0,-p.thickness*.18]);
  // Surface preparation identifies the recessed cap from inspected normals and depth.
  decisions.push({part:panel,technique:'convex bevel -> face inset -> inward extrusion',reason:'Continuous recessed panel and readable edge highlights; topology edits precede UVs.'});
  const handle=add('handle',true,'metal'),shift=options.demonstrateCorrection?.35:0,cy=p.height*.5+shift,x=p.width-.13,z=p.thickness/2+.025;
  const points=[[x,cy-.16,z],[x,cy-.12,z+.07],[x,cy+.12,z+.07],[x,cy+.16,z]].map((position,i)=>({id:'p'+i,position,in:position,out:position}));
  // A cubic Bezier arch with tangents aligned along each segment.
  points[0].out=[x,cy-.16,z+.065];points[1].in=[x,cy-.16,z+.07];points[1].out=[x,cy-.04,z+.07];points[2].in=[x,cy+.04,z+.07];points[2].out=[x,cy+.16,z+.07];points[3].in=[x,cy+.16,z+.065];
  await command('curve.set',{id:`${id}-pull-path`,content:{type:'bezier',closed:false,points,resolution:6,tolerance:.001}});await command('curve.sweep',{id:`${id}-pull-path`,outputId:handle,parameters:{radius:.017,sides:10,caps:true}});
  for(const sign of [-1,1]){const mount=await box(sign<0?'lower-mount':'upper-mount',[.07,.045,.035],[x,p.height*.5+sign*.16,z-.005],true,'metal');await topology(mount,{operation:'bevel',width:.005});}
  decisions.push({part:handle,technique:'Bezier curve + capped circular sweep',reason:'A shaped ergonomic pull needs curved cross-sections and an editable path.'});
  brief.correction={meshId:handle,axis:1,target:p.height*.5,description:'Pull center must align with the mounting blocks at half door height.',injected:!!options.demonstrateCorrection};
 }else{
  const body=`${id}-body`;await inset(body,1,1,.84);await extrude(body,1,1,[0,-(p.height-p.thickness*1.4),0]);
  const lid=`${id}-lid`;await inset(lid,1,1,.80);await extrude(lid,1,1,[0,p.thickness*.22,0]);
  decisions.push({part:body,technique:'convex blank chamfer -> top inset -> downward extrusion',reason:'One connected shell supplies a real interior, rim and floor.'},{part:lid,technique:'beveled lid with inset and raised cap',reason:'A stepped lid profile separates the edge from the top surface.'});
  const latch=add('latch',true,'metal'),cx=options.demonstrateCorrection?.28:0,cy=-.035,cz=p.depth+.014;
  const vertices=[[-.04,-.065,-.012],[.04,-.065,-.012],[.075,.065,-.012],[-.075,.065,-.012],[-.04,-.065,.012],[.04,-.065,.012],[.075,.065,.012],[-.075,.065,.012]].map((v,i)=>({id:'v'+i,position:[v[0]+cx,v[1]+cy,v[2]+cz]}));
  const faces=[[0,3,2,1],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]].map((v,i)=>({id:'f'+i,vertices:v.map(j=>'v'+j)}));await command('mesh.create',{id:latch,mesh:{vertices,faces,attributes:[]}});await topology(latch,{operation:'bevel',width:.004});
  decisions.push({part:latch,technique:'explicit tapered mesh + convex chamfer',reason:'The latch tapers toward its lower end rather than using a scaled box.'});
  brief.correction={meshId:latch,axis:0,target:0,description:'Latch must be centered on the lid and front wall.',injected:!!options.demonstrateCorrection};
 }
 // Separate knuckles make a readable mechanical axis; all are native cylindrical meshes.
 for(let i=0;i<3;i++){
  const meshId=add('hinge-'+i,false,'metal');await command('mesh.primitive',{id:meshId,parameters:{type:'cylinder',radius:.035,height:.13,segments:12}});
  const position=door?[hinge[0],p.height*(.2+.3*i),hinge[2]]:[(-.36+.36*i)*p.width,p.height+p.gap,-p.depth/2];
  await command('mesh.transform',{id:meshId,expectedRevision:(await doc(meshId)).revision,translation:position,...(!door?{rotation:[0,0,Math.sin(Math.PI/4),Math.cos(Math.PI/4)]}:{})});
 }
 for(const [name,color,metallic,roughness] of [['body',[.12,.18,.22,1],.15,.5],['panel',door?[.24,.48,.5,1]:[.5,.28,.11,1],.05,.42],['metal',[.65,.69,.72,1],.8,.28]])await command('material.set',{id:`${id}-${name}-material`,content:{baseColor:color,metallic,roughness}});
 for(const node of nodes){const d=await doc(node.meshId);if(!d.content.attributes.some(a=>a.id==='uv0'))await command('uv.unwrap',{id:node.meshId,expectedRevision:d.revision,parameters:{resolution:256,padding:2}});node.materials=[`${id}-${parts.find(p=>p.name===node.meshId).material}-material`];}
 await command('rig.set',{id:`${id}-rig`,content:{bones:[{id:'hinge',name:`${id} hinge`,parent:null,rest:{},length:.2}]}});
 const axis=door?[0,1,0]:[1,0,0],angle=-p.angle*Math.PI/180;
 await command('animation.set',{id:`${id}-animation`,content:{rigId:`${id}-rig`,clips:[{id:`${id}-open`,name:`${id} open`,duration:p.duration,tracks:[{id:'hinge-rotation',target:'hinge',property:'rotation',interpolation:'LINEAR',keys:[0,.5,1].map(t=>({time:t*p.duration,value:[...axis.map(v=>v*Math.sin(angle*t/2)),Math.cos(angle*t/2)]}))}]}]}});
 for(const node of nodes)if(parts.find(p=>p.name===node.meshId).moving){const skinId=node.meshId+'-skin';await command('skin.bind',{id:skinId,meshId:node.meshId,rigId:`${id}-rig`});Object.assign(node,{rigId:`${id}-rig`,skinId,animationIds:[`${id}-animation`]});}
 await assemble();if(door&&!options.demonstrateCorrection)await refinePanelAppearance(kit,brief);await onStage('articulation',brief);return brief;
}
export async function correctHingedAsset(kit,brief){
 const {meshId,axis,target}=brief.correction,info=(await kit.call('production.inspect_geometry',{meshId})).result;
 const observed=(info.summary.bounds.min[axis]+info.summary.bounds.max[axis])/2,delta=target-observed;
 const selection=(await kit.call('production.select_geometry',{meshId,expectedRevision:info.revision,mode:'object',ids:[]})).result;
 const context=(await kit.call('production.status')).result.context,translation=[0,0,0];translation[axis]=delta;
 const operations=[{id:'mesh.transform',args:{id:meshId,expectedRevision:info.revision,translation,selection:{mode:selection.mode,ids:selection.ids}}}];
 let curveDelta=null;
 if(brief.axis==='Y'){
  const curve=(await kit.call('production.read',{id:brief.id+'-pull-path'})).result.document;
  const values=curve.content.points.map(p=>p.position[axis]);curveDelta=target-(Math.min(...values)+Math.max(...values))/2;
  const shift=v=>v.map((n,i)=>n+(i===axis?curveDelta:0));
  operations.push({id:'curve.set',args:{id:curve.id,expectedRevision:curve.revision,content:{...curve.content,points:curve.content.points.map(p=>({...p,position:shift(p.position),in:shift(p.in),out:shift(p.out)}))}}});
 }
 const request={requestId:`${brief.id}-paired-correction-${info.revision}`,epoch:context.epoch,operations};
 // Native revision guards make the mesh and its editable construction path one atomic edit.
 const preview=await kit.call('production.author',{request,preview:true});const committed=await kit.call('production.author',{request});
 return {meshId,observed,target,delta,curveDelta,reason:brief.correction.description,preview:preview.requestId,receipt:committed.requestId};
}

export async function refinePanelAppearance(kit,brief){
 if(brief.axis!=='Y')return null;
 const call=async(n,a={})=>(await kit.call(n,a)).result;
 const meshId=brief.id+'-panel',info=await call('production.inspect_geometry',{meshId,limit:100});
 const cap=info.faces.filter(f=>f.normal[2]>.999).sort((a,b)=>a.center[2]-b.center[2])[0];
 const mesh=(await call('production.read',{id:meshId})).document,assembly=(await call('production.read',{id:brief.assemblyId})).document;
 const material=brief.id+'-recess-material',prior=(await call('production.read')).documents.find(d=>d.id===material);
 const operations=[{id:'material.set',args:{id:material,...(prior?{expectedRevision:prior.revision}:{}),content:{baseColor:[.085,.23,.25,1],metallic:.05,roughness:.5}}},
  {id:'mesh.attribute',args:{id:meshId,expectedRevision:mesh.revision,attribute:{id:'material',domain:'face',arity:1,values:Object.fromEntries(mesh.content.faces.map(f=>[f.id,[f.id===cap.id?1:0]]))}}},
  {id:'assembly.set',args:{id:assembly.id,expectedRevision:assembly.revision,content:{...assembly.content,nodes:assembly.content.nodes.map(n=>n.meshId===meshId?{...n,materials:[brief.id+'-panel-material',material]}:n)}}}];
 const request={requestId:brief.id+'-panel-contrast-'+mesh.revision,epoch:(await call('production.status')).context.epoch,operations};
 await kit.call('production.author',{request,preview:true});const receipt=await kit.call('production.author',{request});
 return {reason:'The recessed cap was difficult to read head-on under neutral light; separate its material while retaining the native profile.',meshId,cap:cap.id,receipt:receipt.requestId};
}
