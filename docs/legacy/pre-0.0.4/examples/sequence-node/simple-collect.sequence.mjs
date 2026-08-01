export const simpleCollectSequence = {
  id: "simple_collect_game",
  type: "flow",
  completionMode: "sequence",
  driver: "hybrid",
  data: {
    coins: 0
  },
  children: [
    {
      id: "player_moves",
      type: "playerVerb",
      completionMode: "event",
      driver: "event",
      config: {
        verb: "move",
        prompt: "Move to begin"
      },
      listen: ["PlayerMoved"]
    },
    {
      id: "collect_coin",
      type: "collect",
      completionMode: "condition",
      driver: "event",
      listen: ["CoinCollected"],
      write: {
        "root.data.coins": "+1"
      },
      until: {
        path: "root.data.coins",
        gte: 1
      }
    },
    {
      id: "finish",
      type: "emitEvent",
      completionMode: "manual",
      config: {
        event: "GameFinished"
      }
    }
  ]
};
