#include "nexusgl/render3d.hpp"
#include <algorithm>
#include <cmath>
#include <stdexcept>
#include <utility>

namespace nexusgl {
namespace {
std::size_t checkedPixels(int w, int h) {
    if (w < 1 || h < 1 || w > Framebuffer::maxDimension || h > Framebuffer::maxDimension ||
        std::size_t(w) * h > Framebuffer::maxPixels)
        throw std::invalid_argument("invalid render target dimensions");
    return std::size_t(w) * h;
}
} // namespace
RenderTarget3D::RenderTarget3D(int w, int h, bool depthOnly)
    : width_(w), height_(h), depthOnly_(depthOnly), color_(depthOnly ? 1 : w, depthOnly ? 1 : h),
      depth_(checkedPixels(w, h), 1.0f), alpha_(depthOnly ? 0 : checkedPixels(w, h), 1.0f) {}
std::size_t RenderTarget3D::allocatedBytes() const noexcept {
    return color_.size() + depth_.capacity() * sizeof(float) + alpha_.capacity() * sizeof(float) +
           radiance_.capacity() * sizeof(LinearRGB) + surfaces_.capacity() * sizeof(SurfaceSample) +
           heads_.capacity() * sizeof(std::uint32_t) + layers_.capacity() +
           fragments_.capacity() * sizeof(Fragment);
}
void RenderTarget3D::setFragmentLimit(std::size_t count) {
    if (count < 1 || count > maxTransparentFragments)
        throw std::invalid_argument("invalid transparent fragment limit");
    fragmentLimit_ = count;
}
void RenderTarget3D::resize(int w, int h) {
    if (w == width_ && h == height_)
        return;
    RenderTarget3D replacement(w, h, depthOnly_);
    if (lightingEnabled())
        replacement.setLighting(lighting_);
    replacement.captureSurfaces(!surfaces_.empty(), deferred_);
    surfaces_.swap(replacement.surfaces_);
    width_ = w;
    height_ = h;
    transparencyPhase_ = TransparencyPhase::Disabled;
    heads_.clear();
    layers_.clear();
    fragments_.clear();
    alpha_.swap(replacement.alpha_);
    std::swap(color_, replacement.color_);
    depth_.swap(replacement.depth_);
    radiance_.swap(replacement.radiance_);
}
void RenderTarget3D::setLighting(const LightingSettings& settings) {
    if (depthOnly_)
        throw std::logic_error("depth-only target cannot enable lighting");
    if (!std::isfinite(settings.shadowBias) || settings.shadowBias < 0 || settings.shadowBias > 1 ||
        !std::isfinite(settings.receiverPlaneClamp) || settings.receiverPlaneClamp < 0 ||
        settings.receiverPlaneClamp > 1 || settings.shadowFilterRadius < 0 ||
        settings.shadowFilterRadius > 2)
        throw std::invalid_argument("invalid shadow settings");
    for (double value :
         {settings.camera.x, settings.camera.y, settings.camera.z, settings.directionToLight.x,
          settings.directionToLight.y, settings.directionToLight.z})
        if (!std::isfinite(value) || std::abs(value) > 1e9)
            throw std::invalid_argument("invalid lighting settings");
    for (double value : settings.worldToShadow.values)
        if (!std::isfinite(value) || std::abs(value) > 1e9)
            throw std::invalid_argument("invalid shadow transform");
    const auto d = settings.directionToLight;
    if (d.x * d.x + d.y * d.y + d.z * d.z < 1e-24)
        throw std::invalid_argument("light direction must be nonzero");
    if (settings.shadowMap == this)
        throw std::invalid_argument("lighting target cannot shadow itself");
    if (radiance_.size() != depth_.size()) {
        std::vector<LinearRGB> replacement(depth_.size());
        radiance_.swap(replacement);
    }
    lighting_ = settings;
    const double length = std::sqrt(d.x * d.x + d.y * d.y + d.z * d.z);
    lighting_.normalizedLight = {d.x / length, d.y / length, d.z / length};
    const auto& m = settings.worldToShadow.values;
    const Vec3 x{m[0], m[1], m[2]}, y{m[4], m[5], m[6]}, z{m[8], m[9], m[10]};
    const auto cross = [](Vec3 a, Vec3 b) {
        return Vec3{a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x};
    };
    lighting_.shadowCofactorX = cross(y, z);
    lighting_.shadowCofactorY = cross(z, x);
    lighting_.shadowCofactorZ = cross(x, y);
    lighting_.prepared = true;
}
void RenderTarget3D::captureSurfaces(bool enabled, bool deferred) {
    if (enabled && surfaces_.size() != depth_.size()) {
        std::vector<SurfaceSample> next(depth_.size());
        surfaces_.swap(next);
    }
    if (!enabled)
        std::vector<SurfaceSample>().swap(surfaces_);
    deferred_ = enabled && deferred;
}
void RenderTarget3D::clear(Color c) noexcept {
    if (transparencyPhase_ != TransparencyPhase::Disabled)
        transparencyPhase_ = TransparencyPhase::Drawing;
    std::fill(surfaces_.begin(), surfaces_.end(), SurfaceSample{});
    fragments_.clear();
    transparencyError_ = TransparencyError::None;
    std::fill(heads_.begin(), heads_.end(), UINT32_MAX);
    std::fill(layers_.begin(), layers_.end(), 0);
    std::fill(alpha_.begin(), alpha_.end(), c.a / 255.f);
    if (!depthOnly_)
        color_.clear(c);
    std::fill(depth_.begin(), depth_.end(), 1.0f);
    std::fill(radiance_.begin(), radiance_.end(),
              LinearRGB{srgbToLinear(c.r), srgbToLinear(c.g), srgbToLinear(c.b)});
}
void RenderTarget3D::prepareTransparency(bool enabled) {
    if (enabled)
        fragments_.reserve(fragmentLimit_);
    if (enabled && heads_.size() != depth_.size()) {
        std::vector<std::uint32_t> heads(depth_.size(), UINT32_MAX);
        std::vector<std::uint8_t> layers(depth_.size(), 0);
        heads_.swap(heads);
        layers_.swap(layers);
    } else if (!enabled) {
        std::vector<std::uint32_t>().swap(heads_);
        std::vector<std::uint8_t>().swap(layers_);
        std::vector<Fragment>().swap(fragments_);
    }
    fragments_.clear();
    transparencyError_ = TransparencyError::None;
    transparencyPhase_ = enabled ? TransparencyPhase::Prepared : TransparencyPhase::Disabled;
}
const std::vector<LinearRGB>& RenderTarget3D::radiance() const {
    if (transparencyPhase_ != TransparencyPhase::Disabled &&
        transparencyPhase_ != TransparencyPhase::Resolved)
        throw std::logic_error("transparent frame must be resolved before reading HDR");
    return radiance_;
}
void RenderTarget3D::resolveTransparency() {
    if (transparencyPhase_ != TransparencyPhase::Drawing)
        throw std::logic_error("transparency resolve requires a prepared, cleared frame");
    if (transparencyError_ == TransparencyError::Lifecycle)
        throw std::runtime_error(
            "transparency requires a lit target and prepareTransparency(true)");
    if (transparencyError_ == TransparencyError::Budget)
        throw std::runtime_error(
            "transparency exceeds 64 layers per pixel or configured fragments per frame");
    if (transparencyError_ == TransparencyError::Allocation)
        throw std::runtime_error("could not allocate transparent fragments");
    for (std::size_t pixel = 0; pixel < heads_.size(); ++pixel) {
        if (heads_[pixel] == UINT32_MAX)
            continue;
        std::array<std::uint32_t, maxTransparentLayers> order;
        int count = 0;
        for (auto i = heads_[pixel]; i != UINT32_MAX; i = fragments_[i].next)
            if (fragments_[i].depth < depth_[pixel])
                order[count++] = i;
        // Back-to-front per pixel, including intersecting triangles. Equal depth: submission order.
        std::sort(order.begin(), order.begin() + count, [&](auto a, auto b) {
            return fragments_[a].depth == fragments_[b].depth
                       ? a < b
                       : fragments_[a].depth > fragments_[b].depth;
        });
        for (int j = 0; j < count; ++j) {
            const auto& f = fragments_[order[j]];
            auto& d = radiance_[pixel];
            const float back = alpha_[pixel] * (1 - f.alpha), a = f.alpha + back;
            d = {(f.color.r * f.alpha + d.r * back) / a, (f.color.g * f.alpha + d.g * back) / a,
                 (f.color.b * f.alpha + d.b * back) / a};
            alpha_[pixel] = a;
        }
    }
    transparencyPhase_ = TransparencyPhase::Resolved;
    fragments_.clear();
    std::fill(heads_.begin(), heads_.end(), UINT32_MAX);
    std::fill(layers_.begin(), layers_.end(), 0);
}
float RenderTarget3D::depth(int x, int y) const {
    if (x < 0 || y < 0 || x >= width_ || y >= height_)
        throw std::out_of_range("depth outside target");
    return depth_[static_cast<std::size_t>(y) * width_ + x];
}
void RenderTarget3D::triangle(ClipVertex a, ClipVertex b, ClipVertex c) noexcept {
    const bool lit = lightingEnabled();
    const auto convert = [lit](ClipVertex v) {
        return Vertex{v.position,
                      {lit ? 255.0 * srgbToLinear(v.color.r) : double(v.color.r),
                       lit ? 255.0 * srgbToLinear(v.color.g) : double(v.color.g),
                       lit ? 255.0 * srgbToLinear(v.color.b) : double(v.color.b),
                       double(v.color.a)},
                      v.worldPosition,
                      v.normal,
                      v.uv,
                      v.tangent,
                      v.handedness};
    };
    std::array<Vertex, 16> polygon{}, output{};
    polygon[0] = convert(a);
    polygon[1] = convert(b);
    polygon[2] = convert(c);
    for (int i = 0; i < 3; ++i)
        for (double value : {polygon[i].p.x, polygon[i].p.y, polygon[i].p.z, polygon[i].p.w})
            if (!std::isfinite(value) || std::abs(value) > 1e9)
                return;
    if (lit)
        for (const auto& vertex : {a, b, c})
            for (double value :
                 {vertex.worldPosition.x, vertex.worldPosition.y, vertex.worldPosition.z,
                  vertex.normal.x, vertex.normal.y, vertex.normal.z, vertex.uv.x, vertex.uv.y,
                  vertex.tangent.x, vertex.tangent.y, vertex.tangent.z, vertex.handedness})
                if (!std::isfinite(value) || std::abs(value) > 1e9)
                    return;
    const auto distance = [](Vec4 p, int plane) {
        switch (plane) {
        case 0:
            return p.x + p.w;
        case 1:
            return p.w - p.x;
        case 2:
            return p.y + p.w;
        case 3:
            return p.w - p.y;
        case 4:
            return p.z;
        case 5:
            return p.w - p.z;
        default:
            return p.w - 1e-9;
        }
    };
    const auto lerp = [](Vertex from, Vertex to, double t) {
        Vertex v{{from.p.x + (to.p.x - from.p.x) * t, from.p.y + (to.p.y - from.p.y) * t,
                  from.p.z + (to.p.z - from.p.z) * t, from.p.w + (to.p.w - from.p.w) * t},
                 {},
                 {},
                 {},
                 {},
                 {},
                 1};
        v.world = {from.world.x + (to.world.x - from.world.x) * t,
                   from.world.y + (to.world.y - from.world.y) * t,
                   from.world.z + (to.world.z - from.world.z) * t};
        v.normal = {from.normal.x + (to.normal.x - from.normal.x) * t,
                    from.normal.y + (to.normal.y - from.normal.y) * t,
                    from.normal.z + (to.normal.z - from.normal.z) * t};
        v.uv = {from.uv.x + (to.uv.x - from.uv.x) * t, from.uv.y + (to.uv.y - from.uv.y) * t};
        v.tangent = {from.tangent.x + (to.tangent.x - from.tangent.x) * t,
                     from.tangent.y + (to.tangent.y - from.tangent.y) * t,
                     from.tangent.z + (to.tangent.z - from.tangent.z) * t};
        v.handedness = from.handedness + (to.handedness - from.handedness) * t;
        for (int j = 0; j < 4; ++j)
            v.color[j] = from.color[j] + (to.color[j] - from.color[j]) * t;
        return v;
    };
    int count = 3;
    for (int plane = 0; plane < 7 && count; ++plane) {
        int nextCount = 0;
        Vertex previous = polygon[count - 1];
        double previousDistance = distance(previous.p, plane);
        for (int i = 0; i < count; ++i) {
            const Vertex current = polygon[i];
            const double currentDistance = distance(current.p, plane);
            if ((previousDistance >= 0) != (currentDistance >= 0)) {
                if (nextCount >= 16)
                    return;
                output[nextCount++] = lerp(
                    previous, current,
                    std::clamp(previousDistance / (previousDistance - currentDistance), 0.0, 1.0));
            }
            if (currentDistance >= 0) {
                if (nextCount >= 16)
                    return;
                output[nextCount++] = current;
            }
            previous = current;
            previousDistance = currentDistance;
        }
        polygon = output;
        count = nextCount;
    }
    for (int i = 1; i + 1 < count; ++i)
        rasterize(polygon[0], polygon[i], polygon[i + 1]);
}
void RenderTarget3D::rasterize(Vertex a, Vertex b, Vertex c) noexcept {
    struct Screen {
        double x, y, z, invW;
        std::array<double, 4> color;
        Vec3 world, normal;
        Point uv;
        Vec3 tangent;
        double handedness;
    };
    const auto screen = [this](Vertex v) {
        const double inv = 1 / v.p.w;
        return Screen{(v.p.x * inv * 0.5 + 0.5) * width_,
                      (0.5 - v.p.y * inv * 0.5) * height_,
                      v.p.z * inv,
                      inv,
                      v.color,
                      v.world,
                      v.normal,
                      v.uv,
                      v.tangent,
                      v.handedness};
    };
    Screen p = screen(a), q = screen(b), r = screen(c);
    const auto edge = [](Screen x, Screen y, double px, double py) {
        return (y.x - x.x) * (py - x.y) - (y.y - x.y) * (px - x.x);
    };
    double area = edge(p, q, r.x, r.y);
    if (!std::isfinite(area) || area == 0)
        return;
    if (area < 0) {
        std::swap(q, r);
        area = -area;
    }
    const auto inclusive = [](Screen x, Screen y) {
        return y.y < x.y || (y.y == x.y && y.x > x.x);
    };
    const bool pq = inclusive(p, q), qr = inclusive(q, r), rp = inclusive(r, p);
    const auto low = [](double value, int limit) {
        return static_cast<int>(std::clamp(std::floor(value), 0.0, double(limit)));
    };
    const auto high = [](double value, int limit) {
        return static_cast<int>(std::clamp(std::ceil(value), 0.0, double(limit)));
    };
    const int left = low(std::min({p.x, q.x, r.x}), width_),
              right = high(std::max({p.x, q.x, r.x}), width_);
    const int top = low(std::min({p.y, q.y, r.y}), height_),
              bottom = high(std::max({p.y, q.y, r.y}), height_);
    for (int y = top; y < bottom; ++y)
        for (int x = left; x < right; ++x) {
            const double e0 = edge(q, r, x + 0.5, y + 0.5), e1 = edge(r, p, x + 0.5, y + 0.5),
                         e2 = edge(p, q, x + 0.5, y + 0.5);
            if (e0 < 0 || (e0 == 0 && !qr) || e1 < 0 || (e1 == 0 && !rp) || e2 < 0 ||
                (e2 == 0 && !pq))
                continue;
            const double l0 = e0 / area, l1 = e1 / area, l2 = e2 / area;
            const float z =
                static_cast<float>(std::clamp(l0 * p.z + l1 * q.z + l2 * r.z, 0.0, 1.0));
            const auto offset = static_cast<std::size_t>(y) * width_ + x;
            if (z >= depth_[offset])
                continue;
            const double denominator = l0 * p.invW + l1 * q.invW + l2 * r.invW;
            if (denominator <= 0 || !std::isfinite(denominator))
                continue;
            const double w0 = l0 * p.invW / denominator, w1 = l1 * q.invW / denominator,
                         w2 = l2 * r.invW / denominator;
            std::array<double, 4> channels{};
            for (int channel = 0; channel < 4; ++channel)
                channels[channel] =
                    w0 * p.color[channel] + w1 * q.color[channel] + w2 * r.color[channel];
            const Point uv{w0 * p.uv.x + w1 * q.uv.x + w2 * r.uv.x,
                           w0 * p.uv.y + w1 * q.uv.y + w2 * r.uv.y};
            const auto lodFor = [&](const Texture2D& texture) {
                if (texture.filter != TextureFilter::Trilinear || texture.mips.empty())
                    return 0.f;
                const auto derivative = [&](bool vertical, bool v) {
                    const double d0 = vertical ? (r.x - q.x) / area : -(r.y - q.y) / area;
                    const double d1 = vertical ? (p.x - r.x) / area : -(p.y - r.y) / area;
                    const double d2 = -d0 - d1;
                    const double numerator = d0 * p.invW * (v ? p.uv.y : p.uv.x) +
                                             d1 * q.invW * (v ? q.uv.y : q.uv.x) +
                                             d2 * r.invW * (v ? r.uv.y : r.uv.x);
                    const double dw = d0 * p.invW + d1 * q.invW + d2 * r.invW;
                    return (numerator - (v ? uv.y : uv.x) * dw) / denominator;
                };
                const double rho = std::max(std::hypot(derivative(false, false) * texture.width,
                                                       derivative(false, true) * texture.height),
                                            std::hypot(derivative(true, false) * texture.width,
                                                       derivative(true, true) * texture.height));
                return float(std::log2(std::max(1.0, rho)));
            };
            float colorLod = 0;
            if (material_ && lighting_.textures && material_->colorTexture >= 0 &&
                std::size_t(material_->colorTexture) < lighting_.textures->size())
                colorLod = lodFor((*lighting_.textures)[material_->colorTexture]);
            const bool blended = material_ && material_->alphaMode == AlphaMode::Blend;
            float opacity = 1;
            if (material_ && material_->alphaMode != AlphaMode::Opaque) {
                opacity = float(channels[3] / 255) * material_->opacity;
                if (lighting_.textures && material_->colorTexture >= 0 &&
                    std::size_t(material_->colorTexture) < lighting_.textures->size())
                    opacity *= sampleTextureAlpha((*lighting_.textures)[material_->colorTexture],
                                                  uv, colorLod);
                if (!std::isfinite(opacity))
                    continue;
                opacity = std::clamp(opacity, 0.f, 1.f);
                if (blended ? opacity <= 0 : opacity < material_->alphaCutoff)
                    continue;
            }
            if (blended && (heads_.size() != depth_.size() || !lightingEnabled() ||
                            transparencyPhase_ != TransparencyPhase::Drawing)) {
                transparencyError_ = TransparencyError::Lifecycle;
                continue;
            }
            if (lightingEnabled()) {
                const Vec3 world{w0 * p.world.x + w1 * q.world.x + w2 * r.world.x,
                                 w0 * p.world.y + w1 * q.world.y + w2 * r.world.y,
                                 w0 * p.world.z + w1 * q.world.z + w2 * r.world.z};
                Vec3 normal{w0 * p.normal.x + w1 * q.normal.x + w2 * r.normal.x,
                            w0 * p.normal.y + w1 * q.normal.y + w2 * r.normal.y,
                            w0 * p.normal.z + w1 * q.normal.z + w2 * r.normal.z};
                LinearRGB base{float(channels[0] / 255), float(channels[1] / 255),
                               float(channels[2] / 255)};
                if (material_ && lighting_.textures) {
                    if (material_->colorTexture >= 0 &&
                        std::size_t(material_->colorTexture) < lighting_.textures->size()) {
                        const auto t = sampleTexture((*lighting_.textures)[material_->colorTexture],
                                                     uv, true, colorLod);
                        base = {base.r * t.r, base.g * t.g, base.b * t.b};
                    }
                    if (material_->normalTexture >= 0 &&
                        std::size_t(material_->normalTexture) < lighting_.textures->size()) {
                        const Vec3 tangent{w0 * p.tangent.x + w1 * q.tangent.x + w2 * r.tangent.x,
                                           w0 * p.tangent.y + w1 * q.tangent.y + w2 * r.tangent.y,
                                           w0 * p.tangent.z + w1 * q.tangent.z + w2 * r.tangent.z};
                        normal = textureNormal(
                            normal, tangent,
                            w0 * p.handedness + w1 * q.handedness + w2 * r.handedness,
                            sampleTexture((*lighting_.textures)[material_->normalTexture], uv,
                                          false,
                                          lodFor((*lighting_.textures)[material_->normalTexture])),
                            material_->normalStrength);
                    }
                }
                if (blended) {
                    if (transparencyError_ != TransparencyError::None)
                        continue;
                    if (layers_[offset] >= maxTransparentLayers ||
                        fragments_.size() >= fragmentLimit_) {
                        transparencyError_ = TransparencyError::Budget;
                        continue;
                    }
                    try {
                        fragments_.push_back(
                            {shadeMaterial(base, world, normal, *material_, lighting_), opacity, z,
                             heads_[offset]});
                        heads_[offset] = std::uint32_t(fragments_.size() - 1);
                        ++layers_[offset];
                    } catch (...) {
                        transparencyError_ = TransparencyError::Allocation;
                    }
                    continue; // Translucency tests opaque depth, but never writes depth/surface
                              // guidance.
                }
                if (!surfaces_.empty()) {
                    const double length =
                        std::sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
                    const Vec3 n = length > 1e-12 ? Vec3{normal.x / length, normal.y / length,
                                                         normal.z / length}
                                                  : Vec3{0, 1, 0};
                    surfaces_[offset] = {{float(world.x), float(world.y), float(world.z)},
                                         {float(n.x), float(n.y), float(n.z)},
                                         base,
                                         materialIndex_,
                                         surfaceKey_,
                                         true};
                }
                if (!deferred_)
                    radiance_[offset] =
                        material_ ? shadeMaterial(base, world, normal, *material_, lighting_)
                                  : illuminate(base, world, normal, lighting_);
            } else if (!depthOnly_) {
                color_.put(
                    x, y,
                    {static_cast<std::uint8_t>(std::clamp(std::round(channels[0]), 0.0, 255.0)),
                     static_cast<std::uint8_t>(std::clamp(std::round(channels[1]), 0.0, 255.0)),
                     static_cast<std::uint8_t>(std::clamp(std::round(channels[2]), 0.0, 255.0)),
                     static_cast<std::uint8_t>(std::clamp(std::round(channels[3]), 0.0, 255.0))});
            }
            depth_[offset] = z;
            if (!alpha_.empty())
                alpha_[offset] = 1;
        }
}
} // namespace nexusgl
