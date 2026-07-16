import { createWeatherDomain } from "./weather-domain.js";
import { createLayeredWeatherDomain } from "./subdomains/layered-weather-domain/index.js";

export * from "./contracts.js";
export * from "./weather-domain.js";
export * from "./subdomains/layered-weather-domain/index.js";

export function createCoreWeatherDomain(config = {}) {
  const rootConfig = config.root ?? config.weather ?? config;
  const layeredConfig = config.layered ?? {};
  return [
    createWeatherDomain(rootConfig),
    createLayeredWeatherDomain(layeredConfig)
  ];
}

export default createCoreWeatherDomain;
