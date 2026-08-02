# Web Module Linker Kit

Materializes one immutable browser module closure for Web targets. The Kit
provisions exact `esbuild-wasm` source under external Build storage, installs
locked project dependencies with lifecycle scripts disabled, bundles ESM once,
and caches the resulting closure by content identity.
