#include "nexusgl/gaussian.hpp"
#include <algorithm>
#include <cmath>
#include <stdexcept>

namespace nexusgl {
void GaussianUpsampler::axis(int source, int destination, std::vector<Taps>& result) {
    result.resize(destination);
    for (int i = 0; i < destination; ++i) {
        const double center = (i + .5) * source / destination - .5;
        const int first = static_cast<int>(std::floor(center)) - 1;
        double sum = 0;
        for (int tap = 0; tap < 4; ++tap) {
            const double distance = first + tap - center;
            const float weight = static_cast<float>(std::exp(-distance * distance / (2 * .6 * .6)));
            result[i].index[tap] = std::clamp(first + tap, 0, source - 1);
            result[i].weight[tap] = weight;
            sum += weight;
        }
        for (auto& weight : result[i].weight)
            weight = static_cast<float>(weight / sum);
    }
}
void GaussianUpsampler::prepare(int width, int height, int ow, int oh, bool alpha) {
    const auto reserve = [&](auto& values, std::size_t count) {
        if (count > values.capacity()) {
            values.reserve(count);
            ++allocations_;
        }
    };
    const auto count = std::size_t(ow) * height;
    // Capacity reservations cannot invalidate the old tap keys/content on
    // failure.
    reserve(horizontal_, ow);
    reserve(vertical_, oh);
    reserve(temporary_, count);
    if (alpha)
        reserve(temporaryAlpha_, count);
    axis(width, ow, horizontal_);
    axis(height, oh, vertical_);
    temporary_.resize(count);
    if (alpha)
        temporaryAlpha_.resize(count);
    sourceWidth_ = width;
    sourceHeight_ = height;
    outputWidth_ = ow;
    outputHeight_ = oh;
}
void GaussianUpsampler::reconstruct(const std::vector<LinearRGB>& source, int width, int height,
                                    Framebuffer& output, float exposure,
                                    const std::vector<float>* alpha) {
    if (width <= 0 || height <= 0 || width > Framebuffer::maxDimension ||
        height > Framebuffer::maxDimension ||
        static_cast<std::size_t>(width) * height > Framebuffer::maxPixels ||
        source.size() != static_cast<std::size_t>(width) * height)
        throw std::invalid_argument("invalid Gaussian source dimensions");
    if (alpha && alpha->size() != source.size())
        throw std::invalid_argument("alpha attachment size mismatch");
    if (alpha)
        for (float a : *alpha)
            if (!std::isfinite(a) || a < 0 || a > 1)
                throw std::invalid_argument("alpha attachment outside finite 0..1");
    const int ow = output.width(), oh = output.height();
    if (alpha) {
        const auto store = [&](int x, int y, LinearRGB c, float a) {
            Color color = displayColor(a > 0 ? c : LinearRGB{}, exposure);
            color.a = std::uint8_t(std::clamp(std::lround(a * 255), 0L, 255L));
            if (color.a == 0)
                color = {0, 0, 0, 0};
            output.put(x, y, color);
        };
        if (width == ow && height == oh) {
            for (int y = 0; y < oh; ++y)
                for (int x = 0; x < ow; ++x) {
                    const auto i = std::size_t(y) * width + x;
                    store(x, y, source[i], (*alpha)[i]);
                }
        } else {
            if (width != sourceWidth_ || height != sourceHeight_ || ow != outputWidth_ ||
                oh != outputHeight_) {
                prepare(width, height, ow, oh, true);
            }
            if (std::size_t(ow) * height > temporaryAlpha_.capacity())
                ++allocations_;
            temporaryAlpha_.resize(std::size_t(ow) * height);
            for (int y = 0; y < height; ++y)
                for (int x = 0; x < ow; ++x) {
                    LinearRGB c{};
                    float a = 0;
                    const auto& taps = horizontal_[x];
                    for (int k = 0; k < 4; ++k) {
                        const auto i = std::size_t(y) * width + taps.index[k];
                        const float w = taps.weight[k] * (*alpha)[i];
                        c.r += source[i].r * w;
                        c.g += source[i].g * w;
                        c.b += source[i].b * w;
                        a += w;
                    }
                    const auto i = std::size_t(y) * ow + x;
                    temporary_[i] = c;
                    temporaryAlpha_[i] = a;
                }
            for (int y = 0; y < oh; ++y)
                for (int x = 0; x < ow; ++x) {
                    LinearRGB c{};
                    float a = 0;
                    const auto& taps = vertical_[y];
                    for (int k = 0; k < 4; ++k) {
                        const auto i = std::size_t(taps.index[k]) * ow + x;
                        const float w = taps.weight[k];
                        c.r += temporary_[i].r * w;
                        c.g += temporary_[i].g * w;
                        c.b += temporary_[i].b * w;
                        a += temporaryAlpha_[i] * w;
                    }
                    if (a > 0)
                        c = {c.r / a, c.g / a, c.b / a};
                    store(x, y, c, a);
                }
        }
        return;
    }
    if (width == ow && height == oh) {
        for (int y = 0; y < oh; ++y)
            for (int x = 0; x < ow; ++x)
                output.put(x, y,
                           displayColor(source[static_cast<std::size_t>(y) * width + x], exposure));
        return;
    }
    if (width != sourceWidth_ || height != sourceHeight_ || ow != outputWidth_ ||
        oh != outputHeight_) {
        prepare(width, height, ow, oh, false);
    }
    for (int y = 0; y < height; ++y)
        for (int x = 0; x < ow; ++x) {
            LinearRGB c{};
            const auto& taps = horizontal_[x];
            for (int k = 0; k < 4; ++k) {
                const auto& sample = source[static_cast<std::size_t>(y) * width + taps.index[k]];
                const auto w = taps.weight[k];
                c.r += sample.r * w;
                c.g += sample.g * w;
                c.b += sample.b * w;
            }
            temporary_[static_cast<std::size_t>(y) * ow + x] = c;
        }
    for (int y = 0; y < oh; ++y)
        for (int x = 0; x < ow; ++x) {
            LinearRGB c{};
            const auto& taps = vertical_[y];
            for (int k = 0; k < 4; ++k) {
                const auto& sample = temporary_[static_cast<std::size_t>(taps.index[k]) * ow + x];
                const auto w = taps.weight[k];
                c.r += sample.r * w;
                c.g += sample.g * w;
                c.b += sample.b * w;
            }
            output.put(x, y, displayColor(c, exposure));
        }
}
} // namespace nexusgl
