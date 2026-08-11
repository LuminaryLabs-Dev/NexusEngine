import { createDomainKit } from "../../../domain-kit.js";
import {
  cameraContract,
  cameraKitDefinition,
  inspectCameraRecord,
  normalizeCameraRecord,
  normalizeCameraSnapshot,
  normalizeCameraUpdateCommand
} from "./camera-contracts.js";

export function createCameraKit(kitId, config = {}) {
  const definition = cameraKitDefinition(kitId);
  const stateKey = `${kitId.replaceAll("-", "_")}Record`;
  const defaults = {
    "camera-binding-kit": { cameraId: "default-camera", targetId: "default-target" },
    "camera-reprojection-kit": { mode: "none" },
    "multiview-camera-kit": { views: ["primary"] }
  };
  const initialRecord = normalizeCameraRecord(kitId, config.initialRecord ?? defaults[kitId] ?? {});
  return createDomainKit({
    ...config,
    id: config.id ?? kitId,
    manifestId: kitId,
    domain: `render-${kitId.replace(/-kit$/, "")}`,
    domainPath: "n:render:camera",
    parentDomainPath: "n:render",
    apiName: config.apiName ?? definition.api,
    requires: config.requires ?? ["n:render", "render:provider-contract"],
    provides: [definition.token],
    purpose: config.purpose ?? `Own portable ${kitId} camera semantics and deterministic state.`,
    owns: definition.fields.map((field) => `camera ${field}`),
    doesNotOwn: ["provider handles", "GPU execution", "frame submission", "platform camera APIs"],
    initialState: { record: initialRecord, revision: 0 },
    createApi({ baseApi }) {
      function update(command = {}) {
        const request = normalizeCameraUpdateCommand(kitId, command);
        return baseApi.applyCommand(request, (state) => {
          const record = normalizeCameraRecord(kitId, { ...state.record, ...(request.patch ?? {}) });
          return { patch: { record, revision: state.revision + 1 }, result: { record, revision: state.revision + 1 } };
        });
      }
      return {
        ...baseApi,
        getContract() { return cameraContract(kitId); },
        getRecord() { return baseApi.getState().record; },
        inspect(input) { return inspectCameraRecord(kitId, input); },
        loadSnapshot(snapshot) { return baseApi.loadSnapshot(normalizeCameraSnapshot(kitId, `render-${kitId.replace(/-kit$/, "")}`, snapshot)); },
        update,
        configure(command = {}) { return update(command); },
        setRecord(command = {}) { return update(command); },
        normalizeRecord(input) { return normalizeCameraRecord(kitId, input); }
      };
    }
  });
}
