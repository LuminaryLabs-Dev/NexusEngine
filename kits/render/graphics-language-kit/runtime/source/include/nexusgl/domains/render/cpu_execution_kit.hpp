#pragma once
#include "nexusgl/gaussian.hpp"
#include "nexusgl/render3d.hpp"
#include "render_dsk.hpp"

namespace nexusgl::render {
// CPU provider Kit: consumes descriptors; never creates scene meaning or clocks.
void executeCanvas(Framebuffer& target, const scene::CanvasFrame& frame);
void executeScene(RenderTarget3D& target, const scene::SceneFrame& frame,
                  const Mat4& viewProjection, bool shadowPass = false);
class CpuFrameKit {
  public:
    CpuFrameKit() = default;
    void setProfileHooks(ProfileHooks hooks) noexcept { hooks_ = hooks; }
    CpuFrameKit(const CpuFrameKit&) = delete;
    CpuFrameKit& operator=(const CpuFrameKit&) = delete;
    const FrameStatistics& statistics() const noexcept { return statistics_; }

  private:
    friend class RenderDSK;
    void setResourceLimits(ResourceLimits limits) noexcept { limits_ = limits; }
    const Framebuffer& render(const scene::CanvasFrame& frame, int width, int height);
    const Framebuffer& render(const scene::SceneFrame& frame, int width, int height,
                              Quality quality);

  private:
    void resolveGuided(const scene::SceneFrame& frame, const LightingSettings& settings);
    void drawOutlines(const scene::SceneFrame& frame, bool hdr = false);
    ProfileHooks hooks_;
    ResourceLimits limits_;
    FrameStatistics statistics_;
    std::vector<std::uint8_t> shadowKey_;
    std::vector<float> visibility_;
    RenderTarget3D target_{1, 1}, shadow_{1, 1, true};
    Framebuffer output_{1, 1}, canvas_{1, 1};
    GaussianUpsampler reconstruction_;
};
} // namespace nexusgl::render
