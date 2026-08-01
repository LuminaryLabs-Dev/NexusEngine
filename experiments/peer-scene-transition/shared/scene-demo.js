import { createRealtimeGame, createSceneKit } from "../../../src/index.js";
import {
  createWebSceneHostBinding,
  mountAcceptedSceneTransition
} from "../../../src/core-domains/world/subdomains/scene/kits/scene-kit/index.js";

const SNAPSHOT_KEY = "nexus.sceneSnapshot";

export const scenes = {
  camp: {
    title: "Ash Road Camp",
    kind: "web-html-scene",
    entry: "./camp.html",
    exits: {
      road: { to: "crossroads", label: "Walk to the crossroads" }
    }
  },
  crossroads: {
    title: "The Crossroads",
    kind: "web-html-scene",
    entry: "./crossroads.html",
    exits: {
      forest: { to: "forest", label: "Enter the lantern forest", requires: ["has-lantern"] },
      bridge: { to: "bridge", label: "Take the old bridge" }
    }
  },
  forest: {
    title: "Lantern Forest",
    kind: "web-html-scene",
    entry: "./forest.html",
    exits: {
      shrine: { to: "shrine", label: "Follow the light to the shrine" }
    }
  },
  bridge: {
    title: "Old Bridge",
    kind: "web-html-scene",
    entry: "./bridge.html",
    exits: {
      shrine: { to: "shrine", label: "Cross into the shrine road" }
    }
  },
  shrine: {
    title: "Silent Shrine",
    kind: "web-html-scene",
    entry: "./shrine.html",
    exits: {
      ending: { to: "ending", label: "Finish the pilgrimage" },
      camp: { to: "camp", label: "Loop back to camp" }
    }
  },
  ending: {
    title: "Dawn Ending",
    kind: "web-html-scene",
    entry: "./ending.html",
    exits: {
      camp: { to: "camp", label: "Start another route" }
    }
  }
};

function loadSnapshot() {
  try {
    const raw = sessionStorage.getItem(SNAPSHOT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSnapshot(engine) {
  sessionStorage.setItem(SNAPSHOT_KEY, JSON.stringify(engine.n.scene.getSnapshot()));
}

function transitionIdFor(engine, exitId) {
  const state = engine.n.scene.getState();
  return `${state.currentSceneId}:${exitId}:${Number(state.transitionSequence ?? 0) + 1}`;
}

function createDemoEngine(sceneId) {
  const engine = createRealtimeGame({
    kits: [createSceneKit({ scenes, initialSceneId: sceneId, transitionHistoryLimit: 128 })]
  });
  const snapshot = loadSnapshot();
  if (snapshot?.registry) {
    engine.n.scene.loadSceneSnapshot(snapshot);
  }
  if (engine.n.scene.getCurrentScene()?.id !== sceneId) {
    engine.n.scene.enterScene({ sceneId, entryId: `html-load:${sceneId}:${engine.n.scene.getState().transitionSequence}` });
  }
  return engine;
}

function renderLedger(engine) {
  const state = engine.n.scene.getSnapshot();
  return `Current: ${state.currentSceneId}\nVisited: ${state.visitedSceneIds.join(" → ")}\nTransitions: ${engine.n.scene.getTransitionLedger().map((entry) => entry.transitionId).join(", ") || "none"}\nTokens: ${(state.unlockedTokens ?? []).join(", ") || "none"}`;
}

function go(engine, exitId) {
  const result = engine.n.scene.requestTransition({
    transitionId: transitionIdFor(engine, exitId),
    exitId
  });
  if (!result.accepted) {
    render(engine, `Blocked: ${result.transition.reason} ${result.transition.missingRequirements?.join(", ") ?? ""}`);
    return;
  }
  const snapshot = engine.n.scene.getSnapshot();
  const host = createWebSceneHostBinding({
    storage: sessionStorage,
    navigate(entry) {
      window.location.href = entry;
    }
  });
  saveSnapshot(engine);
  mountAcceptedSceneTransition(engine, host, result, { snapshot });
}

function render(engine, message = "") {
  const scene = engine.n.scene.getCurrentScene();
  const exits = engine.n.scene.getAvailableExits();
  document.querySelector("#scene-title").textContent = scene.title;
  document.querySelector("#scene-id").textContent = scene.id;
  document.querySelector("#message").textContent = message;
  document.querySelector("#ledger").textContent = renderLedger(engine);

  const actions = document.querySelector("#actions");
  actions.textContent = "";

  if (scene.id === "camp" && !engine.n.scene.getUnlockedTokens().includes("has-lantern")) {
    const button = document.createElement("button");
    button.textContent = "Take lantern";
    button.addEventListener("click", () => {
      engine.n.scene.grantToken("has-lantern");
      saveSnapshot(engine);
      render(engine, "Lantern token granted. The forest exit is now valid.");
    });
    actions.append(button);
  }

  for (const exit of exits) {
    const button = document.createElement("button");
    button.textContent = exit.allowed ? exit.label : `${exit.label} (blocked: ${exit.missingRequirements.join(", ")})`;
    button.disabled = exit.blocked;
    button.addEventListener("click", () => go(engine, exit.id));
    actions.append(button);
  }

  const reset = document.createElement("button");
  reset.textContent = "Reset campaign snapshot";
  reset.addEventListener("click", () => {
    sessionStorage.removeItem(SNAPSHOT_KEY);
    window.location.href = "./camp.html";
  });
  actions.append(reset);
}

export function bootPeerScene(sceneId) {
  const engine = createDemoEngine(sceneId);
  window.NexusSceneDemo = { engine, scenes };
  render(engine);
}
