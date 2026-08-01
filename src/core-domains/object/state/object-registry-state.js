import {
  createObjectDescriptor,
  updateObjectLifecycle,
  validateObjectDescriptor
} from "../contracts/object-descriptor.js";

const clone = (value) => value === undefined ? undefined : structuredClone(value);

export function createObjectRegistryState(baseApi) {
  function records() {
    return baseApi.getState()?.objects ?? {};
  }

  function register(input) {
    const descriptor = createObjectDescriptor(input);
    baseApi.update({
      objects: {
        ...records(),
        [descriptor.id]: descriptor
      }
    }, "descriptorChanged");
    return clone(descriptor);
  }

  function get(id) {
    return clone(records()[String(id)] ?? null);
  }

  function list() {
    return Object.values(records())
      .sort((left, right) => left.id.localeCompare(right.id))
      .map(clone);
  }

  function remove(id) {
    const key = String(id);
    if (!Object.prototype.hasOwnProperty.call(records(), key)) return false;
    const next = { ...records() };
    delete next[key];
    baseApi.update({ objects: next }, "descriptorChanged");
    return true;
  }

  function setLifecycle(id, status) {
    const current = get(id);
    if (!current) throw new RangeError(`Unknown core object: ${id}`);
    const next = updateObjectLifecycle(current, status);
    baseApi.update({
      objects: {
        ...records(),
        [next.id]: next
      }
    }, "updated");
    return clone(next);
  }

  function loadSnapshot(snapshot = {}) {
    const objects = snapshot.objects ?? {};
    for (const descriptor of Object.values(objects)) {
      const result = validateObjectDescriptor(descriptor);
      if (!result.valid) {
        throw new TypeError(`Invalid core object snapshot descriptor: ${result.errors.join("; ")}`);
      }
    }
    return baseApi.loadSnapshot(snapshot);
  }

  return Object.freeze({
    create: register,
    register,
    get,
    has(id) {
      return Object.prototype.hasOwnProperty.call(records(), String(id));
    },
    list,
    remove,
    setLifecycle,
    validate: validateObjectDescriptor,
    loadSnapshot
  });
}

export default createObjectRegistryState;
