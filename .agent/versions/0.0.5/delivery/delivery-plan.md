# Goal Matrix Batch Delivery Plan

- Phase: plan
- Authority: read-only
- Master packages: 67
- Source candidates: 40
- Integrated but unproven: 6
- Active bounded reviews: 0
- Actionable review queue: 35
- Ready for agent semantic review: 18
- Repair or boundary review required: 17
- Engine feature tests executed: 0
- Matrix transitions: 0

| Wave | Package | Disposition | AST issues | Unauthorized | Overlap |
|---:|---|---|---:|---:|---:|
| 4 | `master-package-n-physics-detection` | agent-semantic-review-ready | 0 | 0 | 0 |
| 5 | `master-package-n-physics-contact` | ast-repair-required | 26 | 0 | 0 |
| 5 | `master-package-n-physics-queries` | dependency-review-required | 11 | 0 | 0 |
| 5 | `master-package-n-render-geometry` | agent-semantic-review-ready | 0 | 0 | 0 |
| 6 | `master-package-n-physics-solver` | dependency-review-required | 13 | 0 | 0 |
| 6 | `master-package-n-physics-surfaces` | boundary-review-required | 29 | 2 | 1 |
| 6 | `master-package-n-render-animation` | dependency-review-required | 8 | 0 | 0 |
| 7 | `master-package-n-physics-articulation` | agent-semantic-review-ready | 0 | 0 | 0 |
| 7 | `master-package-n-physics-execution` | dependency-review-required | 2 | 0 | 0 |
| 7 | `master-package-n-physics-integration` | boundary-review-required | 10 | 1 | 1 |
| 7 | `master-package-n-render-lighting` | agent-semantic-review-ready | 0 | 0 | 0 |
| 7 | `master-package-n-render-pipeline` | ast-repair-required | 18 | 0 | 0 |
| 8 | `master-package-n-physics-determinism` | dependency-review-required | 1 | 0 | 0 |
| 8 | `master-package-n-render-effects` | boundary-review-required | 22 | 3 | 1 |
| 8 | `master-package-n-render-frame` | ast-repair-required | 13 | 0 | 0 |
| 8 | `master-package-n-render-scene` | agent-semantic-review-ready | 0 | 0 | 0 |
| 9 | `master-package-n-physics-provider` | agent-semantic-review-ready | 0 | 0 | 0 |
| 9 | `master-package-n-physics-recovery` | dependency-review-required | 5 | 0 | 0 |
| 9 | `master-package-n-render-bridge` | dependency-review-required | 10 | 0 | 0 |
| 9 | `master-package-n-render-capture` | agent-semantic-review-ready | 0 | 0 | 0 |
| 9 | `master-package-n-render-postprocess` | dependency-review-required | 1 | 0 | 0 |
| 9 | `master-package-n-render-visibility` | ast-repair-required | 1 | 0 | 0 |
| 10 | `master-package-n-physics-diagnostics` | agent-semantic-review-ready | 0 | 0 | 0 |
| 10 | `master-package-n-render-provider` | dependency-review-required | 2 | 0 | 0 |
| 11 | `master-package-n-render-diagnostics` | dependency-review-required | 1 | 0 | 0 |
| 11 | `master-package-n-render-xr` | agent-semantic-review-ready | 0 | 0 | 0 |
| 11 | `master-package-nexusengine-kits-n-physics-physx` | agent-semantic-review-ready | 0 | 0 | 0 |
| 11 | `master-package-nexusengine-kits-n-physics-rapier` | agent-semantic-review-ready | 0 | 0 | 0 |
| 11 | `master-package-nexusengine-kits-n-physics-reference` | agent-semantic-review-ready | 0 | 0 | 0 |
| 11 | `master-package-nexusengine-kits-n-render-webgl2` | agent-semantic-review-ready | 0 | 0 | 0 |
| 12 | `master-package-nexusengine-kits-n-render-headless` | agent-semantic-review-ready | 0 | 0 | 0 |
| 12 | `master-package-nexusengine-kits-n-render-openxr` | agent-semantic-review-ready | 0 | 0 | 0 |
| 12 | `master-package-nexusengine-kits-n-render-threejs` | agent-semantic-review-ready | 0 | 0 | 0 |
| 13 | `master-package-nexusengine-kits-n-render-android-xr` | agent-semantic-review-ready | 0 | 0 | 0 |
| 13 | `master-package-nexusengine-kits-n-render-pcvr` | agent-semantic-review-ready | 0 | 0 | 0 |

Source must reach the source-freeze gate before feature validation begins. Detailed nodes promote only from observed evidence.
