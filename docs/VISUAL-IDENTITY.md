# NexusEngine Visual Identity

The repository identity represents a deterministic Core that composes
domain-owned capabilities into a stable runtime. It describes NexusEngine
itself; it does not prescribe the art direction of games or simulations built
with the package.

## Concept

- **Open frame:** Core provides boundaries and contracts without enclosing the
  application in one product shape.
- **Central pulse:** deterministic scheduling and runtime state remain the
  stable center.
- **Connected modules:** independently owned Domains and Kits compose through
  explicit contracts.
- **Completed field:** the cover moves from primitives through runtime and
  domain composition into a persistent application state.

The images intentionally avoid game characters, editor interfaces, robots,
brains, gears, and futuristic machinery. Those motifs would imply product or
agent behavior that Core does not own.

## Palette

| Role | Color |
| --- | --- |
| Runtime foundation | `#0B2F25` |
| Core teal | `#0B6E69` |
| Domain blue | `#1559C1` |
| Validation gold | `#E2AD31` |
| Paper highlight | `#F4EEDC` |

Keep text contrast independent of the artwork. Do not place body copy over the
cover's detailed center flow.

## Assets

All repository assets live in [`docs/assets/brand/`](assets/brand/).

| Asset | Use |
| --- | --- |
| `logo-transparent.png` | Full-resolution transparent mark |
| `logo-1024.png`, `logo-512.png`, `logo-256.png` | Standard raster sizes |
| `logo-mask.svg` | Editable single-color mask |
| `cover-1280x640.png` | README, documentation, and wide presentation cover |
| `social-card.png` | Link previews and repository announcements |
| `logo-source.png`, `cover-source.png` | Retained generated sources |
| `manifest.json` | Dimensions, settings, provenance, and file hashes |

The editable SVG is a mask, not the multicolor primary mark. Change its single
fill color when a one-color application is required.

## Accessibility and Use

- Keep the complete logo visible with clear space around it.
- Do not crop the four-stage cover flow or place copy over its central groups.
- Use descriptive alt text such as “NexusEngine runtime composition from
  primitives through deterministic Core domains.”
- Treat the graphics as supporting context; repeat important architecture and
  status information in text.
- Verify contrast whenever the transparent mark is placed on a new background.

## Rebuild

The pack was produced with the local `repo-image-studio` workflow, its chroma
removal helper, and `ffmpeg`. The source images, processing settings, tool
versions, dimensions, and SHA-256 hashes are recorded in
[`manifest.json`](assets/brand/manifest.json). Validate a rebuilt pack with:

```bash
python3 <repo-image-studio>/scripts/build_image_pack.py validate \
  --pack-dir docs/assets/brand
```

Regeneration requires a new source review. Do not overwrite an established
asset merely to produce stylistic variation.
