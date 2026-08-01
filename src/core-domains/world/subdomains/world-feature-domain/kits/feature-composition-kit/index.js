export function sortWorldFeatures(features = []) {
  return [...features].sort((left, right) => Number(left.priority) - Number(right.priority) || left.id.localeCompare(right.id));
}

export function flattenFeatureContributions(values = []) {
  const list = Array.isArray(values) ? values : values == null ? [] : [values];
  return list.flatMap((value) => Array.isArray(value) ? value : value == null ? [] : [value]);
}
