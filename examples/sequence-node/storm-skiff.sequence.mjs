export const stormSkiffSequence = {
  id: "storm_skiff",
  type: "flow",
  completionMode: "sequence",
  driver: "hybrid",
  config: {
    title: "Storm Skiff",
    intent: "Survive a storm route and recover cargo.",
    playerFantasy: "A small rescue skiff fighting waves and pressure."
  },
  data: {
    cargoRecovered: 0,
    stormEntered: false,
    returnedHome: false
  },
  kits: [
    "input-intent",
    "water-surface",
    "vehicle-dynamics",
    "route-field",
    "cargo-manifest"
  ],
  children: [
    {
      id: "launch",
      type: "objective",
      completionMode: "sequence",
      driver: "hybrid",
      config: {
        title: "Launch",
        goal: "Accelerate and leave the dock."
      },
      children: [
        {
          id: "accelerate",
          type: "vehicleControl",
          completionMode: "condition",
          driver: "hybrid",
          config: {
            verb: "accelerate",
            prompt: "Push forward to launch."
          },
          listen: ["VehicleDynamicsChanged", "resource:VehicleDynamicsState"],
          until: {
            any: [
              { path: "event.payload.speed", gte: 8 },
              { path: "root.data.speedReady", equals: true }
            ]
          }
        }
      ]
    },
    {
      id: "enter_storm",
      type: "objective",
      completionMode: "sequence",
      driver: "hybrid",
      config: {
        title: "Enter Storm",
        goal: "Follow the route into the storm."
      },
      children: [
        {
          id: "follow_route_to_storm",
          type: "routeFollow",
          completionMode: "event",
          driver: "hybrid",
          listen: ["RouteMarkerReached"],
          until: {
            path: "event.payload.markerId",
            equals: "storm_gate"
          },
          write: {
            "root.data.stormEntered": true
          }
        },
        {
          id: "mark_storm_started",
          type: "emitEvent",
          completionMode: "manual",
          config: {
            event: "StormStarted"
          }
        }
      ]
    },
    {
      id: "recover_cargo",
      type: "objective",
      completionMode: "condition",
      driver: "hybrid",
      config: {
        title: "Recover Cargo",
        goal: "Recover 3 floating cargo crates.",
        allowLocalCompletionWithChildren: true
      },
      listen: ["CargoPickedUp"],
      write: {
        "root.data.cargoRecovered": "+1"
      },
      until: {
        path: "root.data.cargoRecovered",
        gte: 3
      },
      children: [
        {
          id: "find_cargo_zone",
          type: "reachZone",
          completionMode: "event",
          driver: "hybrid",
          listen: ["ZoneEntered"],
          until: {
            path: "event.payload.zoneId",
            equals: "cargo_field"
          }
        },
        {
          id: "cargo_pickup_feedback",
          type: "telemetryMark",
          completionMode: "manual",
          config: {
            label: "cargo-pickup-loop-started"
          }
        }
      ]
    },
    {
      id: "return_home",
      type: "objective",
      completionMode: "sequence",
      driver: "hybrid",
      config: {
        title: "Return Home",
        goal: "Return recovered cargo to the dock."
      },
      children: [
        {
          id: "reach_home",
          type: "reachZone",
          completionMode: "event",
          driver: "hybrid",
          listen: ["ZoneEntered"],
          until: {
            path: "event.payload.zoneId",
            equals: "home_dock"
          },
          write: {
            "root.data.returnedHome": true
          }
        },
        {
          id: "finish_game",
          type: "emitEvent",
          completionMode: "manual",
          config: {
            event: "GameFinished"
          }
        }
      ]
    }
  ]
};
