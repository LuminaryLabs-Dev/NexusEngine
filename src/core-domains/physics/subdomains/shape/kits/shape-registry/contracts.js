import {
  SHAPE_DEFINE_COMMAND_SCHEMA,
  SHAPE_REMOVE_COMMAND_SCHEMA,
  normalizeShapeDefinitionCommand,
  normalizeShapeRegistrySnapshot,
  normalizeShapeRemovalCommand
} from "../../shape-contracts.js";

export {
  normalizeShapeDefinitionCommand,
  normalizeShapeRegistrySnapshot,
  normalizeShapeRemovalCommand
};

export function shapeRegistryContract() {
  return Object.freeze({
    defineCommandSchema: SHAPE_DEFINE_COMMAND_SCHEMA,
    removeCommandSchema: SHAPE_REMOVE_COMMAND_SCHEMA,
    exactOnceCommands: true,
    sameIdDifferentContentRejected: true,
    queryOperationsAreReadOnly: true
  });
}
