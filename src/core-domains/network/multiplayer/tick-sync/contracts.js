import { clonePortable, nonNegativeInteger } from "../../portable.js";
export function createTickSyncRecord({ tickRate = 60, smoothing = 0.2 } = {}) { if (!(tickRate > 0) || !(smoothing > 0 && smoothing <= 1)) throw new TypeError("Tick sync requires positive tickRate and smoothing in (0, 1]."); return { tickRate, smoothing, sampleCount: 0, rttMs: 0, offsetMs: 0, remoteTickOffset: 0 }; }
export function addTimingSample(record, sample) {
  const current = clonePortable(record, "Tick sync record");
  const a = Number(sample.localSendMs), b = Number(sample.remoteReceiveMs), c = Number(sample.remoteSendMs), d = Number(sample.localReceiveMs);
  if (![a,b,c,d].every(Number.isFinite) || d < a || c < b) throw new TypeError("Timing sample must contain ordered finite timestamps.");
  const localTick = nonNegativeInteger(sample.localTick, "Local tick"), remoteTick = nonNegativeInteger(sample.remoteTick, "Remote tick");
  const rttMs = Math.max(0, (d - a) - (c - b));
  const offsetMs = ((b - a) + (c - d)) / 2;
  const alpha = current.sampleCount ? current.smoothing : 1;
  return { ...current, sampleCount: current.sampleCount + 1, rttMs: current.rttMs + alpha * (rttMs - current.rttMs), offsetMs: current.offsetMs + alpha * (offsetMs - current.offsetMs), remoteTickOffset: current.remoteTickOffset + alpha * ((localTick - remoteTick) - current.remoteTickOffset) };
}
export function remoteTickToLocalTick(record, remoteTick) { return Math.round(nonNegativeInteger(remoteTick, "Remote tick") + Number(record.remoteTickOffset ?? 0)); }
