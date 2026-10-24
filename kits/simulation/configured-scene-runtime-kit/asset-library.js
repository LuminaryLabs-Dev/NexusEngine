// Project organization only; asset identity and content stay in Engine documents.
export const ROOT = "assets";
export const defaultFolders = () => [
  { id: "models", name: "Models", parent: ROOT },
  { id: "materials", name: "Materials", parent: ROOT },
  { id: "reusable", name: "Reusable", parent: ROOT },
  { id: "data", name: "Data", parent: ROOT },
];
export const libraryFor = (meta) =>
  meta.assetLibrary ?? { folders: defaultFolders(), locations: {} };
export const folderFor = (library, asset) =>
  library.locations[asset.id] ??
  { mesh: "models", material: "materials", prefab: "reusable", data: "data" }[
    asset.kind
  ] ??
  ROOT;
export function validateName(name) {
  if (
    typeof name !== "string" ||
    !name.trim() ||
    name.length > 80 ||
    /[\\/]/.test(name) ||
    [".", ".."].includes(name.trim())
  )
    throw Error("Use a name of 1–80 characters without slashes.");
  return name.trim();
}
export function validateLibrary(library) {
  if (!library) return;
  if (
    !Array.isArray(library.folders) ||
    library.folders.length > 250 ||
    !library.locations ||
    typeof library.locations !== "object" ||
    Array.isArray(library.locations)
  )
    throw Error("Invalid asset folder library.");
  const ids = new Set([ROOT]),
    names = new Set();
  for (const f of library.folders) {
    validateName(f.name);
    const key = String(f.parent) + "/" + f.name.trim().toLowerCase();
    if (names.has(key))
      throw Error("A folder with this name already exists here.");
    names.add(key);
    if (typeof f.id !== "string" || !f.id || ids.has(f.id))
      throw Error("Asset folder IDs must be unique.");
    ids.add(f.id);
  }
  for (const f of library.folders) {
    const visited = new Set([f.id]);
    let parent = f.parent;
    while (parent !== ROOT) {
      if (!ids.has(parent) || visited.has(parent))
        throw Error("Asset folder parent is missing or cyclic.");
      visited.add(parent);
      parent = library.folders.find((row) => row.id === parent).parent;
    }
  }
  for (const dest of Object.values(library.locations))
    if (!ids.has(dest)) throw Error("Asset destination folder is missing.");
}
export function pathFor(library, id) {
  const result = [{ id: ROOT, name: "Assets" }];
  let f = library.folders.find((f) => f.id === id),
    chain = [];
  while (f) {
    chain.unshift(f);
    f = library.folders.find((p) => p.id === f.parent);
  }
  return [...result, ...chain];
}
