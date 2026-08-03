import assistanceTarget from "./subdomains/assistance-target/subdomain.manifest.js";
import environmentalAffordance from "./subdomains/environmental-affordance/subdomain.manifest.js";
import request from "./subdomains/request/subdomain.manifest.js";
import requestQueue from "./subdomains/request/subdomains/queue/subdomain.manifest.js";
import requestFulfillment from "./subdomains/request/subdomains/fulfillment/subdomain.manifest.js";
import transferZone from "./subdomains/transfer-zone/subdomain.manifest.js";
import assistanceTargetKit from "./subdomains/assistance-target/kits/assistance-target-kit/kit.manifest.js";
import environmentalAffordanceKit from "./subdomains/environmental-affordance/kits/environmental-affordance-kit/kit.manifest.js";
import requestQueueKit from "./subdomains/request/subdomains/queue/kits/request-queue-kit/kit.manifest.js";
import requestFulfillmentKit from "./subdomains/request/subdomains/fulfillment/kits/request-fulfillment-kit/kit.manifest.js";
import transferZoneKit from "./subdomains/transfer-zone/kits/transfer-zone-kit/kit.manifest.js";

export const RESTORED_INTERACTION_SUBDOMAINS = Object.freeze([assistanceTarget, environmentalAffordance, request, requestQueue, requestFulfillment, transferZone]);
export const RESTORED_INTERACTION_KITS = Object.freeze([assistanceTargetKit, environmentalAffordanceKit, requestQueueKit, requestFulfillmentKit, transferZoneKit]);
