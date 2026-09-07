# Core Dependency Table

Registry SHA-256: `d2b8af8d1d542bdb125d33b8a4ff5a32de1cf73da399e57e9a29b5ae35d4a8f5`

| Owner | Requires | Optional |
| --- | --- | --- |
| `n:actor` | - | - |
| `n:actor:creature` | `n:actor` | - |
| `n:actor:character` | `n:actor` | - |
| `n:actor:player` | `n:actor:character` | - |
| `n:agent` | - | - |
| `n:asset` | - | - |
| `n:authoring` | `n:runtime` | - |
| `n:authoring:modifier` | `n:authoring:mesh`, `n:authoring:project` | - |
| `n:authoring:publishing` | `n:authoring:assembly`, `n:authoring:project` | - |
| `n:authoring:sequence` | `n:authoring:project` | - |
| `n:authoring:domain-composition` | `n:authoring:project` | - |
| `n:authoring:assembly` | `n:authoring:animation`, `n:authoring:material`, `n:authoring:mesh`, `n:authoring:project`, `n:authoring:rig`, `n:authoring:skin` | - |
| `n:authoring:animation` | `n:authoring:mesh`, `n:authoring:project`, `n:authoring:rig`, `n:authoring:skin` | - |
| `n:authoring:skin` | `n:authoring:brush`, `n:authoring:mesh`, `n:authoring:project`, `n:authoring:rig` | - |
| `n:authoring:rig` | `n:authoring:project` | - |
| `n:authoring:paint` | `n:authoring:brush`, `n:authoring:material`, `n:authoring:mesh`, `n:authoring:project` | - |
| `n:authoring:material` | `n:authoring:project` | - |
| `n:authoring:uv` | `n:authoring:mesh`, `n:authoring:project` | - |
| `n:authoring:curve` | `n:authoring:mesh`, `n:authoring:project` | - |
| `n:authoring:sculpt` | `n:authoring:brush`, `n:authoring:mesh`, `n:authoring:project` | - |
| `n:authoring:brush` | `n:authoring:project` | - |
| `n:authoring:workspace` | `n:authoring:project` | - |
| `n:authoring:project` | `n:authoring` | - |
| `n:authoring:mesh` | `n:authoring:project` | - |
| `n:authoring:editing` | `n:authoring:mesh`, `n:authoring:project` | - |
| `n:build` | - | - |
| `n:build:source` | `n:build` | - |
| `n:build:analysis` | `n:build` | - |
| `n:build:ir` | `n:build` | - |
| `n:build:classification` | `n:build` | - |
| `n:build:orchestration` | `n:build` | - |
| `n:build:compile` | `n:build` | - |
| `n:build:toolchain` | `n:build` | - |
| `n:build:target` | `n:build` | - |
| `n:build:artifact` | `n:build` | - |
| `n:build:proof` | `n:build` | - |
| `n:build:target:web-live` | `n:build:target` | - |
| `n:build:target:web-static` | `n:build:target` | - |
| `n:build:target:openxr` | `n:build:target` | - |
| `n:build:target:android-xr` | `n:build:target` | - |
| `n:build:target:pcvr` | `n:build:target` | - |
| `n:composition` | - | `n:mcp` |
| `n:compute` | - | - |
| `n:compute:graph` | `n:compute` | - |
| `n:compute:graph:node` | `n:compute:graph` | - |
| `n:compute:graph:dependency` | `n:compute:graph` | - |
| `n:compute:graph:plan` | `n:compute:graph` | - |
| `n:compute:resource` | `n:compute` | - |
| `n:compute:resource:buffer` | `n:compute:resource` | - |
| `n:compute:resource:image` | `n:compute:resource` | - |
| `n:compute:resource:binding` | `n:compute:resource` | - |
| `n:compute:dispatch` | `n:compute` | - |
| `n:compute:dispatch:workgroup` | `n:compute:dispatch` | - |
| `n:compute:host` | `n:compute`, `n:host` | - |
| `n:compute:host:capability` | `n:compute:host` | - |
| `n:compute:host:selection` | `n:compute:host` | - |
| `n:compute:host:lifecycle` | `n:compute:host` | - |
| `n:compute:host:execution` | `n:compute:host` | - |
| `n:compute:host:execution:gpu` | `n:compute:host:execution`, `n:host:gpu` | - |
| `n:compute:host:execution:gpu:vulkan` | `n:compute:host:execution:gpu`, `n:host:gpu` | - |
| `n:compute:host:execution:gpu:opengl` | `n:compute:host:execution:gpu`, `n:host:gpu` | - |
| `n:compute:host:execution:cpu` | `n:compute:host:execution` | - |
| `n:compute:host:execution:cpu:javascript` | `n:compute:host:execution:cpu` | - |
| `n:compute:host:execution:cpu:wasm` | `n:compute:host:execution:cpu` | - |
| `n:compute:host:execution:cpu:native` | `n:compute:host:execution:cpu` | - |
| `n:compute:model` | `n:compute` | - |
| `n:compute:model:inference` | `n:compute:model` | - |
| `n:compute:model:inference:provider` | `n:compute:model:inference` | - |
| `n:diagnostics` | - | - |
| `n:host` | - | - |
| `n:host:gpu` | `n:host` | - |
| `n:host:gpu:capability` | `n:host:gpu` | - |
| `n:host:gpu:device` | `n:host:gpu` | - |
| `n:host:gpu:device:adapter` | `n:host:gpu:device` | - |
| `n:host:gpu:device:logical-device` | `n:host:gpu:device` | - |
| `n:host:gpu:device:queue` | `n:host:gpu:device` | - |
| `n:host:gpu:device:lifecycle` | `n:host:gpu:device` | - |
| `n:host:gpu:resource` | `n:host:gpu` | - |
| `n:host:gpu:synchronization` | `n:host:gpu` | - |
| `n:host:gpu:recovery` | `n:host:gpu` | - |
| `n:interaction` | - | - |
| `n:interaction:input` | - | - |
| `n:interaction:assistance-target` | `n:interaction` | - |
| `n:interaction:environmental-affordance` | `n:interaction` | - |
| `n:interaction:request` | `n:interaction` | - |
| `n:interaction:request:queue` | `n:interaction` | - |
| `n:interaction:request:fulfillment` | `n:interaction` | - |
| `n:interaction:transfer-zone` | `n:interaction` | - |
| `n:mcp` | - | `n:composition` |
| `n:network` | - | - |
| `n:network:transport` | `n:network` | - |
| `n:network:multiplayer` | `n:network`, `n:network:transport` | - |
| `n:network:multiplayer:session` | `n:network:multiplayer` | - |
| `n:network:multiplayer:authority` | `n:network:multiplayer` | - |
| `n:network:multiplayer:tick-sync` | `n:network:multiplayer` | - |
| `n:network:multiplayer:replication` | `n:network:multiplayer` | - |
| `n:object` | - | `n:asset`, `n:simulation:physics` |
| `n:object:shape` | `object:descriptor-contract` | - |
| `n:object:fidelity` | `object:descriptor-contract` | - |
| `n:object:vegetation` | `n:object` | - |
| `n:object:vegetation:tree` | `n:object:vegetation` | - |
| `n:object:vegetation:foliage` | `n:object:vegetation` | - |
| `n:object:vegetation:ecology` | `n:object:vegetation` | - |
| `n:object:placement` | `object:descriptor-contract` | - |
| `n:physics` | `n:runtime` | - |
| `n:physics:contracts` | `n:physics` | - |
| `n:physics:lifecycle` | `n:physics`, `physics:command-schema`, `physics:event-schema`, `physics:provider-contract`, `physics:state-schema` | - |
| `n:physics:body` | `n:physics`, `physics:command-schema`, `physics:event-schema`, `physics:state-schema` | - |
| `n:physics:shape` | `n:physics`, `physics:command-schema`, `physics:state-schema` | - |
| `n:physics:material` | `n:physics`, `physics:command-schema`, `physics:event-schema`, `physics:state-schema` | - |
| `n:physics:collider` | `n:physics`, `physics:body-registry`, `physics:command-schema`, `physics:event-schema`, `physics:material-registry`, `physics:shape-registry`, `physics:state-schema` | - |
| `n:physics:detection` | `n:physics`, `n:physics:collider`, `n:physics:shape` | - |
| `n:physics:constraints` | `n:physics`, `physics:body-registry`, `physics:command-schema`, `physics:event-schema`, `physics:state-schema` | - |
| `n:physics:world` | `n:physics`, `physics:command-schema`, `physics:event-schema`, `physics:state-schema` | - |
| `n:policy` | - | - |
| `n:presentation` | - | - |
| `n:presentation:output` | `n:presentation` | - |
| `n:presentation:graphics` | `n:presentation` | - |
| `n:presentation:camera` | `n:presentation` | - |
| `n:presentation:animation` | `n:presentation` | - |
| `n:presentation:audio` | `n:presentation` | - |
| `n:presentation:ui` | `n:presentation` | - |
| `n:presentation:speech` | `n:presentation` | - |
| `n:presentation:capture` | `n:presentation` | - |
| `n:presentation:sky` | `n:presentation` | - |
| `n:presentation:camera:third-person` | `character:resolution`, `motion:velocity`, `n:presentation:camera` | - |
| `n:render` | `n:runtime` | - |
| `n:render:contracts` | `n:render` | - |
| `n:render:lifecycle` | `n:render`, `render:provider-contract` | - |
| `n:render:device` | `n:render`, `render:installation`, `render:provider-contract` | - |
| `n:render:surface` | `n:render`, `render:device-contract`, `render:device-lifecycle`, `render:provider-contract` | - |
| `n:render:resource` | `n:render`, `render:device-contract`, `render:device-lifecycle`, `render:device-memory`, `render:device-queue`, `render:resource-schema` | - |
| `n:render:buffer` | `n:render`, `n:render:resource`, `render:device-queue`, `render:resource-identity`, `render:resource-lifecycle` | - |
| `n:render:texture` | `n:render`, `n:render:buffer`, `n:render:resource`, `render:buffer-resource`, `render:device-queue`, `render:resource-identity`, `render:resource-lifecycle` | - |
| `n:render:shader` | `n:render`, `n:render:contracts`, `n:render:device`, `n:render:resource`, `render:device-capability`, `render:device-queue`, `render:resource-identity`, `render:resource-lifecycle`, `render:shader-schema` | - |
| `n:render:material` | `n:render`, `n:render:resource`, `n:render:shader`, `n:render:texture`, `render:resource-identity`, `render:resource-lifecycle`, `render:shader-compile`, `render:shader-program`, `render:shader-reflection`, `render:shader-variant`, `render:texture-residency`, `render:texture-resource` | - |
| `n:render:camera` | `n:render`, `render:provider-contract` | - |
| `n:render:execution` | `n:render` | - |
| `n:render:execution:gpu` | `n:host:gpu`, `n:render:execution` | - |
| `n:runtime` | - | - |
| `n:runtime:realtime` | `n:runtime` | - |
| `n:runtime:data` | `n:runtime` | - |
| `n:runtime:transaction` | `n:runtime` | - |
| `n:runtime:persistence` | `n:runtime:data` | - |
| `n:runtime:sequence` | `n:runtime` | - |
| `n:runtime:startup` | `n:runtime` | `n:asset` |
| `n:runtime:sequence:schedule` | `n:runtime:sequence` | - |
| `n:simulation` | `n:runtime:realtime` | - |
| `n:simulation:physics` | `n:simulation` | - |
| `n:simulation:physics:articulated` | `n:simulation:physics` | - |
| `n:simulation:motion` | `n:simulation` | - |
| `n:simulation:motion:articulated` | `n:simulation:motion` | - |
| `n:simulation:motion:locomotion` | `n:simulation:motion` | - |
| `n:simulation:motion:vehicle` | `n:simulation:motion` | - |
| `n:simulation:physics:world-contact` | `n:simulation:physics` | - |
| `n:simulation:recovery` | `n:simulation` | - |
| `n:simulation:recovery:soft-respawn` | `n:simulation` | - |
| `n:simulation:economy` | `n:simulation` | - |
| `n:simulation:economy:accounts` | `n:simulation`, `transaction:idempotency` | - |
| `n:simulation:economy:cargo` | `n:simulation` | - |
| `n:simulation:operations` | `n:simulation` | - |
| `n:simulation:operations:facility` | `n:simulation` | - |
| `n:simulation:operations:occupant-flow` | `n:simulation` | - |
| `n:simulation:operations:transport-route` | `n:simulation` | - |
| `n:simulation:hazard-field` | `n:simulation` | - |
| `n:simulation:pursuit-pressure` | `n:simulation` | - |
| `n:simulation:progression` | `n:simulation` | - |
| `n:simulation:progression:lifecycle` | `n:simulation` | - |
| `n:spatial` | - | - |
| `n:spatial:scale` | `n:spatial` | - |
| `n:world` | `n:spatial` | - |
| `n:world:scene` | `n:world` | - |
| `n:world:weather` | `n:world` | - |
| `n:world:foundation` | `n:world` | - |
| `n:world:feature` | `n:world` | - |
| `n:world:feature:landform` | `n:world:feature` | - |
| `n:world:feature:hydrology` | `n:world:feature` | - |
| `n:world:feature:ecology` | `n:world:feature` | - |
| `n:world:feature:settlement` | `n:world:feature` | - |
| `n:world:feature:atmosphere` | `n:world:feature` | - |
| `n:world:navigation` | `n:world` | - |
| `n:world:navigation:navmesh` | `navigation:walkability-source` | - |
| `n:world:navigation:pathfinding` | `navigation:navmesh` | - |
| `n:world:navigation:route-field` | `n:world` | - |
| `n:world:navigation:landmark-guidance` | `n:world` | - |
| `n:world:generation` | `n:world` | - |
| `n:world:terrain` | `n:world` | - |
| `n:world:water-surface` | `n:world` | - |
