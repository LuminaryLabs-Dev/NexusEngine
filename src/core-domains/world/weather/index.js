import { createWeatherKit } from "./weather-domain.js";
import { createLayeredWeatherDomain } from "./layered-weather-domain/index.js";

export * from "./contracts.js";
export * from "./weather-domain.js";
export * from "./layered-weather-domain/index.js";

export function createWeatherDomain(config = {}) {
  const rootConfig = config.root ?? config.weather ?? config;
  const layeredConfig = config.layered ?? {};
  return [
    createWeatherKit(rootConfig),
    createLayeredWeatherDomain(layeredConfig)
  ];
}

export default createWeatherDomain;
