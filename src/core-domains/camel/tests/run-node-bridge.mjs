// Transport regression fixture, not real-browser evidence. No shim ships in production.
import {Worker as NodeWorker} from 'node:worker_threads';
import {readFile} from 'node:fs/promises';
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url, ...args) => String(url).startsWith('file:') ? new Response(await readFile(url)) : originalFetch(url, ...args);
globalThis.Worker = class {
  constructor(url) {
    this.worker = new NodeWorker(new URL('./node-browser-worker.mjs', import.meta.url), {workerData: {module: String(url)}});
    this.worker.on('message', data => this.onmessage?.({data}));
    this.worker.on('error', error => this.onerror?.({message: error.message, preventDefault() {}}));
  }
  postMessage(data) {this.worker.postMessage(data);}
  terminate() {this.worker.terminate();}
};
const {runBrowserSuite} = await import('./browser-suite.js');
console.log(JSON.stringify(await runBrowserSuite(), null, 2));
