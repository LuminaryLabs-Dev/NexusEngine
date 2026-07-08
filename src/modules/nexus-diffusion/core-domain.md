# nexus-diffusion-domain

Purpose: composed diffusion domain for tiny browser-trainable generative models.

Owns: diffusion lifecycle state, subdomain composition, high-level prepare/train/sample/checkpoint/preview API, and render-agnostic preview descriptors.

Does not own: product-specific UI, hosted datasets with product copy, full WebGPU kernels, Stable Diffusion compatibility, or app routes.

Subdomains:

- diffusion-dataset: procedural shape data and batch streaming.
- diffusion-tensor: CPU Float32Array tensor descriptors and math.
- diffusion-backend: CPU execution and WebGPU capability reporting.
- diffusion-noise: linear schedule, educational steps, forward/reverse noising.
- diffusion-model: tiny trainable denoiser model and weights.
- diffusion-training: epoch runner, MSE-style loss, SGD-style model updates, metrics.
- diffusion-sampling: seeded noise, reverse steps, DDPM-like sampling frames.
- diffusion-checkpoint: memory checkpoints and restore records.
- diffusion-preview: dataset, noise, denoise, loss, and backend descriptors.

Public API: `createNexusDiffusionKits(config?)` and `createNexusDiffusionDomain(config?)`.

Boundary: this module proves Nexus Engine can host trainable generative domains while keeping math, data, backends, training, sampling, checkpointing, and preview inspectable as separate sub-kits.

Proof required: deterministic smoke that prepares, trains one epoch, samples frames, saves/restores a checkpoint, and returns preview descriptors.
