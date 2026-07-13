export function sortWorldFeatures(features = []) {
  return [...features].sort((left, right) => Number(left.priority) - Number(right.priority) || left.id.localeCompare(right.id));
}

export function flattenFeatureContributions(values = []) {
  return values.flatMap((value) => Array.isArray(value) ? value : value == null ? [] : [value]);
}
