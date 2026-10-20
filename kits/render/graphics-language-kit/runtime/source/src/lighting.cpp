#include "nexusgl/render3d.hpp"
#include <algorithm>
#include <array>
#include <cmath>
#include <stdexcept>

namespace nexusgl {
namespace {
Vec3 normalized(Vec3 v) {
    const double length = std::sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    return length > 1e-12 ? Vec3{v.x / length, v.y / length, v.z / length} : Vec3{0, 1, 0};
}
double dot(Vec3 a, Vec3 b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}
float visibility(Vec3 world, Vec3 normal, const LightingSettings& settings) {
    if (!settings.shadowMap)
        return 1;
    const Vec4 clip = settings.worldToShadow * Vec4{world.x, world.y, world.z, 1};
    if (clip.w <= 1e-9)
        return 1;
    const double x = clip.x / clip.w, y = clip.y / clip.w, z = clip.z / clip.w;
    if (x < -1 || x > 1 || y < -1 || y > 1 || z < 0 || z > 1)
        return 1;
    const auto& target = *settings.shadowMap;
    const int px = static_cast<int>((x * .5 + .5) * target.width());
    const int py = static_cast<int>((.5 - y * .5) * target.height());
    // Receiver-plane depth correction: compare each PCF tap against the
    // surface depth at that tap, rather than biasing a sloped face uniformly.
    const auto& m = settings.worldToShadow.values;
    const Vec3 ax{m[0], m[1], m[2]}, ay{m[4], m[5], m[6]}, az{m[8], m[9], m[10]};
    const auto cross = [](Vec3 a, Vec3 b) {
        return Vec3{a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x};
    };
    const Vec3 projectedNormal{
        dot(settings.prepared ? settings.shadowCofactorX : cross(ay, az), normal),
        dot(settings.prepared ? settings.shadowCofactorY : cross(az, ax), normal),
        dot(settings.prepared ? settings.shadowCofactorZ : cross(ax, ay), normal)};
    const double bias = settings.shadowBias;
    const int radius = std::clamp(settings.shadowFilterRadius, 0, 2);
    constexpr float weights[3] = {1, 2, 1};
    float sum = 0;
    for (int dy = -radius; dy <= radius; ++dy)
        for (int dx = -radius; dx <= radius; ++dx) {
            const int sx = std::clamp(px + dx, 0, target.width() - 1),
                      sy = std::clamp(py + dy, 0, target.height() - 1);
            const double sampleX = (sx + .5) * 2 / target.width() - 1;
            const double sampleY = 1 - (sy + .5) * 2 / target.height();
            const double correction =
                std::abs(projectedNormal.z) > 1e-12
                    ? std::clamp(
                          -(projectedNormal.x * (sampleX - x) + projectedNormal.y * (sampleY - y)) /
                              projectedNormal.z,
                          -settings.receiverPlaneClamp, settings.receiverPlaneClamp)
                    : 0;
            constexpr float wide[5] = {1, 4, 6, 4, 1};
            const float weight = radius == 0 ? 1
                                             : (radius == 1 ? weights[dx + 1] * weights[dy + 1]
                                                            : wide[dx + 2] * wide[dy + 2]);
            sum += weight * (z + correction - bias <= target.depth(sx, sy) ? 1.0f : 0.0f);
        }
    return sum / (radius == 0 ? 1.f : (radius == 1 ? 16.f : 256.f));
}
} // namespace
float srgbToLinear(std::uint8_t channel) noexcept {
    static const auto table = []() {
        std::array<float, 256> values{};
        for (int i = 0; i < 256; ++i) {
            const double x = i / 255.0;
            values[i] =
                static_cast<float>(x <= .04045 ? x / 12.92 : std::pow((x + .055) / 1.055, 2.4));
        }
        return values;
    }();
    return table[channel];
}
Color displayColor(LinearRGB c) noexcept {
    return displayColor(c, 1.25f);
}
Color displayColor(LinearRGB c, float exposure) noexcept {
    static const auto table = []() {
        std::array<std::uint8_t, 4096> values{};
        for (int i = 0; i < 4096; ++i) {
            const double x = i / 4095.0;
            values[i] = static_cast<std::uint8_t>(std::lround(
                255 * (x <= .0031308 ? 12.92 * x : 1.055 * std::pow(x, 1 / 2.4) - .055)));
        }
        return values;
    }();
    const auto channel = [&](float x) {
        if (std::isnan(exposure) || exposure <= 0 || std::isnan(x) || x <= 0)
            return std::uint8_t{0};
        if (std::isinf(x) || std::isinf(exposure))
            return std::uint8_t{255};
        const double exposed = double(exposure) * double(x), mapped = exposed / (1 + exposed);
        return table[static_cast<std::size_t>(std::clamp(std::lround(mapped * 4095), 0L, 4095L))];
    };
    return {channel(c.r), channel(c.g), channel(c.b), 255};
}
static double referenceSpecular(double cosine, double power) noexcept {
    if (power != 56)
        return std::pow(cosine, power);
    // The reference exponent is common. Keep double intermediates and the general fallback.
    const double x2 = cosine * cosine, x4 = x2 * x2, x8 = x4 * x4, x16 = x8 * x8, x32 = x16 * x16;
    return x32 * x16 * x8;
}
static LinearRGB referenceShade(LinearRGB base, Vec3 world, Vec3 normal,
                                const LightingSettings& settings,
                                float suppliedVisibility) noexcept {
    const Vec3 n = normalized(normal), light = settings.prepared
                                                   ? settings.normalizedLight
                                                   : normalized(settings.directionToLight);
    const Vec3 view = normalized(
        {settings.camera.x - world.x, settings.camera.y - world.y, settings.camera.z - world.z});
    const Vec3 halfVector = normalized({view.x + light.x, view.y + light.y, view.z + light.z});
    const double cosine = std::max(0.0, dot(n, light));
    const double shadow =
        cosine > 0 ? (suppliedVisibility >= 0 ? suppliedVisibility : visibility(world, n, settings))
                   : 0;
    const auto& p = settings.parameters;
    const double direct = p.intensity * cosine * shadow;
    const double fill = p.fill * std::max(0.0, dot(n, normalized({1, .4, -.8})));
    const double sky = p.sky + p.skyGradient * std::clamp(n.y * .5 + .5, 0.0, 1.0);
    const double spec =
        cosine > 0 ? p.specular * shadow *
                         referenceSpecular(std::max(0.0, dot(n, halfVector)), p.specularPower)
                   : 0;
    const double lr = p.color.r, lg = p.color.g, lb = p.color.b;
    return {float(base.r * (sky * .75 + direct * lr + fill * .65) + spec),
            float(base.g * (sky * .9 + direct * lg + fill * .85) + spec * .94),
            float(base.b * (sky * 1.3 + direct * lb + fill) + spec * .82)};
}
LinearRGB illuminate(LinearRGB base, Vec3 world, Vec3 normal,
                     const LightingSettings& settings) noexcept {
    return referenceShade(base, world, normal, settings, -1);
}
float shadowVisibility(Vec3 world, Vec3 normal, const LightingSettings& settings) noexcept {
    return visibility(world, normal, settings);
}
namespace {
struct TextureSample {
    LinearRGB color;
    float alpha;
};
TextureSample textureSample(const Texture2D& texture, Point uv, bool srgb, float lod) noexcept {
    if (texture.width <= 0 || texture.height <= 0 || texture.width > 8192 ||
        texture.height > 8192 ||
        texture.pixels.size() != std::size_t(texture.width) * texture.height ||
        !std::isfinite(uv.x) || !std::isfinite(uv.y))
        return {{1, 1, 1}, 1};
    const double u = uv.x - std::floor(uv.x), v = uv.y - std::floor(uv.y);
    const auto level = [&](int mip) {
        int width = texture.width, height = texture.height;
        const auto* pixels = &texture.pixels;
        if (mip > 0) {
            const auto& m = texture.mips[std::size_t(mip - 1)];
            width = m.width;
            height = m.height;
            pixels = &m.pixels;
        }
        if (width < 1 || height < 1 || pixels->size() != std::size_t(width) * height)
            return TextureSample{{1, 1, 1}, 1};
        const auto read = [&](int x, int y) {
            x = (x % width + width) % width;
            y = (y % height + height) % height;
            const auto c = (*pixels)[std::size_t(y) * width + x];
            return TextureSample{
                srgb ? LinearRGB{srgbToLinear(c.r), srgbToLinear(c.g), srgbToLinear(c.b)}
                     : LinearRGB{c.r / 255.f, c.g / 255.f, c.b / 255.f},
                c.a / 255.f};
        };
        if (texture.filter == TextureFilter::Nearest)
            return read(std::min(width - 1, int(u * width)), std::min(height - 1, int(v * height)));
        const double x = u * width - .5, y = v * height - .5;
        const int ix = int(std::floor(x)), iy = int(std::floor(y));
        const float tx = float(x - ix), ty = float(y - iy);
        TextureSample result{};
        // Premultiplied interpolation avoids invisible texels leaking RGB into edges.
        for (int dy = 0; dy < 2; ++dy)
            for (int dx = 0; dx < 2; ++dx) {
                const auto c = read(ix + dx, iy + dy);
                const float w = (dx ? tx : 1 - tx) * (dy ? ty : 1 - ty);
                result.color.r += c.color.r * (srgb ? c.alpha : 1.f) * w;
                result.color.g += c.color.g * (srgb ? c.alpha : 1.f) * w;
                result.color.b += c.color.b * (srgb ? c.alpha : 1.f) * w;
                result.alpha += c.alpha * w;
            }
        if (srgb && result.alpha > 0)
            result.color = {result.color.r / result.alpha, result.color.g / result.alpha,
                            result.color.b / result.alpha};
        return result;
    };
    if (texture.filter != TextureFilter::Trilinear || texture.mips.empty())
        return level(0);
    const float amount =
        std::clamp(std::isfinite(lod) ? lod : 0.f, 0.f, float(texture.mips.size()));
    const int lo = int(amount), hi = std::min(lo + 1, int(texture.mips.size()));
    const float t = amount - lo;
    const auto a = level(lo), b = level(hi);
    TextureSample result{};
    result.alpha = a.alpha * (1 - t) + b.alpha * t;
    if (srgb && result.alpha > 0)
        result.color = {(a.color.r * a.alpha * (1 - t) + b.color.r * b.alpha * t) / result.alpha,
                        (a.color.g * a.alpha * (1 - t) + b.color.g * b.alpha * t) / result.alpha,
                        (a.color.b * a.alpha * (1 - t) + b.color.b * b.alpha * t) / result.alpha};
    if (!srgb)
        result.color = {a.color.r * (1 - t) + b.color.r * t, a.color.g * (1 - t) + b.color.g * t,
                        a.color.b * (1 - t) + b.color.b * t};
    return result;
}
} // namespace
LinearRGB sampleTexture(const Texture2D& texture, Point uv, bool srgb, float lod) noexcept {
    return textureSample(texture, uv, srgb, lod).color;
}
float sampleTextureAlpha(const Texture2D& texture, Point uv, float lod) noexcept {
    return textureSample(texture, uv, false, lod).alpha;
}
void generateMipmaps(Texture2D& texture, bool srgb) {
    if (texture.width < 1 || texture.height < 1 || texture.width > 8192 || texture.height > 8192 ||
        texture.pixels.size() != std::size_t(texture.width) * texture.height)
        throw std::invalid_argument("invalid mipmap source");
    std::vector<TextureLevel> levels;
    int width = texture.width, height = texture.height;
    const auto* source = &texture.pixels;
    const auto encode = [&](float x) {
        const double v = std::clamp(double(x), 0.0, 1.0);
        return std::uint8_t(std::lround(
            255 * (srgb ? (v <= .0031308 ? 12.92 * v : 1.055 * std::pow(v, 1 / 2.4) - .055) : v)));
    };
    while (width > 1 || height > 1) {
        TextureLevel next;
        next.width = (width + 1) / 2;
        next.height = (height + 1) / 2;
        next.pixels.resize(std::size_t(next.width) * next.height);
        for (int y = 0; y < next.height; ++y)
            for (int x = 0; x < next.width; ++x) {
                LinearRGB sum{};
                float alpha = 0;
                int count = 0;
                for (int dy = 0; dy < 2; ++dy)
                    for (int dx = 0; dx < 2; ++dx) {
                        const int sx = x * 2 + dx, sy = y * 2 + dy;
                        if (sx >= width || sy >= height)
                            continue;
                        const auto c = (*source)[std::size_t(sy) * width + sx];
                        const float a = c.a / 255.f;
                        sum.r += (srgb ? srgbToLinear(c.r) * a : c.r / 255.f);
                        sum.g += (srgb ? srgbToLinear(c.g) * a : c.g / 255.f);
                        sum.b += (srgb ? srgbToLinear(c.b) * a : c.b / 255.f);
                        alpha += a;
                        ++count;
                    }
                if (srgb && alpha > 0)
                    sum = {sum.r / alpha, sum.g / alpha, sum.b / alpha};
                if (!srgb)
                    sum = {sum.r / count, sum.g / count, sum.b / count};
                next.pixels[std::size_t(y) * next.width + x] = {
                    encode(sum.r), encode(sum.g), encode(sum.b),
                    std::uint8_t(std::lround(255 * alpha / count))};
            }
        width = next.width;
        height = next.height;
        levels.push_back(std::move(next));
        source = &levels.back().pixels;
    }
    texture.mips.swap(levels);
}
Vec3 textureNormal(Vec3 normal, Vec3 tangent, double handedness, LinearRGB sample,
                   float strength) noexcept {
    const Vec3 n = normalized(normal);
    if (strength <= 0)
        return n;
    const double d = dot(n, tangent);
    Vec3 t{tangent.x - d * n.x, tangent.y - d * n.y, tangent.z - d * n.z};
    if (dot(t, t) < 1e-16) {
        const Vec3 a = std::abs(n.y) < .9 ? Vec3{0, 1, 0} : Vec3{1, 0, 0};
        t = {a.y * n.z - a.z * n.y, a.z * n.x - a.x * n.z, a.x * n.y - a.y * n.x};
    }
    t = normalized(t);
    const Vec3 b{(n.y * t.z - n.z * t.y) * handedness, (n.z * t.x - n.x * t.z) * handedness,
                 (n.x * t.y - n.y * t.x) * handedness};
    const double x = (sample.r * 2 - 1) * strength, y = (sample.g * 2 - 1) * strength,
                 z = sample.b * 2 - 1;
    return normalized(
        {t.x * x + b.x * y + n.x * z, t.y * x + b.y * y + n.y * z, t.z * x + b.z * y + n.z * z});
}
LinearRGB shadeMaterial(LinearRGB base, Vec3 world, Vec3 normal, const Material& material,
                        const LightingSettings& settings, float suppliedVisibility) noexcept {
    base = {base.r * material.tint.r, base.g * material.tint.g, base.b * material.tint.b};
    if (material.shading == Shading::Unlit)
        return base;
    if (material.shading == Shading::Reference)
        return referenceShade(base, world, normal, settings, suppliedVisibility);
    const Vec3 n = normalized(normal), l = settings.prepared
                                               ? settings.normalizedLight
                                               : normalized(settings.directionToLight);
    const Vec3 v = normalized(
        {settings.camera.x - world.x, settings.camera.y - world.y, settings.camera.z - world.z});
    const Vec3 h = normalized({v.x + l.x, v.y + l.y, v.z + l.z});
    const double nl = std::max(0.0, dot(n, l)), nv = std::max(.0001, dot(n, v)),
                 nh = std::max(0.0, dot(n, h)), vh = std::max(0.0, dot(v, h));
    const double shadow =
        nl > 0 ? (suppliedVisibility >= 0 ? suppliedVisibility : visibility(world, n, settings))
               : 0;
    const auto& light = settings.parameters;
    const double ambient = light.sky + light.skyGradient * std::clamp(n.y * .5 + .5, 0.0, 1.0);
    if (material.shading == Shading::Toon) {
        const double scaled = std::clamp(nl * shadow, 0.0, 1.0) * material.bands;
        const double band = std::min(double(material.bands - 1), std::floor(scaled)),
                     fraction = scaled - band;
        const double softness = material.bandSoftness;
        const double blend = softness > 0 && band < material.bands - 1
                                 ? std::clamp((fraction - (1 - softness)) / softness, 0.0, 1.0)
                                 : 0;
        const double level = (band + blend) / (material.bands - 1);
        const double highlight = std::pow(nh, 48) * shadow > .55 ? material.highlight : 0;
        const double rim = material.rim * std::pow(1 - std::clamp(nv, 0.0, 1.0), 3);
        const auto c = [&](float b, float dark, float lc) {
            return float(
                b * (dark * (1 - level) + level * light.intensity * .5 * lc + ambient * .3) +
                highlight + rim);
        };
        return {c(base.r, material.shadowColor.r, light.color.r),
                c(base.g, material.shadowColor.g, light.color.g),
                c(base.b, material.shadowColor.b, light.color.b)};
    }
    // Isotropic GGX + separable Smith masking + Schlick Fresnel; Lambert diffuse.
    constexpr double pi = 3.14159265358979323846;
    const double alpha = material.roughness * material.roughness, a2 = alpha * alpha;
    const double denominator = nh * nh * (a2 - 1) + 1;
    const double distribution = a2 / (pi * denominator * denominator);
    const auto smith = [&](double cosine) {
        return 2 * cosine / (cosine + std::sqrt(a2 + (1 - a2) * cosine * cosine));
    };
    const double geometry = smith(nv) * smith(nl), fresnel = std::pow(1 - vh, 5);
    const auto channel = [&](float b, float lc) {
        const double f0 = .04 * (1 - material.metallic) + b * material.metallic,
                     F = f0 + (1 - f0) * fresnel;
        const double diffuse = (1 - F) * (1 - material.metallic) * b / pi;
        const double specular = distribution * geometry * F / std::max(4 * nv * nl, 1e-8);
        return float((diffuse + specular) * light.intensity * lc * nl * shadow +
                     b * (1 - material.metallic) * ambient);
    };
    return {channel(base.r, light.color.r), channel(base.g, light.color.g),
            channel(base.b, light.color.b)};
}
} // namespace nexusgl
