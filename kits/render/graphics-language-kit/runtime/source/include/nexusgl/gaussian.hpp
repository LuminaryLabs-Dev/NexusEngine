#pragma once
#include "lighting.hpp"
#include <array>

namespace nexusgl {
// Four normalized Gaussian taps per axis in source-pixel coordinates.
// Reconstruct linear HDR first, then tone-map/encode once at output resolution.
class GaussianUpsampler {
  public:
    void reconstruct(const std::vector<LinearRGB>& source, int width, int height,
                     Framebuffer& output, float exposure = 1.25f,
                     const std::vector<float>* alpha = nullptr);
    std::size_t allocatedBytes() const noexcept {
        return temporary_.capacity() * sizeof(LinearRGB) +
               temporaryAlpha_.capacity() * sizeof(float) +
               (horizontal_.capacity() + vertical_.capacity()) * sizeof(Taps);
    }

  private:
    struct Taps {
        std::array<int, 4> index{};
        std::array<float, 4> weight{};
    };
    static std::vector<Taps> axis(int source, int destination);
    int sourceWidth_ = 0, sourceHeight_ = 0, outputWidth_ = 0, outputHeight_ = 0;
    std::vector<Taps> horizontal_, vertical_;
    std::vector<LinearRGB> temporary_;
    std::vector<float> temporaryAlpha_;
};
} // namespace nexusgl
