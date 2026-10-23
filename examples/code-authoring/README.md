# Code authoring and toolchain IDE

`node examples/code-authoring/main.mjs /absolute/project /absolute/external-state` opens a loopback IDE URL. Open that URL visibly. Source edits use Authoring Project, diagnostics/formatting use an optional TypeScript provider, and builds use exact approved snapshots through Build. Output execution is a separate action. Existing source files are preserved; sample creation occurs only if main.ts is absent. No downloads, shell interpolation or browser automation are performed.
