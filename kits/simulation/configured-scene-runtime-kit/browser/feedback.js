import * as THREE from "three";
// Presentation only. Effects never enter geometry, contact or project documents.
export function mountFeedback(container, view, game) {
  let reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let sound = false, audio, observed = -1, toastTime = 0;
  const bursts = [];
  const bar = document.createElement("div"); bar.className = "game-options";
  const toast = document.createElement("div"); toast.className = "game-toast"; toast.setAttribute("role", "status"); toast.hidden = true;
  const motionButton = document.createElement("button"), audioButton = document.createElement("button"), pauseButton = document.createElement("button");
  const labels = () => { motionButton.textContent = reduced ? "Effects: reduced" : "Effects: full"; audioButton.textContent = sound ? "Sound: on" : "Sound: off"; };
  motionButton.onclick = () => {reduced = !reduced; labels();};
  audioButton.onclick = () => {sound = !sound; if(sound) {audio ??= new AudioContext(); audio.resume().catch(()=>{});} labels();};
  pauseButton.textContent = "Pause / Resume"; pauseButton.onclick = () => game.pause();
  bar.append(motionButton, audioButton, pauseButton); container.append(bar,toast); labels();
  function burst(event) {
    if (!event.position || reduced) return;
    const color = ["pickup", "victory"].includes(event.type) ? 0xffd351 : 0x79e7ff;
    const count = event.type === "victory" ? 64 : 14;
    const values = [], velocities = [];
    for(let i=0;i<count;i++) { values.push(...event.position); const a=i/count*Math.PI*2; velocities.push(Math.cos(a)*1.8,1.5+(i%3)*0.4,Math.sin(a)*1.8); }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute("position",new THREE.Float32BufferAttribute(values,3));
    const material = new THREE.PointsMaterial({color,size:0.12,transparent:true,depthWrite:false});
    const points = new THREE.Points(geometry,material); view.effects.add(points); bursts.push({points,velocities,age:0});
  }
  return {
    update(state, dt) {
      if (state.elapsed !== observed && !state.paused) {
        observed = state.elapsed;
        for(const event of state.events) {
          burst(event);
          if (["pickup","checkpoint","victory","respawn"].includes(event.type)) {
            toast.textContent = {pickup:"Energy collected",checkpoint:"Checkpoint saved",victory:"Objective complete!",respawn:"Back to checkpoint"}[event.type]; toastTime=1.8; toast.hidden=false;
          }
          if(sound && audio && ["pickup","checkpoint","victory"].includes(event.type)) {
            const oscillator=audio.createOscillator(), gain=audio.createGain();
            oscillator.frequency.value=event.type==="pickup" ? 660+(state.score%5)*80 : 880;
            gain.gain.setValueAtTime(0.06,audio.currentTime);gain.gain.exponentialRampToValueAtTime(0.001,audio.currentTime+0.18);
            oscillator.connect(gain);gain.connect(audio.destination);oscillator.start();oscillator.stop(audio.currentTime+0.2);
          }
        }
      }
      if(state.paused) return;
      toastTime-=dt;if(toastTime<=0){toast.textContent="";toast.hidden=true;}
      for(let i=bursts.length-1;i>=0;i--) {
        const b=bursts[i];b.age+=dt;const a=b.points.geometry.attributes.position;
        for(let j=0;j<a.count;j++){ b.velocities[j*3+1]-=4*dt;for(let k=0;k<3;k++)a.array[j*3+k]+=b.velocities[j*3+k]*dt;}
        a.needsUpdate=true;b.points.material.opacity=Math.max(0,1-b.age);
        if(b.age>1 || reduced){view.effects.remove(b.points);b.points.geometry.dispose();b.points.material.dispose();bursts.splice(i,1);}
      }
    },
    dispose(){bar.remove();toast.remove();audio?.close().catch(()=>{});for(const b of bursts){view.effects.remove(b.points);b.points.geometry.dispose();b.points.material.dispose();}}
  };
}
