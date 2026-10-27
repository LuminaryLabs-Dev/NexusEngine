import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { PNG } from 'pngjs';
export const fails = (fn, re) => assert.rejects(Promise.resolve().then(fn), re);
export function compare(a, b, tolerance = 0) {
  assert.equal(a.length, b.length); let max = 0, changed = 0;
  for (let i=0;i<a.length;i++) { const d=Math.abs(a[i]-b[i]); max=Math.max(max,d); if(d)changed++; }
  assert(max <= tolerance, `Maximum channel difference ${max} exceeds ${tolerance}`); return { max, changed };
}
export async function save(frame, name) {
  await mkdir('build/graphics-evidence', { recursive: true });
  await writeFile(`build/graphics-evidence/${name}.png`, PNG.sync.write({ width: frame.width, height: frame.height, data: Buffer.from(frame.pixels) }));
}
export function distribution(samples) {
  assert(samples.length > 0 && samples.every(Number.isFinite), 'Finite timing samples are required');
  const sorted = [...samples].sort((a, b) => a - b);
  const percentile = fraction => sorted[Math.min(sorted.length - 1, Math.ceil(fraction * sorted.length) - 1)];
  return { count: sorted.length, min: sorted[0], median: percentile(.5), p95: percentile(.95), max: sorted.at(-1), mean: samples.reduce((sum, value) => sum + value, 0) / samples.length };
}
