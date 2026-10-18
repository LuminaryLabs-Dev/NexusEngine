// No JS evaluator: every language operation runs in the bundled Rust interpreter.
const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', {fatal: true});
export async function createAsyncifiedInterpreter(bytes, {request, onLog = () => {}}) {
  let wasm, running = false, poisoned = false, suspended = null, response = null;
  const imports = {camel: {
    now: () => Date.now(),
    log(ptr, len) { onLog(decoder.decode(new Uint8Array(wasm.memory.buffer, ptr, len))); },
    host_request(ptr, len, output, capacity) {
      if (wasm.asyncify_get_state() === 2) {
        wasm.asyncify_stop_rewind();
        const data = response;
        response = null;
        if (!data) throw new Error('Camel rewind has no host response');
        if (data.length > capacity) return capacity + 1;
        new Uint8Array(wasm.memory.buffer, output, data.length).set(data);
        return data.length;
      }
      if (suspended) throw new Error('Camel host request reentrancy');
      const packet = JSON.parse(decoder.decode(new Uint8Array(wasm.memory.buffer, ptr, len)));
      // The promise is captured once. Rewind consumes its response without calling the host again.
      suspended = Promise.resolve().then(() => request(packet)).then(
        value => ({ok: true, value: value === undefined ? {$camel: 'undefined'} : value}),
        error => ({ok: false, error: String(error?.message ?? error)})
      ).then(value => encoder.encode(JSON.stringify(value)));
      wasm.asyncify_start_unwind(stack);
      return 0;
    }
  }};
  const instance = await WebAssembly.instantiate(bytes, imports);
  wasm = (instance.instance ?? instance).exports;
  const stackBytes = 2 * 1024 * 1024;
  const stack = wasm.camel_alloc(stackBytes + 8);
  const view = new DataView(wasm.memory.buffer);
  view.setUint32(stack, stack + 8, true);
  view.setUint32(stack + 4, stack + 8 + stackBytes, true);
  return {
    async execute(value) {
      if (running) throw new Error('Camel interpreter is already running');
      if (poisoned) throw new Error('Camel interpreter must be discarded after failure');
      running = true;
      const data = encoder.encode(JSON.stringify(value));
      const ptr = wasm.camel_alloc(data.length);
      new Uint8Array(wasm.memory.buffer, ptr, data.length).set(data);
      let completed = false;
      try {
        wasm.camel_execute(ptr, data.length);
        while (wasm.asyncify_get_state() === 1) {
          wasm.asyncify_stop_unwind();
          const pending = suspended;
          suspended = null;
          response = await pending;
          wasm.asyncify_start_rewind(stack);
          wasm.camel_execute(ptr, data.length);
        }
        if (wasm.asyncify_get_state() !== 0 || suspended || response) throw new Error('Camel invalid continuation state');
        const result = JSON.parse(decoder.decode(new Uint8Array(wasm.memory.buffer, wasm.camel_result_ptr(), wasm.camel_result_len())));
        completed = true;
        if (!result.ok) throw new Error(result.error);
        return result.value;
      } catch (error) {
        poisoned = true;
        throw error;
      } finally {
        // A trapped instance is discarded by its owning worker. Never reuse a suspended stack.
        if (completed && wasm.asyncify_get_state() === 0) wasm.camel_free(ptr, data.length);
        running = false;
      }
    }
  };
}
