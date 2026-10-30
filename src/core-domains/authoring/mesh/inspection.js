// Presentation and selection adapters over public Core services. No mesh mutation here.
export function meshDocument(engine,id){const d=engine.n.authoringProject.getDocument(id);if(d.kind!=='mesh')throw Error('Expected a mesh document.');return d;}
export function inspectGeometry(engine,{meshId,offset=0,limit=30}){
 const d=meshDocument(engine,meshId),m=d.content,summary=engine.n.authoringMesh.inspect(meshId),evaluated=engine.n.authoringMesh.evaluate(meshId,{smooth:false});
 if(!Number.isInteger(offset)||offset<0||!Number.isInteger(limit)||limit<1||limit>100)throw Error('Geometry page requires offset >= 0 and limit 1–100.');
 const vertices=new Map(m.vertices.map(v=>[v.id,v.position])),edges=new Map();
 for(const f of m.faces)for(let i=0;i<f.vertices.length;i++){const a=f.vertices[i],b=f.vertices[(i+1)%f.vertices.length],id='edge:'+JSON.stringify([a,b].sort());const e=edges.get(id)??{id,vertices:[a,b],faces:[]};e.faces.push(f.id);edges.set(id,e);}
 const faces=m.faces.slice(offset,offset+limit).map((f,j)=>{const group=evaluated.groups[offset+j];return {id:f.id,vertices:f.vertices,center:[0,1,2].map(i=>f.vertices.reduce((n,id)=>n+vertices.get(id)[i],0)/f.vertices.length),normal:evaluated.normals.slice(group.start*3,group.start*3+3)};});
 const placements=engine.n.authoringProject.listDocuments().filter(x=>x.kind==='assembly').flatMap(a=>engine.n.authoringProject.getDocument(a.id).content.nodes.filter(n=>n.meshId===meshId).map(n=>({assemblyId:a.id,nodeId:n.id,transform:n.transform,parent:n.parent??null,space:'node-local; parent chain belongs to assembly'})));
 return {meshId,revision:d.revision,hash:d.hash,context:engine.n.authoringProject.context(),space:'mesh-local units; each assembly metersPerUnit defines scale',summary,attributes:m.attributes.map(a=>({id:a.id,domain:a.domain,arity:a.arity})),placements:placements.slice(0,30),boundaryEdges:[...edges.values()].filter(e=>e.faces.length===1).length,nonManifoldEdges:[...edges.values()].filter(e=>e.faces.length>2).length,triangles:evaluated.indices.length/3,faces,edges:[...edges.values()].slice(offset,offset+limit),vertices:m.vertices.slice(offset,offset+limit),nextFaceOffset:offset+limit<m.faces.length?offset+limit:null};
}
export function selectGeometry(engine,{meshId,expectedRevision,mode,ids,action,bounds}){
 const d=meshDocument(engine,meshId);if(d.revision!==expectedRevision)throw Error('Stale mesh revision; inspect geometry again.');
 if(bounds!==undefined){
  if(ids!==undefined||mode!=='face'||!bounds||Object.keys(bounds).some(k=>!['min','max'].includes(k))||!['min','max'].every(k=>Array.isArray(bounds[k])&&bounds[k].length===3&&bounds[k].every(Number.isFinite))||bounds.min.some((n,i)=>n>bounds.max[i]))throw Error('Bounds require face mode, no explicit IDs, and finite mesh-local min/max vectors.');
  const points=new Map(d.content.vertices.map(v=>[v.id,v.position]));
  ids=[];
  for(const face of d.content.faces){
   if(face.vertices.every(id=>points.get(id).every((v,i)=>v>=bounds.min[i]&&v<=bounds.max[i])))ids.push(face.id);
   if(ids.length>500)throw Error('Bounds select more than 500 faces; use narrower bounds.');
  }
  if(!ids.length)throw Error('Bounds select no complete faces.');
 }
 if(!Array.isArray(ids)||ids.length>500||ids.some(id=>typeof id!=='string'))throw Error('Selection requires at most 500 explicit element IDs.');
 let selection={mode,ids};engine.n.authoringMesh.resolveSelection(meshId,selection);
 if(action)selection=engine.n.authoringEditing.modifyContent(d.content,selection,{action});
 if(selection.ids.length>500)throw Error('Expanded selection exceeds 500 elements; use a narrower selection.');
 const vertices=engine.n.authoringMesh.resolveSelection(meshId,selection);if(vertices.length>2000)throw Error('Selection overlay exceeds 2000 vertices.');
 const vertexIds=new Set(vertices);
 return {meshId,revision:d.revision,hash:d.hash,...engine.n.authoringProject.context(),...selection,vertices:d.content.vertices.filter(v=>vertexIds.has(v.id))};
}
export function validateSelection(engine,s){
 const d=meshDocument(engine,s.meshId),c=engine.n.authoringProject.context();
 if(s.revision!==d.revision||s.hash!==d.hash||s.epoch!==c.epoch||s.projectId!==c.projectId)throw Error('Stale selection; inspect and select the current mesh revision.');
 return selectGeometry(engine,{meshId:s.meshId,expectedRevision:d.revision,mode:s.mode,ids:s.ids});
}
export function bindSelection(engine,request,selection){
 const s=validateSelection(engine,selection),r=structuredClone(request);
 if(r.operations?.length!==1)throw Error('A revision-bound selection applies to one native operation.');
 const op=r.operations[0];if(op.args.id!==s.meshId||op.args.expectedRevision!==s.revision)throw Error('Selection target/revision must match the operation.');
 if(op.id==='mesh.topology'){
  if(op.args.parameters?.operation==='bevel'&&s.mode!=='edge')throw Error('Bevel requires an edge selection.');
  if(['inset','extrude'].includes(op.args.parameters?.operation)&&s.mode!=='face')throw Error('Inset/extrude require a face selection.');
  const key={face:'faces',edge:'edges',vertex:'vertices'}[s.mode];if(!key)throw Error('Topology requires element selection.');for(const other of ['faces','edges','vertices'])if(other!==key&&op.args.parameters?.[other]?.length)throw Error('Mixed selection domains are ambiguous.');op.args.parameters={...op.args.parameters,[key]:s.ids};
 }else if(op.id==='mesh.transform')op.args.selection={mode:s.mode,ids:s.ids};else throw Error('Selection bridge supports mesh.topology and mesh.transform.');
 return r;
}
export const MODELING_HELP={
 'mesh.topology':{workflow:'Inspect face/edge IDs, select at current revision, preview, inspect changed elements, commit.',limits:['Convex bevel precedes attributes and binding.','Inset accepts one strictly convex planar face.','Topology replaces element IDs; select again after each edit.'],recovery:'Preserve the native error. Inspect the target and choose a supported construction order; do not silently substitute a blockout.'},
 'curve.sweep':{workflow:'Create a curve document with curve.set, preview curve.sweep, then inspect the output mesh.',limits:['Sweep emits UV attributes; convex bevel is not a post-sweep operation.']}
};
