import { createDomainKit } from "../../../domain-kit.js";
import { advanceInteractor } from './interactors.js';
export { advanceInteractor } from './interactors.js';

export * from "./targets.js";
export * from "./affordances.js";
export * from "./activation.js";
export * from "./prompts.js";
export * from "./results.js";

export function createInteractionKit(config = {}) {
  const extendApi = config.createApi;
  return createDomainKit({
    ...config,

    manifestId: "interaction-kit",
    id: config.id ?? "interaction-kit",

    domainPath: config.domainPath ?? "n:interaction",
    domain: "interaction",

    apiName: config.apiName ?? "interaction",
    purpose: "Targets, affordances, activation progress, prompts, semantic requirements, and interaction completion events.",
    owns: ["targets", "affordances", "activation progress", "prompts", "interaction completion events"],
    doesNotOwn: ["raw input device handling", "renderer UI implementation"],
    createApi(context) {
      const { baseApi } = context;
      return {
        stepInteractor(request) {
          const records = baseApi.getState().interactors ?? {};
          const previous = Object.hasOwn(records, request.id) ? records[request.id] : null;
          if (!previous && Object.keys(records).length >= 32) throw new RangeError('Interactor capacity reached.');
          const result = advanceInteractor(previous, request);
          if (!result.duplicate) baseApi.update({ interactors: { ...records, [request.id]: result.state } });
          return structuredClone(result);
        },
        ...(typeof extendApi === 'function' ? extendApi(context) : {})
      };
    },
    metadata: {
      ...(config.metadata ?? {}),
      piecesFirst: true
    }
  });
}
