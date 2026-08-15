import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const coreRoot = path.join(repoRoot, 'src', 'core-domains');
const failures = [];
const imported = [];
const wrappers = [];

const repoPath = (file) => path.relative(repoRoot, file).split(path.sep).join('/');
const kind = (file) => {
  const rel = repoPath(file);
  if (file.endsWith('/domain.manifest.js')) return 'domain manifest';
  if (file.endsWith('/subdomain.manifest.js')) return 'semantic-domain manifest';
  if (file.endsWith('/kit.manifest.js')) return 'kit manifest';
  if (rel.includes('/kits/')) return 'kit entrypoint';
  if (rel.includes('/providers/')) return 'provider entrypoint';
  if (rel.includes('/adapters/')) return 'adapter entrypoint';
  return 'domain entrypoint';
};

async function discover(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'subdomains') wrappers.push(repoPath(target));
      if (entry.name !== 'tests') found.push(...await discover(target));
    } else if (
      entry.isFile()
      && (entry.name === 'index.js'
        || entry.name === 'domain.manifest.js'
        || entry.name === 'subdomain.manifest.js'
        || entry.name === 'kit.manifest.js')
    ) {
      found.push(target);
    }
  }
  return found;
}

async function load(file, label = kind(file)) {
  try {
    await import(pathToFileURL(file).href);
    imported.push({ label, path: repoPath(file) });
  } catch (error) {
    failures.push({ label, path: repoPath(file), code: error?.code ?? null, message: error?.message ?? String(error) });
  }
}

const files = (await discover(coreRoot)).sort();
assert.deepEqual(wrappers, [], `generic wrappers remain:\n${wrappers.join('\n')}`);
for (const file of files) await load(file);
await load(path.join(repoRoot, 'src', 'index.js'), 'public root export');
await load(path.join(repoRoot, 'src', 'engine.js'), 'engine entrypoint');

console.log({ discovered: files.length, imported: imported.length, failed: failures.length });
for (const failure of failures) console.error(failure);
assert.equal(failures.length, 0, `${failures.length} import failure(s)`);
console.log('core domain import smoke ok');
