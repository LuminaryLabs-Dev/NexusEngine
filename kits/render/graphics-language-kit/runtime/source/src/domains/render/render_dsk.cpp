#include "nexusgl/domains/render/cpu_execution_kit.hpp"
#include <stdexcept>
#include <type_traits>

namespace nexusgl::render {
void ResolutionKit::setQuality(Quality quality) {
    if (quality != Quality::GaussianHalf && quality != Quality::Native &&
        quality != Quality::GuidedHalf)
        throw std::invalid_argument("unsupported render quality");
    quality_ = quality;
}
void ResolutionKit::restore(Snapshot snapshot) {
    if (snapshot.version != 1)
        throw std::invalid_argument("unsupported render snapshot version");
    setQuality(snapshot.quality);
}
RenderDSK::RenderDSK() : execution_(std::make_unique<CpuFrameKit>()) {}
RenderDSK::~RenderDSK() = default;
const Framebuffer& RenderDSK::render(const scene::Descriptor& descriptor, int width, int height) {
    return renderAtQuality(descriptor, width, height, quality());
}
const Framebuffer& RenderDSK::renderAtQuality(const scene::Descriptor& descriptor, int width,
                                              int height, Quality selectedQuality) {
    ResolutionKit check;
    check.setQuality(selectedQuality);
    {
        ProfileScope scope(hooks_, "validation");
        scene::validate(descriptor);
    }
    execution_->setProfileHooks(hooks_);
    execution_->setResourceLimits(limits_);
    const auto& output = std::visit(
        [&](const auto& frame) -> const Framebuffer& {
            using Frame = std::decay_t<decltype(frame)>;
            if constexpr (std::is_same_v<Frame, scene::SceneFrame>)
                return execution_->render(frame, width, height, selectedQuality);
            else
                return execution_->render(frame, width, height);
        },
        descriptor);
    const bool spatial = std::holds_alternative<scene::SceneFrame>(descriptor);
    const int scale = spatial ? std::get<scene::SceneFrame>(descriptor).display.sampleScale : 1;
    receipt_ = {
        true,
        receipt_.serial + 1,
        width,
        height,
        (spatial && selectedQuality == Quality::GaussianHalf ? (width + 1) / 2 : width) * scale,
        (spatial && selectedQuality == Quality::GaussianHalf ? (height + 1) / 2 : height) * scale,
        selectedQuality,
        spatial};
    receipt_.lightingWidth = spatial && selectedQuality == Quality::GuidedHalf
                                 ? (receipt_.internalWidth + 1) / 2
                                 : receipt_.internalWidth;
    receipt_.lightingHeight = spatial && selectedQuality == Quality::GuidedHalf
                                  ? (receipt_.internalHeight + 1) / 2
                                  : receipt_.internalHeight;
    return output;
}
void RenderDSK::setExternalReservation(std::uint64_t bytes) {
    if (bytes > limits_.budgetBytes)
        throw std::invalid_argument("external reservation exceeds budget");
    limits_.externalReservationBytes = bytes;
}
void RenderDSK::setResourceLimits(ResourceLimits limits) {
    if (limits.budgetBytes < 1024 * 1024 || limits.budgetBytes > 4ULL * 1024 * 1024 * 1024 ||
        limits.transparentFragments < 1 ||
        limits.transparentFragments > RenderTarget3D::maxTransparentFragments ||
        limits.externalReservationBytes > limits.budgetBytes)
        throw std::invalid_argument(
            "resource limits require 1 MiB..4 GiB and 1..8388608 fragments");
    trimResources();
    limits_ = limits;
}
const FrameStatistics& RenderDSK::statistics() const noexcept {
    return execution_->statistics();
}
void RenderDSK::trimResources() {
    auto replacement = std::make_unique<CpuFrameKit>();
    execution_.swap(replacement);
    receipt_ = {};
}
void RenderDSK::reset() {
    auto replacement = std::make_unique<CpuFrameKit>();
    execution_.swap(replacement);
    resolution_.reset();
    limits_ = {};
    receipt_ = {};
}
void RenderDSK::restore(Snapshot snapshot) {
    ResolutionKit resolution;
    resolution.restore(snapshot);
    RenderDSK checked;
    checked.setResourceLimits(snapshot.limits);
    auto replacement = std::make_unique<CpuFrameKit>();
    execution_.swap(replacement);
    resolution_ = resolution;
    limits_ = snapshot.limits;
    receipt_ = {};
}
} // namespace nexusgl::render
