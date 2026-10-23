import { mkdir, writeFile } from 'node:fs/promises';
import { createIdeHost, serveIde } from 'nexusengine/kits/development/ide';
const projectRoot = process.argv[2], stateRoot = process.argv[3];
if (!projectRoot || !stateRoot)
    throw new Error('Usage: node examples/code-authoring/main.mjs ABSOLUTE_PROJECT_DIRECTORY ABSOLUTE_STATE_DIRECTORY');
await mkdir(projectRoot, { recursive: true });
const host = await createIdeHost({ projectRoot, stateRoot, authorize: async ({ kind }) => ['source-open', 'source-create', 'source-save', 'build', 'run', 'git-read'].includes(kind) });
try {
    await host.open(['main.ts']);
}
catch (e) {
    if (e.code !== 'ENOENT')
        throw e;
    await host.create({ path: 'main.ts', language: 'typescript', text: 'const greeting: string = "Hello from Nexus";\nconsole.log(greeting);\n' });
    await host.save();
}
const server = await serveIde(host);
console.log(server.url);
for (const signal of ['SIGINT', 'SIGTERM'])
    process.once(signal, async () => { await server.close(); await host.close(); process.exit(0); });
