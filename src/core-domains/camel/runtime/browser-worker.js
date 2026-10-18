import {createAsyncifiedInterpreter} from './asyncify.js';
let started = false, sequence = 0, logCount = 0, logBytes = 0;
const pending = new Map();
self.onmessage = async ({data}) => {
  if (data?.type === 'reply') {
    const settle = pending.get(data.id);
    if (!settle) return;
    pending.delete(data.id);
    data.response?.ok === true ? settle.resolve(data.response.value) : settle.reject(new Error(String(data.response?.error ?? 'Host call failed')));
    return;
  }
  if (data?.type !== 'start' || started) return;
  started = true;
  try {
    const interpreter = await createAsyncifiedInterpreter(data.bytes, {
      request(packet) {
        if (pending.size) throw new Error('Concurrent Camel continuation request');
        const id = `${data.request.id}:host:${++sequence}`;
        return new Promise((resolve, reject) => {
          pending.set(id, {resolve, reject});
          self.postMessage({type: 'request', id, ...packet});
        });
      },
      onLog(payload) {
        const bytes = new TextEncoder().encode(payload).length;
        if (++logCount > 256 || bytes > 65536 || (logBytes += bytes) > 1024 * 1024) throw new Error('Camel browser log budget exceeded');
        self.postMessage({type: 'log', payload});
      }
    });
    const result = await interpreter.execute(data.request);
    self.postMessage({type: 'result', result});
  } catch (error) {
    self.postMessage({type: 'error', error: String(error?.message ?? error)});
  }
};
