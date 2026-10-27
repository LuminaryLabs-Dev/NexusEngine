#include "nexusgl/renderer.hpp"
#include "nexusgl/lighting.hpp"

#include <algorithm>
#include <cmath>
#include <stdexcept>
#include <utility>

namespace nexusgl {
namespace {
// Limit arithmetic before edge products, squaring, or integer conversion.
bool valid(double value) {
    return std::isfinite(value) && std::abs(value) <= 1e9;
}
bool valid(Point p) {
    return valid(p.x) && valid(p.y);
}
int lower(double value, int limit) {
    return static_cast<int>(std::clamp(std::floor(value), 0.0, static_cast<double>(limit)));
}
int upper(double value, int limit) {
    return static_cast<int>(std::clamp(std::ceil(value), 0.0, static_cast<double>(limit)));
}
double edge(Point a, Point b, Point p) {
    return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
}
bool topLeft(Point a, Point b) {
    return b.y < a.y || (b.y == a.y && b.x > a.x);
}
bool inside(double e, bool inclusive) {
    return e > 0 || (e == 0 && inclusive);
}
} // namespace

Framebuffer::Framebuffer(int width, int height) {
    resize(width, height);
}
void Framebuffer::resize(int width, int height) {
    if (width <= 0 || height <= 0 || width > maxDimension || height > maxDimension ||
        static_cast<std::size_t>(width) * static_cast<std::size_t>(height) > maxPixels)
        throw std::invalid_argument(
            "framebuffer dimensions exceed the positive 8192-axis / 16M-pixel limit");
    if (width == width_ && height == height_)
        return;
    const auto bytes = static_cast<std::size_t>(width) * height * 4;
    if (bytes > pixels_.capacity()) {
        std::vector<std::uint8_t> replacement(bytes);
        pixels_.swap(replacement);
        ++allocations_;
    } else {
        pixels_.resize(bytes);
        std::fill(pixels_.begin(), pixels_.end(), 0);
    }
    width_ = width;
    height_ = height;
}
void Framebuffer::trim() {
    if (pixels_.capacity() != pixels_.size()) {
        std::vector<std::uint8_t> replacement(pixels_);
        pixels_.swap(replacement);
        ++allocations_;
    }
}
void Framebuffer::put(int x, int y, Color c) noexcept {
    const auto i = static_cast<std::size_t>(y) * stride() + static_cast<std::size_t>(x) * 4;
    pixels_[i] = c.r;
    pixels_[i + 1] = c.g;
    pixels_[i + 2] = c.b;
    pixels_[i + 3] = c.a;
}
void Framebuffer::blend(int x, int y, Color c) noexcept {
    if (c.a == 0)
        return;
    if (c.a == 255) {
        put(x, y, c);
        return;
    }
    const auto i = std::size_t(y) * stride() + std::size_t(x) * 4;
    const Color d{pixels_[i], pixels_[i + 1], pixels_[i + 2], pixels_[i + 3]};
    if (d.a == 0) {
        put(x, y, c);
        return;
    }
    const double a = c.a / 255.0, b = d.a / 255.0, alpha = a + b * (1 - a);
    if (c.r == d.r && c.g == d.g && c.b == d.b) {
        put(x, y, {c.r, c.g, c.b, std::uint8_t(std::lround(alpha * 255))});
        return;
    }
    const auto channel = [&](std::uint8_t s, std::uint8_t t) {
        const double linear = (srgbToLinear(s) * a + srgbToLinear(t) * b * (1 - a)) / alpha;
        return std::uint8_t(std::clamp(
            std::lround(255 * (linear <= .0031308 ? 12.92 * linear
                                                  : 1.055 * std::pow(linear, 1 / 2.4) - .055)),
            0L, 255L));
    };
    put(x, y,
        {channel(c.r, d.r), channel(c.g, d.g), channel(c.b, d.b),
         std::uint8_t(std::lround(alpha * 255))});
}
Color Framebuffer::pixel(int x, int y) const {
    if (x < 0 || y < 0 || x >= width_ || y >= height_)
        throw std::out_of_range("pixel outside framebuffer");
    const auto i = static_cast<std::size_t>(y) * stride() + static_cast<std::size_t>(x) * 4;
    return {pixels_[i], pixels_[i + 1], pixels_[i + 2], pixels_[i + 3]};
}
void Framebuffer::clear(Color c) noexcept {
    for (int y = 0; y < height_; ++y)
        for (int x = 0; x < width_; ++x)
            put(x, y, c);
}
void Framebuffer::rectangle(double x, double y, double w, double h, Color c) noexcept {
    if (!valid(x) || !valid(y) || !valid(w) || !valid(h) || w <= 0 || h <= 0)
        return;
    for (int py = lower(y, height_); py < upper(y + h, height_); ++py)
        for (int px = lower(x, width_); px < upper(x + w, width_); ++px)
            if (px + 0.5 >= x && px + 0.5 < x + w && py + 0.5 >= y && py + 0.5 < y + h)
                blend(px, py, c);
}
void Framebuffer::circle(Point center, double r, Color c) noexcept {
    if (!valid(center) || !valid(r) || r <= 0)
        return;
    for (int y = lower(center.y - r, height_); y < upper(center.y + r, height_); ++y)
        for (int x = lower(center.x - r, width_); x < upper(center.x + r, width_); ++x) {
            const double dx = x + 0.5 - center.x, dy = y + 0.5 - center.y;
            if (dx * dx + dy * dy <= r * r)
                blend(x, y, c);
        }
}
void Framebuffer::triangle(Point a, Point b, Point c, Color color) noexcept {
    if (!valid(a) || !valid(b) || !valid(c))
        return;
    const double area = edge(a, b, c);
    if (area == 0)
        return;
    if (area < 0)
        std::swap(b, c);
    const bool ab = topLeft(a, b), bc = topLeft(b, c), ca = topLeft(c, a);
    for (int y = lower(std::min({a.y, b.y, c.y}), height_);
         y < upper(std::max({a.y, b.y, c.y}), height_); ++y)
        for (int x = lower(std::min({a.x, b.x, c.x}), width_);
             x < upper(std::max({a.x, b.x, c.x}), width_); ++x) {
            const Point p{x + 0.5, y + 0.5};
            if (inside(edge(a, b, p), ab) && inside(edge(b, c, p), bc) && inside(edge(c, a, p), ca))
                blend(x, y, color);
        }
}
} // namespace nexusgl
