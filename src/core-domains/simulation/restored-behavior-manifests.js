import locomotion from "./subdomains/motion/subdomains/locomotion/subdomain.manifest.js";
import vehicle from "./subdomains/motion/subdomains/vehicle/subdomain.manifest.js";
import worldContact from "./subdomains/physics/subdomains/world-contact/subdomain.manifest.js";
import recovery from "./subdomains/recovery/subdomain.manifest.js";
import softRespawn from "./subdomains/recovery/subdomains/soft-respawn/subdomain.manifest.js";
import actionLocomotionKit from "./subdomains/motion/subdomains/locomotion/kits/action-locomotion-kit/kit.manifest.js";
import vehicleDynamicsKit from "./subdomains/motion/subdomains/vehicle/kits/vehicle-dynamics-kit/kit.manifest.js";
import worldContactKit from "./subdomains/physics/subdomains/world-contact/kits/world-contact-kit/kit.manifest.js";
import softRespawnKit from "./subdomains/recovery/subdomains/soft-respawn/kits/soft-respawn-kit/kit.manifest.js";

export const RESTORED_SIMULATION_SUBDOMAINS = Object.freeze([locomotion, vehicle, worldContact, recovery, softRespawn]);
export const RESTORED_SIMULATION_KITS = Object.freeze([actionLocomotionKit, vehicleDynamicsKit, worldContactKit, softRespawnKit]);
