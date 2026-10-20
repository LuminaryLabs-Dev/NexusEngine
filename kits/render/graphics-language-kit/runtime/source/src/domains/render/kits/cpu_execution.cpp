#include "nexusgl/domains/render/cpu_execution_kit.hpp"
#include <algorithm>
#include <cmath>
#include <stdexcept>
#include <type_traits>

namespace nexusgl::render {
void executeCanvas(Framebuffer& target, const scene::CanvasFrame& frame) {
    target.clear(frame.background);
    for (const auto& draw : frame.draws)
        std::visit(
            [&](const auto& command) {
                using Command = std::decay_t<decltype(command)>;
                if constexpr (std::is_same_v<Command, scene::Triangle2D>)
                    target.triangle(command.vertices[0], command.vertices[1], command.vertices[2],
                                    command.color);
                else if constexpr (std::is_same_v<Command, scene::Rectangle2D>)
                    target.rectangle(command.x, command.y, command.width, command.height,
                                     command.color);
                else
                    target.circle(command.center, command.radius, command.color);
            },
            draw);
}
static void drawScene(RenderTarget3D& target, const scene::SceneFrame& frame,
                      const Mat4& viewProjection, bool shadowPass, bool blendPass = false,
                      bool clear = true) {
    target.setTextureSource(&frame.textures);
    if (clear)
        target.clear(frame.background);
    for (const auto& triangle : frame.triangles) {
        const Material* material =
            triangle.material < 0 ? nullptr : &frame.materials[triangle.material];
        if (!shadowPass && bool(material && material->alphaMode == AlphaMode::Blend) != blendPass)
            continue;
        if (shadowPass) {
            if (material && material->alphaMode == AlphaMode::Blend)
                continue;
            if (!triangle.castsShadow)
                continue;
            const auto n = triangle.geometricNormal, light = frame.shadow.directionToLight;
            if (frame.shadow.closedBackFacesOnly && !triangle.twoSidedShadow &&
                light.x * n.x + light.y * n.y + light.z * n.z >= 0)
                continue;
        }
        const std::uint32_t key = (std::uint32_t(triangle.albedo.r) << 16) |
                                  (std::uint32_t(triangle.albedo.g) << 8) | triangle.albedo.b;
        target.setMaterial(material, triangle.material, key);
        const auto vertex = [&](const scene::SurfaceVertex& v) {
            return ClipVertex{viewProjection * Vec4{v.position.x, v.position.y, v.position.z, 1},
                              triangle.albedo,
                              v.position,
                              v.normal,
                              v.uv,
                              v.tangent,
                              v.handedness};
        };
        target.triangle(vertex(triangle.vertices[0]), vertex(triangle.vertices[1]),
                        vertex(triangle.vertices[2]));
    }
    target.setMaterial(nullptr);
}
void executeScene(RenderTarget3D& target, const scene::SceneFrame& frame,
                  const Mat4& viewProjection, bool shadowPass) {
    scene::validate(frame);
    // Public low-level helper preserves validation; service execution uses its validated
    // descriptor.
    drawScene(target, frame, viewProjection, shadowPass);
    if (!shadowPass)
        drawScene(target, frame, viewProjection, false, true, false);
}
const Framebuffer& CpuFrameKit::render(const scene::CanvasFrame& frame, int width, int height) {
    if (width < 1 || height < 1 || width > Framebuffer::maxDimension ||
        height > Framebuffer::maxDimension ||
        std::uint64_t(width) * height > Framebuffer::maxPixels)
        throw std::invalid_argument("invalid canvas extent");
    statistics_ = {};
    statistics_.estimatedPeakBytes = limits_.externalReservationBytes +
                                     std::uint64_t(width) * height * 16 +
                                     frame.draws.size() * sizeof(scene::Draw2D) * 2 + 256 * 1024;
    if (statistics_.estimatedPeakBytes > limits_.budgetBytes)
        throw std::runtime_error("canvas exceeds total rendering memory budget");
    target_ = RenderTarget3D(1, 1);
    shadow_ = RenderTarget3D(1, 1, true);
    output_ = Framebuffer(1, 1);
    reconstruction_ = GaussianUpsampler{};
    std::vector<float>().swap(visibility_);
    std::vector<std::uint8_t>().swap(shadowKey_);
    canvas_.resize(width, height);
    executeCanvas(canvas_, frame);
    statistics_.residentBytes = canvas_.size();
    return canvas_;
}
const Framebuffer& CpuFrameKit::render(const scene::SceneFrame& frame, int width, int height,
                                       Quality quality) {
    const bool guided = quality == Quality::GuidedHalf;
    if (guided &&
        std::uint64_t(width) * height * frame.display.sampleScale * frame.display.sampleScale >
            maxGuidedPixels)
        throw std::invalid_argument("guided rendering limited to 4194304 surface pixels");
    ProfileScope total(hooks_, "execution");
    if (width < 1 || height < 1 || width > Framebuffer::maxDimension ||
        height > Framebuffer::maxDimension ||
        std::uint64_t(width) * height > Framebuffer::maxPixels)
        throw std::invalid_argument("invalid render extent");
    bool outlines = false, blending = false, lit = false;
    for (const auto& triangle : frame.triangles) {
        if (triangle.material < 0)
            lit = true;
        else {
            const auto& material = frame.materials[triangle.material];
            outlines |= material.outlinePixels > 0;
            blending |= material.alphaMode == AlphaMode::Blend;
            lit |= material.shading != Shading::Unlit;
        }
    }
    const int sourceWidth =
        (quality == Quality::GaussianHalf ? (width + 1) / 2 : width) * frame.display.sampleScale;
    const int sourceHeight =
        (quality == Quality::GaussianHalf ? (height + 1) / 2 : height) * frame.display.sampleScale;
    const std::uint64_t sourcePixels = std::uint64_t(sourceWidth) * sourceHeight,
                        outputPixels = std::uint64_t(width) * height;
    std::uint64_t sceneBytes = frame.triangles.size() * sizeof(scene::SurfaceTriangle) +
                               frame.materials.size() * sizeof(Material);
    for (const auto& texture : frame.textures) {
        sceneBytes += texture.pixels.size() * sizeof(Color);
        for (const auto& mip : texture.mips)
            sceneBytes += mip.pixels.size() * sizeof(Color);
    }
    statistics_ = {};
    statistics_.estimatedPeakBytes =
        limits_.externalReservationBytes +
        sourcePixels *
            (24 + (guided || outlines ? sizeof(SurfaceSample) : 0) + (blending ? 5 : 0)) +
        outputPixels * 16 + std::uint64_t(frame.shadow.resolution) * frame.shadow.resolution * 4 +
        sceneBytes * 2 + (blending ? std::uint64_t(limits_.transparentFragments) * 24 : 0) +
        (quality == Quality::GaussianHalf ? std::uint64_t(width) * sourceHeight * 16 : 0) +
        4 * 1024 * 1024;
    if (statistics_.estimatedPeakBytes > limits_.budgetBytes)
        throw std::runtime_error("scene exceeds total rendering memory budget");
    if (target_.width() != sourceWidth || target_.height() != sourceHeight) {
        // Release old derived attachments before replacing them; presentation owns its last good
        // frame.
        target_ = RenderTarget3D(1, 1);
        output_ = Framebuffer(1, 1);
        reconstruction_ = GaussianUpsampler{};
        visibility_.clear();
        visibility_.shrink_to_fit();
    }
    output_.resize(width, height);
    target_.resize(sourceWidth, sourceHeight);
    target_.setFragmentLimit(limits_.transparentFragments);
    shadow_.resize(frame.shadow.resolution, frame.shadow.resolution);
    {
        ProfileScope scope(hooks_, "shadows");
        std::vector<std::uint8_t> key;
        const auto append = [&](const auto& value) {
            const auto* bytes = reinterpret_cast<const std::uint8_t*>(&value);
            key.insert(key.end(), bytes, bytes + sizeof(value));
        };
        // Exact canonical field bytes, never struct padding or a collision-prone hash.
        // Cache admission is bounded; larger scenes bypass it without changing output.
        bool cacheable = frame.triangles.size() < 2048;
        std::vector<bool> maskTextures(frame.textures.size());
        if (lit && cacheable) {
            for (double value : frame.shadow.viewProjection.values)
                append(value);
            append(frame.shadow.resolution);
            append(frame.shadow.closedBackFacesOnly);
            append(frame.shadow.directionToLight.x);
            append(frame.shadow.directionToLight.y);
            append(frame.shadow.directionToLight.z);
            std::size_t casterCount = 0;
            for (const auto& t : frame.triangles)
                if (t.castsShadow &&
                    (t.material < 0 || frame.materials[t.material].alphaMode != AlphaMode::Blend))
                    ++casterCount;
            append(casterCount);
            for (const auto& triangle : frame.triangles) {
                const auto* material =
                    triangle.material < 0 ? nullptr : &frame.materials[triangle.material];
                if (!triangle.castsShadow || (material && material->alphaMode == AlphaMode::Blend))
                    continue;
                append(triangle.twoSidedShadow);
                append(triangle.geometricNormal.x);
                append(triangle.geometricNormal.y);
                append(triangle.geometricNormal.z);
                for (const auto& v : triangle.vertices) {
                    append(v.position.x);
                    append(v.position.y);
                    append(v.position.z);
                }
                const bool masked = material && material->alphaMode == AlphaMode::Mask;
                append(masked);
                if (masked) {
                    append(triangle.albedo.a);
                    append(material->opacity);
                    append(material->alphaCutoff);
                    append(material->colorTexture);
                    if (material->colorTexture >= 0)
                        maskTextures[material->colorTexture] = true;
                    for (const auto& v : triangle.vertices) {
                        append(v.uv.x);
                        append(v.uv.y);
                    }
                }
            }
            for (std::size_t i = 0; i < frame.textures.size(); ++i)
                if (maskTextures[i]) {
                    const auto& texture = frame.textures[i];
                    if (texture.pixels.size() > 65536 ||
                        key.size() + texture.pixels.size() > 512 * 1024) {
                        cacheable = false;
                        break;
                    }
                    append(texture.width);
                    append(texture.height);
                    append(texture.filter);
                    append(texture.mips.size());
                    for (const auto& pixel : texture.pixels)
                        append(pixel.a);
                    for (const auto& mip : texture.mips) {
                        if (key.size() + mip.pixels.size() > 512 * 1024) {
                            cacheable = false;
                            break;
                        }
                        for (const auto& pixel : mip.pixels)
                            append(pixel.a);
                    }
                }
        }
        if (lit && cacheable && !key.empty() && key == shadowKey_)
            statistics_.shadowCacheHit = true;
        else {
            if (lit)
                drawScene(shadow_, frame, frame.shadow.viewProjection, true);
            else
                shadow_.clear(frame.background);
            if (lit && cacheable)
                shadowKey_ = std::move(key);
            else
                shadowKey_.clear();
        }
    }
    LightingSettings settings;
    settings.camera = frame.cameraPosition;
    settings.directionToLight = frame.shadow.directionToLight;
    settings.shadowMap = lit ? &shadow_ : nullptr;
    settings.worldToShadow = frame.shadow.viewProjection;
    settings.shadowBias = frame.shadow.bias;
    settings.receiverPlaneClamp = frame.shadow.receiverPlaneClamp;
    settings.shadowFilterRadius = frame.shadow.filterRadius;
    settings.parameters = frame.light;
    settings.textures = &frame.textures;
    target_.setLighting(settings);
    if (!guided)
        std::vector<float>().swap(visibility_);
    target_.captureSurfaces(guided || outlines, guided);
    target_.prepareTransparency(blending);
    {
        ProfileScope scope(hooks_, "raster_and_forward_lighting");
        drawScene(target_, frame, frame.viewProjection, false);
    }
    if (guided) {
        ProfileScope scope(hooks_, "guided_lighting");
        resolveGuided(frame, target_.lighting_);
    }
    // Opaque-only path retains its original output exactly. With translucency, outlines
    // become opaque HDR surface colors before compositing, so glass also covers outlines.
    if (outlines)
        drawOutlines(frame, true);
    if (blending) {
        ProfileScope scope(hooks_, "transparency");
        drawScene(target_, frame, frame.viewProjection, false, true, false);
        statistics_.transparentFragments = target_.fragments_.size();
        target_.resolveTransparency();
    }
    {
        ProfileScope scope(hooks_, "reconstruction");
        reconstruction_.reconstruct(target_.radiance(), sourceWidth, sourceHeight, output_,
                                    frame.display.exposure,
                                    frame.background.a == 255 ? nullptr : &target_.alpha());
    }

    statistics_.residentBytes = reconstruction_.allocatedBytes() + shadowKey_.capacity() +
                                target_.allocatedBytes() + shadow_.allocatedBytes() +
                                output_.size() + canvas_.size() +
                                visibility_.capacity() * sizeof(float);
    return output_;
}
namespace {
Vec3 worldOf(const SurfaceSample& s) {
    return {s.world[0], s.world[1], s.world[2]};
}
Vec3 normalOf(const SurfaceSample& s) {
    return {s.normal[0], s.normal[1], s.normal[2]};
}
} // namespace
void CpuFrameKit::resolveGuided(const scene::SceneFrame& frame, const LightingSettings& settings) {
    const int width = target_.width(), height = target_.height(), sw = (width + 1) / 2,
              sh = (height + 1) / 2;
    const auto& surfaces = target_.surfaces();
    visibility_.resize(std::size_t(sw) * sh);
    const auto sourceIndex = [&](int x, int y) {
        return std::size_t(std::min(height - 1, y * 2 + 1)) * width +
               std::min(width - 1, x * 2 + 1);
    };
    for (int y = 0; y < sh; ++y)
        for (int x = 0; x < sw; ++x) {
            const auto& s = surfaces[sourceIndex(x, y)];
            const bool filtered =
                s.covered &&
                (s.material < 0 || (frame.materials[s.material].shading != Shading::Unlit &&
                                    frame.materials[s.material].shading != Shading::Toon));
            visibility_[std::size_t(y) * sw + x] =
                filtered ? shadowVisibility(worldOf(s), normalOf(s), settings) : 1;
        }
    const Material reference;
    const LinearRGB background{srgbToLinear(frame.background.r), srgbToLinear(frame.background.g),
                               srgbToLinear(frame.background.b)};
    for (int y = 0; y < height; ++y)
        for (int x = 0; x < width; ++x) {
            const auto index = std::size_t(y) * width + x;
            const auto& surface = surfaces[index];
            if (!surface.covered) {
                target_.radiance_[index] = background;
                continue;
            }
            const Material& material =
                surface.material < 0 ? reference : frame.materials[surface.material];
            if (material.shading == Shading::Unlit) {
                target_.radiance_[index] = shadeMaterial(surface.base, worldOf(surface),
                                                         normalOf(surface), material, settings, 1);
                continue;
            }
            if (material.shading == Shading::Toon) {
                ++statistics_.guidedExactPixels;
                target_.radiance_[index] = shadeMaterial(surface.base, worldOf(surface),
                                                         normalOf(surface), material, settings);
                continue;
            }
            double weightSum = 0, value = 0;
            // A 2x2 Gaussian neighborhood constrained by material, albedo, normal and depth.
            // On unsupported/thin boundaries, evaluate visibility at the exact output sample.
            const double centerX = (x - 1) * .5, centerY = (y - 1) * .5;
            const int cx = int(std::floor(centerX)), cy = int(std::floor(centerY));
            for (int dy = 0; dy <= 1; ++dy)
                for (int dx = 0; dx <= 1; ++dx) {
                    const int sx = cx + dx, sy = cy + dy;
                    if (sx < 0 || sy < 0 || sx >= sw || sy >= sh)
                        continue;
                    const auto si = sourceIndex(sx, sy);
                    const auto& sample = surfaces[si];
                    if (!sample.covered || sample.material != surface.material ||
                        sample.key != surface.key)
                        continue;
                    const double nd = surface.normal[0] * sample.normal[0] +
                                      surface.normal[1] * sample.normal[1] +
                                      surface.normal[2] * sample.normal[2];
                    const double depthDelta = std::abs(
                        target_.depth(x, y) - target_.depth(std::min(width - 1, sx * 2 + 1),
                                                            std::min(height - 1, sy * 2 + 1)));
                    if (nd < .95 || depthDelta > .001)
                        continue;
                    const auto gaussian = [](double d) {
                        return d == 0 ? 1.0
                                      : (std::abs(d) == .5 ? .7066482778577162 : .2493522087772962);
                    };
                    const double weight =
                        gaussian(sx - centerX) * gaussian(sy - centerY) / (1 + depthDelta * 2000);
                    value += weight * visibility_[std::size_t(sy) * sw + sx];
                    weightSum += weight;
                }
            // Toon transitions use exact visibility; filtering never blurs intentional bands.
            if (weightSum < 1e-8)
                ++statistics_.guidedExactPixels;
            const float visibility =
                (weightSum < 1e-8 || material.shading == Shading::Toon)
                    ? shadowVisibility(worldOf(surface), normalOf(surface), settings)
                    : float(value / weightSum);
            target_.radiance_[index] = shadeMaterial(
                surface.base, worldOf(surface), normalOf(surface), material, settings, visibility);
        }
}
void CpuFrameKit::drawOutlines(const scene::SceneFrame& frame, bool hdr) {
    const auto& surfaces = target_.surfaces();
    const int sw = target_.color().width(), sh = target_.color().height();
    const int width = hdr ? sw : output_.width(), height = hdr ? sh : output_.height();
    for (int y = 0; y < height; ++y)
        for (int x = 0; x < width; ++x) {
            const int sx = x * sw / width, sy = y * sh / height;
            const auto& s = surfaces[std::size_t(sy) * sw + sx];
            if (!s.covered || s.material < 0)
                continue;
            const auto& material = frame.materials[s.material];
            const int radius = material.outlinePixels;
            if (radius == 0)
                continue;
            bool edge = false;
            for (int dy = -radius; dy <= radius && !edge; ++dy)
                for (int dx = -radius; dx <= radius; ++dx) {
                    if (dx * dx + dy * dy > radius * radius)
                        continue;
                    const int xx = x + dx, yy = y + dy;
                    if (xx < 0 || yy < 0 || xx >= width || yy >= height) {
                        edge = true;
                        break;
                    }
                    const int tx = xx * sw / width, ty = yy * sh / height;
                    const auto& t = surfaces[std::size_t(ty) * sw + tx];
                    const double normalDot = s.normal[0] * t.normal[0] + s.normal[1] * t.normal[1] +
                                             s.normal[2] * t.normal[2];
                    if (!t.covered || t.material != s.material || normalDot < .5 ||
                        std::abs(target_.depth(sx, sy) - target_.depth(tx, ty)) > .003) {
                        edge = true;
                        break;
                    }
                }
            if (edge) {
                if (hdr)
                    target_.radiance_[std::size_t(y) * sw + x] = material.outlineColor;
                else
                    output_.put(x, y, displayColor(material.outlineColor, frame.display.exposure));
            }
        }
}

} // namespace nexusgl::render
