/** Portable panel attachment and physical sizing; providers own layout and rendering. */
export function createSpatialPanelDescriptor(input = {}) {
  const { id, objectId, width = 0.6, height = 0.3, scaleMode = 'fixed', visible = true } = input;
  for (const [key, value] of Object.entries({ id, objectId })) {
    if (typeof value !== 'string' || !value.trim() || value.length > 128) throw new TypeError(`Panel ${key} is required.`);
  }
  if (![width, height].every(value => Number.isFinite(value) && value > 0 && value <= 100)) throw new TypeError('Panel dimensions must be finite positive metres, at most 100.');
  if (!['fixed', 'inherit'].includes(scaleMode) || typeof visible !== 'boolean') throw new TypeError('Invalid panel scale or visibility.');
  const translation = input.translation ?? [0, 0, 0];
  const rotation = input.rotation ?? [0, 0, 0, 1];
  const vector = (v, n) => Array.isArray(v) && v.length === n && v.every(Number.isFinite);
  if (!vector(translation, 3) || !vector(rotation, 4) || Math.abs(Math.hypot(...rotation) - 1) > 1e-5) throw new TypeError('Panel transform requires a finite translation and unit quaternion.');
  return { kind: 'spatial-ui-panel', id, objectId, width, height, scaleMode, visible, translation: [...translation], rotation: [...rotation] };
}
