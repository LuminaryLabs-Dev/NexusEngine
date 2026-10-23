import { spawn } from 'node:child_process';
/** Explicitly started LSP/DAP stdio transport; owns no source document state. */
export function createStdioProtocol({ command, args = [], cwd, protocol = 'lsp', authorize, onEvent = () => { }, timeoutMs = 10000, maxBytes = 1048576 }) {
    let child, buffer = Buffer.alloc(0), sequence = 0, closed = false;
    const pending = new Map();
    function stopChild() { if (!child?.pid)
        return; try {
        if (process.platform !== 'win32')
            process.kill(-child.pid, 'SIGKILL');
        else
            child.kill('SIGKILL');
    }
    catch {
        child.kill('SIGKILL');
    } }
    function fail(error) { closed = true; for (const p of pending.values()) {
        clearTimeout(p.timer);
        p.reject(error);
    } pending.clear(); }
    function receive(message) { const id = protocol === 'dap' ? message.request_seq : message.id; if (pending.has(id)) {
        const p = pending.get(id);
        pending.delete(id);
        clearTimeout(p.timer);
        if (message.error || message.success === false)
            p.reject(new Error(message.error?.message ?? message.message ?? 'Protocol request failed'));
        else
            p.resolve(protocol === 'dap' ? message.body : message.result);
    }
    else
        onEvent(message); }
    function parse(chunk) { try {
        buffer = Buffer.concat([buffer, chunk]);
        if (buffer.length > maxBytes)
            throw new Error('Protocol output limit');
        while (true) {
            const end = buffer.indexOf('\r\n\r\n');
            if (end < 0)
                return;
            const length = /content-length:\s*(\d+)/i.exec(buffer.subarray(0, end).toString());
            if (!length || Number(length[1]) > maxBytes)
                throw new Error('Invalid protocol frame');
            const size = Number(length[1]);
            if (buffer.length < end + 4 + size)
                return;
            const json = buffer.subarray(end + 4, end + 4 + size).toString();
            buffer = buffer.subarray(end + 4 + size);
            receive(JSON.parse(json));
        }
    }
    catch (error) {
        fail(error);
        stopChild();
    } }
    return Object.freeze({ async start() { if (child)
            throw new Error('Protocol already started'); if (await authorize?.({ kind: 'development-process', command, args, cwd, protocol }) !== true)
            throw new Error('Protocol execution not authorized'); if (!['lsp', 'dap'].includes(protocol))
            throw new Error('Unsupported protocol'); child = spawn(command, args, { cwd, shell: false, stdio: ['pipe', 'pipe', 'pipe'], detached: process.platform !== 'win32' }); child.stdout.on('data', parse); child.stderr.on('data', () => { }); child.on('error', fail); child.on('close', () => fail(new Error('Protocol disconnected'))); }, request(method, params = {}) { if (!child || closed)
            return Promise.reject(new Error('Protocol unavailable')); const id = ++sequence, message = protocol === 'dap' ? { seq: id, type: 'request', command: method, arguments: params } : { jsonrpc: '2.0', id, method, params }; return new Promise((resolve, reject) => { const timer = setTimeout(() => { pending.delete(id); reject(new Error('Protocol request timed out')); }, timeoutMs); pending.set(id, { resolve, reject, timer }); const bytes = Buffer.from(JSON.stringify(message)); child.stdin.write('Content-Length: ' + bytes.length + '\r\n\r\n'); child.stdin.write(bytes); }); }, stop() { stopChild(); fail(new Error('Protocol stopped')); } });
}
