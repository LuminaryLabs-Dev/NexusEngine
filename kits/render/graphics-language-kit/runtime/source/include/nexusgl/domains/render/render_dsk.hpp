#pragma once
#include "nexusgl/domains/scene/descriptors.hpp"
#include "nexusgl/renderer.hpp"
#include <memory>

namespace nexusgl::render {
inline constexpr std::size_t maxGuidedPixels = 4 * 1024 * 1024;
enum class Quality { GaussianHalf, Native, GuidedHalf };
// Observer supplies its own clock; rendering domains do not read wall time.
struct ProfileHooks {
    void* context = nullptr;
    void (*mark)(void*, const char*, bool) noexcept = nullptr;
};
class ProfileScope {
  public:
    ProfileScope(ProfileHooks hooks, const char* name) : hooks_(hooks), name_(name) {
        if (hooks_.mark)
            hooks_.mark(hooks_.context, name_, true);
    }
    ~ProfileScope() {
        if (hooks_.mark)
            hooks_.mark(hooks_.context, name_, false);
    }

  private:
    ProfileHooks hooks_;
    const char* name_;
};
struct ResourceLimits {
    std::uint64_t budgetBytes = 512ULL * 1024 * 1024;
    std::size_t transparentFragments = 8 * 1024 * 1024;
    std::uint64_t externalReservationBytes = 0;
};
struct FrameStatistics {
    std::uint64_t estimatedPeakBytes = 0, residentBytes = 0;
    std::size_t transparentFragments = 0, guidedExactPixels = 0;
    bool shadowCacheHit = false;
};
struct Snapshot {
    unsigned version = 1;
    Quality quality = Quality::GaussianHalf;
    ResourceLimits limits{};
};
class ResolutionKit {
  public:
    Quality quality() const noexcept { return quality_; }
    void setQuality(Quality quality);
    Snapshot snapshot() const noexcept { return {1, quality_}; }
    void restore(Snapshot snapshot);
    void reset() noexcept { quality_ = Quality::GaussianHalf; }

  private:
    Quality quality_ = Quality::GaussianHalf;
};
struct Receipt {
    bool valid = false;
    std::uint64_t serial = 0;
    int outputWidth = 0, outputHeight = 0, internalWidth = 0, internalHeight = 0;
    Quality quality = Quality::GaussianHalf;
    bool spatial = false;
    int lightingWidth = 0, lightingHeight = 0;
};
class CpuFrameKit;
class RenderDSK {
  public:
    static constexpr const char* id = "nexusgl.render";
    RenderDSK();
    ~RenderDSK();
    RenderDSK(const RenderDSK&) = delete;
    RenderDSK& operator=(const RenderDSK&) = delete;
    const Framebuffer& render(const scene::Descriptor& descriptor, int width, int height);
    // Single-flight execution. Per-submission quality is captured before a worker starts.
    // Only default quality commands may overlap execution; join before resource/lifecycle/receipt
    // access.
    const Framebuffer& renderAtQuality(const scene::Descriptor& descriptor, int width, int height,
                                       Quality quality);
    void setQuality(Quality quality) { resolution_.setQuality(quality); }
    Quality quality() const noexcept { return resolution_.quality(); }
    const Receipt& lastReceipt() const noexcept { return receipt_; }
    Snapshot snapshot() const noexcept {
        auto result = resolution_.snapshot();
        result.limits = limits_;
        return result;
    }
    void setResourceLimits(ResourceLimits limits);
    void setExternalReservation(std::uint64_t bytes);
    ResourceLimits resourceLimits() const noexcept { return limits_; }
    const FrameStatistics& statistics() const noexcept;
    void trimResources();
    void setProfileHooks(ProfileHooks hooks) noexcept { hooks_ = hooks; }
    void reset();
    void restore(Snapshot snapshot);

  private:
    ResolutionKit resolution_;
    std::unique_ptr<CpuFrameKit> execution_;
    Receipt receipt_;
    ProfileHooks hooks_;
    ResourceLimits limits_;
};
} // namespace nexusgl::render
