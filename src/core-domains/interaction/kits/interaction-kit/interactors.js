/** Pure semantic interaction. Hosts supply query results; Core performs no hit tests. */
export function advanceInteractor(previous, request) {
  const { id, frame, tracked = true, pressed = false, targetId = null, intent = 'select' } = request;
  if (typeof id !== 'string' || !id.trim() || id.length > 128) throw new TypeError('Interactor id is required.');
  if (!Number.isSafeInteger(frame) || frame < 0) throw new TypeError('Interactor frame must be a nonnegative safe integer.');
  if (typeof tracked !== 'boolean' || typeof pressed !== 'boolean') throw new TypeError('Interactor tracking and pressed must be booleans.');
  if (targetId !== null && (typeof targetId !== 'string' || !targetId.trim() || targetId.length > 128)) throw new TypeError('Interactor target must be an identity or null.');
  if (!['select', 'grab'].includes(intent)) throw new TypeError('Unsupported interaction intent.');
  const input = { id, frame, tracked, pressed, targetId, intent };
  if (previous && frame <= previous.frame) {
    if (frame === previous.frame && JSON.stringify(previous.input) === JSON.stringify(input)) return { state: structuredClone(previous), events: [], duplicate: true };
    throw new TypeError('Stale or conflicting interactor frame.');
  }
  if (previous?.heldTargetId && previous.intent !== intent) throw new TypeError('Release before changing interaction intent.');
  const hoverTargetId = tracked ? targetId : null;
  let blockedUntilRelease = previous?.blockedUntilRelease === true || (!tracked && (pressed || previous?.pressed));
  if (tracked && !pressed) blockedUntilRelease = false;
  const down = tracked && pressed && !blockedUntilRelease;
  let heldTargetId = previous?.heldTargetId ?? null;
  const events = [];
  const emit = (type, target) => { if (target) events.push({ type, interactorId: id, targetId: target, frame }); };
  if (previous?.hoverTargetId !== hoverTargetId) {
    emit('hover-exit', previous?.hoverTargetId);
    emit('hover-enter', hoverTargetId);
  }
  if (heldTargetId && !down) {
    const held = heldTargetId;
    emit(tracked ? 'release' : 'cancel', held);
    if (tracked && intent === 'select' && held === hoverTargetId) emit('activate', held);
    heldTargetId = null;
  }
  if (down && !previous?.pressed && hoverTargetId) {
    heldTargetId = hoverTargetId;
    emit(intent === 'grab' ? 'grab' : 'select', heldTargetId);
  }
  return { state: { id, frame, intent, pressed: down, blockedUntilRelease: Boolean(blockedUntilRelease), hoverTargetId, heldTargetId, input }, events, duplicate: false };
}
