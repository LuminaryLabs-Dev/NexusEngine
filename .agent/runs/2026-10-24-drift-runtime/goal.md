# Configured scene runtime / Drift Isles publication

Move reusable scene/project/runtime and standalone browser/export support out of Studio into the optional `configured-scene-runtime-kit` under NexusEngine. Compose existing Core Domains; keep platform-specific Three.js in the optional browser host and all Drift Isles content in its public game repository. Studio remains the authoring interface and API/export consumer.

Validate migration from the 0.6 project without altering its original, runtime parity, installation idempotency, snapshot/reset/replay, browser/native Studio and independent Engine-only game builds. Publish the game to Website/main/drift-isles with a playable public Pages link on the homepage. Preserve main/root legacy deployment and all YAML. Preserve unrelated dirty Engine checkout.
