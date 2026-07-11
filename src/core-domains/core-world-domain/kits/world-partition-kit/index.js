export function defineWorldPartition({ id, kind, selectCells, locateCell = () => null, snapshot = () => ({}) }) {
  if (!id) throw new TypeError("World partition id is required.");
  if (typeof selectCells !== "function") throw new TypeError("World partition selectCells is required.");
  return Object.freeze({ id, kind: kind ?? "custom", selectCells, locateCell, snapshot });
}

export function diffCellSelections(previous = [], next = []) {
  const prior = new Map(previous.map((cell) => [cell.id, cell]));
  const current = new Map(next.map((cell) => [cell.id, cell]));
  return {
    required: next.filter((cell) => !prior.has(cell.id)),
    retained: next.filter((cell) => prior.has(cell.id)),
    released: previous.filter((cell) => !current.has(cell.id))
  };
}
