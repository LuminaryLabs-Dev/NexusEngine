import {parentPort,workerData} from 'node:worker_threads';
const queued=[];let ready=false;
globalThis.self={postMessage:data=>parentPort.postMessage(data)};
parentPort.on('message',data=>{if(ready)self.onmessage({data});else queued.push(data);});
await import(workerData.module);ready=true;for(const data of queued)self.onmessage({data});
