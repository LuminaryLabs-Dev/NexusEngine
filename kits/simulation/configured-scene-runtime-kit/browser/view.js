import * as THREE from "three";
// Optional Three.js host adapter. No authoring UI, OrbitControls or transform gizmos.
export function createView(container, onSelect = () => {}) {
 const scene=new THREE.Scene();scene.background=new THREE.Color("#142b40");scene.fog=new THREE.Fog("#142b40",70,240);
 const camera=new THREE.PerspectiveCamera(42,1,.1,500);
 const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;container.append(renderer.domElement);
 scene.add(new THREE.HemisphereLight(0xc6e6ff,0x28352b,2.6));
 const light=new THREE.DirectionalLight(0xffedcf,3.2);light.position.set(-12,30,10);light.castShadow=true;light.shadow.mapSize.set(2048,2048);
 Object.assign(light.shadow.camera,{left:-45,right:45,top:35,bottom:-45,near:1,far:130});light.shadow.bias=-.0004;scene.add(light);
 const group=new THREE.Group(),effects=new THREE.Group();scene.add(group,effects);let packet,frame;
 const click=e=>{const r=renderer.domElement.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const hit=ray.intersectObjects(group.children,false).find(h=>h.object.visible&&h.object.userData.meshId);if(hit)onSelect(hit.object.userData.id);};
 renderer.domElement.addEventListener("click",click);
 function clear(){for(const o of [...group.children]){group.remove(o);o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}}
  function load(data) {
    packet = data;
    clear();
    for (const n of packet.assembly.nodes.filter(
      (n) => n.included && n.visible,
    )) {
      let geo, materials;
      if (n.meshId) {
        const source = packet.meshes.find((m) => m.id === n.meshId);
        geo = new THREE.BufferGeometry();
        geo.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(source.positions, 3),
        );
        geo.setIndex(source.indices);
        if (source.normals?.length)
          geo.setAttribute(
            "normal",
            new THREE.Float32BufferAttribute(source.normals, 3),
          );
        else geo.computeVertexNormals();
        materials = n.materials.map((id) => {
          const p = packet.materials.find((m) => m.id === id)?.pbr ?? {},
            c = p.baseColor ?? [0.5, 0.65, 0.8, 1];
          return new THREE.MeshStandardMaterial({
            color: new THREE.Color(...c.slice(0, 3)),
            roughness: p.roughness ?? 0.6,
            metalness: p.metallic ?? 0,
          });
        });
        if (!materials.length)
          materials = [new THREE.MeshStandardMaterial({ color: 0x7596aa })];
        for (const g of source.groups ?? [])
          geo.addGroup(g.start, g.count, g.material);
      } else {
        geo = new THREE.OctahedronGeometry(0.22);
        materials = [
          new THREE.MeshBasicMaterial({ color: 0x8bdcff, wireframe: true }),
        ];
      }
      const object = new THREE.Mesh(
        geo,
        materials.length === 1 ? materials[0] : materials,
      );
      object.castShadow = object.receiveShadow = !!n.meshId;
      object.applyMatrix4(new THREE.Matrix4().fromArray(n.worldMatrix));
      object.userData = { id: n.id, meshId: n.meshId };
      group.add(object);
    }
  }

 function resize(){const r=container.getBoundingClientRect();renderer.setSize(r.width,r.height);camera.aspect=r.width/Math.max(1,r.height);camera.updateProjectionMatrix();}
 const observer=new ResizeObserver(resize);observer.observe(container);resize();
 function render(){renderer.render(scene,camera);frame=requestAnimationFrame(render);}render();
 return {load,objects:group.children,camera,effects,
 play(){for(const o of group.children)if(!o.userData.meshId)o.visible=false;},
    environment(ocean = false) {
      scene.background = new THREE.Color(ocean ? "#9dc5e0" : "#142b40");
      scene.fog.color.copy(scene.background);
      scene.fog.near = ocean ? 130 : 70;
      scene.fog.far = ocean ? 400 : 240;

      if (ocean && !scene.getObjectByName("scene-sea")) {
        const sea = new THREE.Mesh(
          new THREE.PlaneGeometry(2000, 2000),
          new THREE.MeshStandardMaterial({
            color: 0x247eb3,
            roughness: 0.32,
            metalness: 0.25,
          }),
        );
        sea.rotation.x = -Math.PI / 2;
        sea.position.y = -2;
        sea.name = "scene-sea";
        scene.add(sea);
      }
      const sea = scene.getObjectByName("scene-sea");
      if (sea && !sea.material.normalMap) {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 128;
        const ctx = canvas.getContext("2d"),
          pixels = ctx.createImageData(128, 128);
        for (let y = 0; y < 128; y++)
          for (let x = 0; x < 128; x++) {
            const u = (x / 128) * Math.PI * 2,
              v = (y / 128) * Math.PI * 2;
            const n = new THREE.Vector3(
                0.22 * Math.cos(3 * u + 2 * v) + 0.1 * Math.cos(7 * u - v),
                0.2 * Math.cos(2 * v + u) + 0.08 * Math.cos(5 * v - 3 * u),
                1,
              ).normalize(),
              i = (y * 128 + x) * 4;
            pixels.data[i] = (n.x * 0.5 + 0.5) * 255;
            pixels.data[i + 1] = (n.y * 0.5 + 0.5) * 255;
            pixels.data[i + 2] = (n.z * 0.5 + 0.5) * 255;
            pixels.data[i + 3] = 255;
          }
        ctx.putImageData(pixels, 0, 0);
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(160, 160);
        sea.material.normalMap = texture;
        sea.material.normalScale.set(0.45, 0.45);
        sea.material.needsUpdate = true;
      }
      if (sea) sea.visible = ocean;
    },

 dispose(){cancelAnimationFrame(frame);observer.disconnect();renderer.domElement.removeEventListener("click",click);clear();const sea=scene.getObjectByName("scene-sea");if(sea){sea.geometry.dispose();sea.material.normalMap?.dispose();sea.material.dispose();}renderer.dispose();renderer.domElement.remove();}
 };
}
