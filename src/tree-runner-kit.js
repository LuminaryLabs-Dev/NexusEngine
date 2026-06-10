import { defineEvent, defineResource } from "./ecs.js";
import { defineRuntimeKit } from "./runtime-kit.js";

function number(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function makeBranch(index, spacing, laneCount, seed) {
  const lane = ((index * 7 + seed) % laneCount) - Math.floor(laneCount / 2);
  const drift = Math.sin((index + seed) * 1.7) * 2.4;
  const height = 9 + Math.sin((index + seed) * 0.83) * 2.2 + (index % 3) * 0.55;
  const z = index * spacing;
  const x = lane * 7 + drift;
  const radius = 2.45 + (index % 4) * 0.18;
  const vineSide = index % 2 === 0 ? -1 : 1;
  return {
    id: `branch-${index}`,
    index,
    x,
    y: height,
    z,
    radius,
    vineAnchor: { x: x + vineSide * 4.2, y: height + 7.8, z: z + spacing * 0.38 },
    catchRadius: radius + 2.1,
    lit: false
  };
}

function ensureBranches(run, count) {
  while (run.branches.length < count) {
    run.branches.push(makeBranch(run.branches.length, run.spacing, run.laneCount, run.seed));
  }
}

function nearestBranch(run, player) {
  let best = null;
  let bestDistance = Infinity;
  for (const branch of run.branches) {
    const dx = player.x - branch.x;
    const dy = player.y - branch.y;
    const dz = player.z - branch.z;
    const distance = Math.hypot(dx, dy * 1.35, dz * 0.82);
    if (distance < bestDistance) {
      best = branch;
      bestDistance = distance;
    }
  }
  return { branch: best, distance: bestDistance };
}

function forwardCatchBranch(run, player) {
  let best = null;
  let bestScore = Infinity;
  for (const branch of run.branches) {
    if (branch.index <= player.branchIndex) continue;
    const dz = branch.z - player.z;
    if (dz < -8 || dz > 42) continue;
    const dx = Math.abs(branch.x - player.x);
    const dy = Math.abs(branch.y - player.y);
    const score = dx * 0.6 + dy * 0.35 + Math.abs(dz - 12) * 0.4;
    if (score < bestScore) {
      best = branch;
      bestScore = score;
    }
  }
  return best;
}

function catchBranch(world, events, run, player, branch) {
  player.state = "perched";
  player.branchIndex = branch.index;
  player.x = branch.x;
  player.y = branch.y + 1.15;
  player.z = branch.z;
  player.vy = 0;
  player.combo += 1;
  player.bestCombo = Math.max(player.bestCombo, player.combo);
  branch.lit = true;
  run.catches += 1;
  world.emit(events.BranchCaught, { branchId: branch.id, combo: player.combo });
}

export function createTreeRunnerKit(options = {}) {
  const resources = {
    TreeRunnerInput: defineResource("tree-runner-input"),
    TreeRunnerRun: defineResource("tree-runner-run"),
    TreeRunnerPlayer: defineResource("tree-runner-player")
  };
  const events = {
    BranchCaught: defineEvent("tree-runner-branch-caught"),
    JumpStarted: defineEvent("tree-runner-jump-started"),
    VineSwingStarted: defineEvent("tree-runner-vine-swing-started"),
    PlayerFell: defineEvent("tree-runner-player-fell")
  };

  function runnerSystem(world) {
    const input = world.getResource(resources.TreeRunnerInput);
    const run = world.getResource(resources.TreeRunnerRun);
    const player = world.getResource(resources.TreeRunnerPlayer);
    if (!input || !run || !player) return;

    const dt = clamp(world.__nexusClock?.delta ?? 1 / 60, 0, 0.05);
    run.elapsed += dt;
    run.speed = Math.min(run.maxSpeed, run.speed + dt * run.acceleration);
    ensureBranches(run, Math.ceil((player.z + run.visibleAhead) / run.spacing) + 8);

    if (player.state === "falling") {
      player.vy -= run.gravity * dt;
      player.x += number(input.x) * run.airControl * dt;
      player.z += run.speed * 0.36 * dt;
      player.y += player.vy * dt;
      const { branch, distance } = nearestBranch(run, player);
      const forwardBranch = input.catch ? forwardCatchBranch(run, player) : null;
      if (input.catch && forwardBranch) {
        catchBranch(world, events, run, player, forwardBranch);
      } else if (input.catch && branch && distance <= branch.catchRadius + 4.5) {
        catchBranch(world, events, run, player, branch);
      }
    } else if (player.state === "perched") {
      const branch = run.branches[player.branchIndex];
      if (branch) {
        player.x += (branch.x - player.x) * clamp(dt * 10, 0, 1);
        player.y += (branch.y + 1.15 - player.y) * clamp(dt * 10, 0, 1);
        player.z += Math.max(0, run.speed * 0.18 * dt);
      }
      if (input.swing) {
        player.state = "swinging";
        player.swingTime = 0;
        player.swingPower = 1.1 + Math.min(0.9, player.combo * 0.06);
        world.emit(events.VineSwingStarted, { branchIndex: player.branchIndex });
      } else if (input.jump) {
        player.state = "falling";
        player.vy = run.jumpVelocity;
        player.z += 2.2;
        world.emit(events.JumpStarted, { branchIndex: player.branchIndex });
      }
    } else if (player.state === "swinging") {
      const branch = run.branches[player.branchIndex];
      player.swingTime += dt;
      const arc = Math.sin(player.swingTime * 4.4);
      if (branch) {
        player.x = branch.x + arc * 4.8;
        player.y = branch.y + 0.9 + Math.cos(player.swingTime * 4.4) * 1.5;
        player.z += run.speed * player.swingPower * dt;
      }
      if (input.jump || player.swingTime > 0.9) {
        player.state = "falling";
        player.vy = run.jumpVelocity * 0.78;
        player.z += 8.4 + player.combo * 0.28;
        world.emit(events.JumpStarted, { branchIndex: player.branchIndex });
      }
    }

    if (player.y < run.killY && !player.dead) {
      player.dead = true;
      player.state = "fallen";
      player.combo = 0;
      run.falls += 1;
      world.emit(events.PlayerFell, { z: player.z });
    }

    run.distance = Math.max(run.distance, player.z);
    run.branchCount = run.branches.length;
    run.nextBranchIndex = Math.max(0, player.branchIndex + 1);
  }

  return defineRuntimeKit({
    id: options.id ?? "tree-runner-kit",
    resources,
    events,
    systems: [{ phase: "simulate", name: "TreeRunnerSystem", system: runnerSystem }],
    initWorld({ world }) {
      const run = {
        acceleration: options.acceleration ?? 0.18,
        airControl: options.airControl ?? 15,
        branchCount: 0,
        branches: [],
        catches: 0,
        distance: 0,
        elapsed: 0,
        falls: 0,
        gravity: options.gravity ?? 29,
        jumpVelocity: options.jumpVelocity ?? 12.5,
        killY: options.killY ?? -18,
        laneCount: options.laneCount ?? 5,
        maxSpeed: options.maxSpeed ?? 18,
        seed: options.seed ?? 7,
        spacing: options.spacing ?? 16,
        speed: options.speed ?? 10,
        visibleAhead: options.visibleAhead ?? 180
      };
      ensureBranches(run, options.initialBranches ?? 24);
      const first = run.branches[0];
      world.setResource(resources.TreeRunnerInput, { catch: false, jump: false, swing: false, x: 0 });
      world.setResource(resources.TreeRunnerRun, run);
      world.setResource(resources.TreeRunnerPlayer, {
        bestCombo: 0,
        branchIndex: 0,
        combo: 0,
        dead: false,
        state: "falling",
        swingPower: 0,
        swingTime: 0,
        vy: -1,
        x: first.x,
        y: first.y + 30,
        z: first.z - 8
      });
    },
    metadata: {
      domain: "route-traversal",
      reusable: true,
      composition: ["fall-start", "branch-catch", "vine-swing", "runner-fall"]
    }
  });
}
