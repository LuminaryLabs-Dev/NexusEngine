# core-audio-kit

Purpose: audio descriptor contracts without owning a concrete playback backend.

Owns: audio cues, music state, ambient zones, mix groups, volume policy, spatial audio descriptors, and audio adapter boundaries.

Does not own: playback backend implementation, native audio engine, or asset decoding.

Public API: `createCoreAudioKit(config?)`.

Proof required: audio cue descriptor smoke, mix group smoke, adapter boundary smoke, deterministic headless smoke.
