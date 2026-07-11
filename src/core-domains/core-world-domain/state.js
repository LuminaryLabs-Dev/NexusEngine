export function createInitialWorldState() {
  return { worlds: {}, sequence: 0 };
}

export function cloneWorldState(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}
