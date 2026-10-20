#pragma once

#include "types.hpp"

#include <cstddef>
#include <cstdint>
#include <vector>

namespace nexusgl {
namespace render {
class CpuFrameKit;
}

// Top-left origin, pixel centers at (x + 0.5, y + 0.5), RGBA bytes.
// Straight sRGB RGBA storage; drawing uses linear-light source-over. Clear replaces.
class Framebuffer {
  public:
    static constexpr int maxDimension = 8192;
    static constexpr std::size_t maxPixels = 16 * 1024 * 1024;
    Framebuffer(int width, int height);
    void resize(int width, int height); // Strong exception guarantee.
    int width() const noexcept { return width_; }
    int height() const noexcept { return height_; }
    std::size_t stride() const noexcept { return static_cast<std::size_t>(width_) * 4; }
    const std::uint8_t* data() const noexcept { return pixels_.data(); }
    std::size_t size() const noexcept { return pixels_.size(); }
    Color pixel(int x, int y) const;
    void clear(Color color) noexcept;
    void triangle(Point a, Point b, Point c, Color color) noexcept;
    void rectangle(double x, double y, double width, double height, Color color) noexcept;
    void circle(Point center, double radius, Color color) noexcept;

  private:
    friend class RenderTarget3D;
    friend class GaussianUpsampler;
    friend class render::CpuFrameKit;
    void blend(int x, int y, Color color) noexcept;
    void put(int x, int y, Color color) noexcept;
    int width_ = 0, height_ = 0;
    std::vector<std::uint8_t> pixels_;
};
} // namespace nexusgl
