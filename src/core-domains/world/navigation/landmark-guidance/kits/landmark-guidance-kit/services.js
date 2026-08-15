import { countLandmarks, queryNearestLandmark } from "./contracts.js";

function transition(baseApi, command, stage) {
  return baseApi.applyCommand(command, (state, request) => {
    const landmarkId = String(request.landmarkId ?? "");
    const current = state.landmarks.find((landmark) => landmark.id === landmarkId);
    if (!current) throw new TypeError(`Unknown landmark ${landmarkId}.`);
    if (!current.active) throw new TypeError(`Landmark ${landmarkId} is inactive.`);
    if (current.completed) throw new TypeError(`Landmark ${landmarkId} is already completed.`);
    if (stage === "discover" && current.discovered) throw new TypeError(`Landmark ${landmarkId} is already discovered.`);
    if (stage === "reach" && current.reached) throw new TypeError(`Landmark ${landmarkId} is already reached.`);
    const changed = {
      ...current,
      discovered: true,
      reached: stage === "reach" || stage === "complete" ? true : current.reached,
      completed: stage === "complete" ? true : current.completed
    };
    const counted = countLandmarks({
      ...state,
      activeLandmarkId: stage === "reach" ? landmarkId : state.activeLandmarkId,
      landmarks: state.landmarks.map((landmark) => landmark.id === landmarkId ? changed : landmark)
    });
    return {
      patch: counted,
      result: { landmark: changed, stage },
      events: [{ name: stage === "discover" ? "landmarkDiscovered" : stage === "reach" ? "landmarkReached" : "landmarkActivated", payload: { landmark: changed } }]
    };
  });
}

export function createLandmarkGuidanceServices(baseApi) {
  return {
    nearest(point = {}) {
      return queryNearestLandmark(baseApi.getState(), point);
    },
    discover: (command) => transition(baseApi, command, "discover"),
    reach: (command) => transition(baseApi, command, "reach"),
    complete: (command) => transition(baseApi, command, "complete"),
    list() {
      return baseApi.getState().landmarks;
    }
  };
}
