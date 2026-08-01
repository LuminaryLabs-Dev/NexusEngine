import {
  createWorldCellDescriptorSignature,
  diffWorldCellDescriptors
} from "../world-cell-kit/index.js";

export function defineWorldPartition({ id, kind, selectCells, locateCell = () => null, snapshot = () => ({}) }) {
  if (!id) throw new TypeError("World partition id is required.");
  if (typeof selectCells !== "function") throw new TypeError("World partition selectCells is required.");
  return Object.freeze({ id, kind: kind ?? "custom", selectCells, locateCell, snapshot });
}

export function diffCellSelections(previous = [], next = []) {
  const prior = new Map(previous.map((cell) => [cell.id, cell]));
  const current = new Map(next.map((cell) => [cell.id, cell]));
  const updated = [];
  const retained = [];

  for (const cell of next) {
    const previousCell = prior.get(cell.id);
    if (!previousCell) continue;
    if (createWorldCellDescriptorSignature(previousCell) === createWorldCellDescriptorSignature(cell)) retained.push(cell);
    else updated.push({ previous: previousCell, next: cell, changes: diffWorldCellDescriptors(previousCell, cell) });
  }

  return {
    required: next.filter((cell) => !prior.has(cell.id)),
    updated,
    retained,
    released: previous.filter((cell) => !current.has(cell.id))
  };
}
