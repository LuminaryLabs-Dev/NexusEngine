# Spatial Layout example

Run `node examples/spatial-layout/serve.mjs` from the repository root, then open `http://127.0.0.1:4179/`.

The application explicitly installs Spatial, Layout, Presentation and Output. It supplies Presentation's safe rectangle to a centered screen row, and a rotated Spatial coordinate frame to a three-dimensional grid. Both layouts reference the same A/B/C content. Changing UI scale affects only the screen layout. Resizing recalculates that row; the world coordinates remain stable. Reset restores the configured descriptions.

Canvas is only the example's display adapter. Layout's Core service performs the arrangement and returns portable placements. No scene transforms are changed by resolution.

With the server running, use `node examples/spatial-layout/prove.mjs` for the browser proof. It requires the repository's existing Playwright development dependency and Chromium installation. An optional first argument selects the output directory. Numerical and installed-lifecycle checks run separately with `node src/core-domains/spatial/tests/spatial-layout.mjs`.

Full contract: `src/core-domains/spatial/layout/README.md`.
