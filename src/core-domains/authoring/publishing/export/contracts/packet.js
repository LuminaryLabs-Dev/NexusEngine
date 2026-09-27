import { fail, issue, report } from '../../../contracts/io.js';
export function inspectPacket(packet,format){
 if(packet?.schema!=='nexusengine.authoring-delivery/1'||!/^sha256:[0-9a-f]{64}$/.test(packet.hash??''))throw fail('AUTHORING_EXPORT_PACKET','Expected an evaluated delivery packet.');
 const issues=[];if(!packet.assembly.nodes.some(n=>n.included&&n.meshId))issues.push(issue('AUTHORING_EXPORT_EMPTY','No mesh selected.'));
 if(format==='usdz'){
  for(const node of packet.assembly.nodes.filter(n=>n.included)){
   const clips=node.animationIds.flatMap(id=>packet.animations.find(a=>a.id===id).clips);
   if(clips.length>1)issues.push(issue('AUTHORING_USD_CLIP_PROFILE','USD profile currently allows one active clip per instance.'));
   if(clips.some(c=>c.tracks.some(t=>t.interpolation==='STEP')))issues.push(issue('AUTHORING_USD_STEP_PROFILE','STEP curves require an explicit USD held-stage profile.'));
  }
  if(packet.meshes.some(m=>m.colors.some(n=>n!==1)))issues.push(issue('USD_VERTEX_COLOR_APPEARANCE','Vertex colors are exported as standard primvars; material-network modulation is not proven.','warning'));
 }
 if(format==='fbx'&&packet.materials.some(m=>Object.values(m.pbr.textures).some(b=>b.wrapS==='MIRRORED_REPEAT'||b.wrapT==='MIRRORED_REPEAT')))
  issues.push(issue('AUTHORING_FBX_WRAP_PROFILE','Mirrored repeat needs a texture/UV bake; the canonical FBX wrap modes are repeat or clamp.'));
 return report(issues,{sourcePacket:packet.hash,format});
}
