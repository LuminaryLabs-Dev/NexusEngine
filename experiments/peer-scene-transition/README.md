# Peer Scene Transition Experiment

This experiment validates the Core Scene Kit as a host-agnostic scene lifecycle domain.

The scenes are simple HTML hosts, but the scene truth is not stored in the HTML files:

- `core-scene-kit` owns current scene, visited scenes, transition validation, ledgers, and host descriptors.
- `web-html` scene host binding performs browser navigation only after an accepted transition.
- `sessionStorage` carries a snapshot between pages so the campaign can continue across HTML reloads.

Try this route:

```txt
camp.html → take lantern → crossroads.html → forest.html → shrine.html → ending.html
```

Then reset and try:

```txt
camp.html → crossroads.html → bridge.html → shrine.html → camp.html
```

The same transition descriptors can later be mounted by native scene hosts such as `rust-native` or `rust-command-buffer` without changing the core scene lifecycle rules.
