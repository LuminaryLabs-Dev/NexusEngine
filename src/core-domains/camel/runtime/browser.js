import {validateWire} from './wire.js';
let loading;
const fail = (code, message) => Object.assign(new Error(message), {code});
export async function loadBrowserRuntime() {
  if (!loading) loading = createRuntime().catch(error => {loading = null; throw error;});
  return loading;
}
async function fetchArtifact(path, format) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(new URL(path, import.meta.url), {signal: controller.signal});
    if (!response.ok) throw new Error(`Camel artifact fetch failed: ${response.status}`);
    return await response[format]();
  } catch (error) {
    if (controller.signal.aborted) throw fail('CAMEL_TIMEOUT', 'Camel runtime artifact fetch timed out');
    throw error;
  } finally {clearTimeout(timer);}
}
async function createRuntime() {
  if (typeof Worker !== 'function' || typeof WebAssembly !== 'object' || !globalThis.crypto?.subtle) throw fail('CAMEL_TARGET_UNAVAILABLE', 'Camel browser runtime requires module workers, WebAssembly and Web Crypto');
  const manifest = await fetchArtifact('artifacts/browser-integrity.json', 'json');
  const bytes = await fetchArtifact('artifacts/camel-browser.wasm', 'arrayBuffer');
  const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(v => v.toString(16).padStart(2, '0')).join('');
  if (digest !== manifest.sha256 || bytes.byteLength !== manifest.bytes) throw fail('CAMEL_INTEGRITY', 'Camel browser artifact integrity mismatch');
  const jobs = new Map(), requests = new Map();
  function finish(id, error, result) {
    const job = jobs.get(id);
    if (!job) return false;
    jobs.delete(id);
    clearTimeout(job.timer);
    job.worker.terminate();
    for (const [key, value] of requests) if (value.job === id) requests.delete(key);
    error ? job.reject(error) : job.resolve(JSON.stringify(result));
    return true;
  }
  return {
    execute(json, callback) {
      const request = JSON.parse(json);
      validateWire(request);
      if (jobs.has(request.id)) throw new Error('Duplicate Camel browser job');
      const worker = new Worker(new URL('./browser-worker.js', import.meta.url), {type: 'module', name: 'Camel Rust interpreter'});
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => finish(request.id, fail('CAMEL_TIMEOUT', 'Camel browser wall-clock budget exhausted; worker terminated')), request.timeoutMs ?? 30000);
        jobs.set(request.id, {worker, resolve, reject, timer});
        worker.onerror = event => {event.preventDefault(); finish(request.id, new Error(event.message || 'Camel worker failed'));};
        worker.onmessageerror = () => finish(request.id, new Error('Camel worker message decoding failed'));
        worker.onmessage = ({data}) => {
          if (!jobs.has(request.id)) return;
          try {
            if (data?.type === 'result') {validateWire(data.result); finish(request.id, null, data.result);}
            else if (data?.type === 'error') finish(request.id, new Error(String(data.error)));
            else if (data?.type === 'log') callback(null, JSON.stringify({kind: 'log', payload: String(data.payload)}));
            else if (data?.type === 'request') {
              if (requests.size >= 1024 || [...requests.values()].some(v => v.job === request.id)) throw new Error('Camel host request queue exceeded');
              validateWire(data.payload);
              if (typeof data.id !== 'string' || !data.id.startsWith(`${request.id}:host:`) || !['nexus','discover','poll','model','input','update'].includes(data.kind)) throw new Error('Malformed Camel host request');
              requests.set(data.id, {job: request.id, worker});
              callback(null, JSON.stringify({id: data.id, kind: data.kind, payload: data.payload}));
            } else throw new Error('Unknown Camel worker packet');
          } catch (error) {finish(request.id, error);}
        };
        try {worker.postMessage({type: 'start', request, bytes});}
        catch (error) {finish(request.id, error);}
      });
    },
    reply(id, json) {
      const pending = requests.get(id);
      if (!pending || !jobs.has(pending.job)) return false;
      const response = JSON.parse(json);
      validateWire(response);
      requests.delete(id);
      try {pending.worker.postMessage({type: 'reply', id, response}); return true;}
      catch (error) {finish(pending.job, error); return false;}
    },
    cancel(id) {return finish(id, fail('CAMEL_CANCELLED', 'Camel browser execution cancelled; suspended session discarded'));}
  };
}
