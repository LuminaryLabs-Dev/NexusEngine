let buffer = Buffer.alloc(0);
process.stdin.on('data', chunk => { buffer = Buffer.concat([buffer, chunk]); while (true) {
    const end = buffer.indexOf('\r\n\r\n');
    if (end < 0)
        return;
    const length = Number(/Content-Length:\s*(\d+)/i.exec(buffer.subarray(0, end).toString())[1]);
    if (buffer.length < end + 4 + length)
        return;
    const request = JSON.parse(buffer.subarray(end + 4, end + 4 + length));
    buffer = buffer.subarray(end + 4 + length);
    const method = request.method ?? request.command;
    if (method === 'timeout')
        continue;
    if (method === 'disconnect') {
        process.exit(0);
    }
    const message = request.type === 'request' ? { type: 'response', request_seq: request.seq, success: method !== 'fail', body: { echo: request.arguments }, message: 'fixture-failure' } : { jsonrpc: '2.0', id: request.id, ...(method === 'fail' ? { error: { message: 'fixture-failure' } } : { result: { echo: request.params } }) };
    const bytes = Buffer.from(JSON.stringify(message));
    process.stdout.write('Content-Length: ' + bytes.length + '\r\n\r\n');
    process.stdout.write(bytes);
} });
