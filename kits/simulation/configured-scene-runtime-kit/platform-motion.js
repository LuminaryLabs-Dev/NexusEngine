// Consumer course rule: a reversible, constant-speed shuttle with endpoint rests.
// Engine still owns document validation, player integration and contact correction.
export function platformOffset(binding, time) {
  const duration = binding.travelSeconds, pause = binding.pauseSeconds;
  const leg = duration + pause;
  const phase = time % (2 * leg);
  const t = phase < leg
    ? Math.min(1, phase / duration)
    : 1 - Math.min(1, (phase - leg) / duration);
  return binding.travel.map(v => v * t);
}
