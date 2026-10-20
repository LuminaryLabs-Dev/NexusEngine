#include "nexusgl/domains/scene/scene_dsk.hpp"
#include <cmath>
#include <stdexcept>
#include <type_traits>

namespace nexusgl::scene {
namespace {
void finite(double value) {
    if (!std::isfinite(value) || std::abs(value) > 1e9)
        throw std::invalid_argument("scene descriptor coordinate outside finite bounds");
}
void finite(Vec3 value) {
    finite(value.x);
    finite(value.y);
    finite(value.z);
}
void direction(Vec3 value) {
    finite(value);
    if (value.x * value.x + value.y * value.y + value.z * value.z < 1e-24)
        throw std::invalid_argument("normal or light direction must be nonzero");
}
void unitRange(double value) {
    if (!std::isfinite(value) || value < 0 || value > 1)
        throw std::invalid_argument("material value outside 0..1");
}
void positive(double value) {
    if (!std::isfinite(value) || value < 0 || value > 1e6)
        throw std::invalid_argument("lighting value outside 0..1000000");
}
void rgb(LinearRGB value) {
    positive(value.r);
    positive(value.g);
    positive(value.b);
}
void finite(const Mat4& matrix) {
    for (double value : matrix.values)
        finite(value);
}
} // namespace
void validate(const Descriptor& descriptor) {
    std::visit(
        [](const auto& frame) {
            using Frame = std::decay_t<decltype(frame)>;
            if constexpr (std::is_same_v<Frame, CanvasFrame>) {
                for (const auto& draw : frame.draws)
                    std::visit(
                        [](const auto& command) {
                            using Command = std::decay_t<decltype(command)>;
                            if constexpr (std::is_same_v<Command, Triangle2D>)
                                for (auto p : command.vertices) {
                                    finite(p.x);
                                    finite(p.y);
                                }
                            else if constexpr (std::is_same_v<Command, Rectangle2D>) {
                                finite(command.x);
                                finite(command.y);
                                finite(command.width);
                                finite(command.height);
                            } else {
                                finite(command.center.x);
                                finite(command.center.y);
                                finite(command.radius);
                            }
                        },
                        draw);
            } else {
                finite(frame.viewProjection);
                finite(frame.cameraPosition);
                finite(frame.shadow.viewProjection);
                direction(frame.shadow.directionToLight);
                unitRange(frame.shadow.bias);
                unitRange(frame.shadow.receiverPlaneClamp);
                if (frame.shadow.filterRadius < 0 || frame.shadow.filterRadius > 2)
                    throw std::invalid_argument("shadow filter radius must be 0..2");
                const auto& shadowMatrix = frame.shadow.viewProjection.values;
                if (shadowMatrix[12] != 0 || shadowMatrix[13] != 0 || shadowMatrix[14] != 0 ||
                    shadowMatrix[15] != 1)
                    throw std::invalid_argument(
                        "directional shadows require an affine orthographic projection");
                positive(frame.light.color.r);
                positive(frame.light.color.g);
                positive(frame.light.color.b);
                positive(frame.light.intensity);
                positive(frame.light.fill);
                positive(frame.light.sky);
                positive(frame.light.skyGradient);
                if (frame.display.sampleScale != 1 && frame.display.sampleScale != 2)
                    throw std::invalid_argument("sample scale must be 1 or 2");
                positive(frame.light.specular);
                positive(frame.light.specularPower);
                positive(frame.display.exposure);
                for (const auto& texture : frame.textures) {
                    if (texture.width <= 0 || texture.height <= 0 || texture.width > 8192 ||
                        texture.height > 8192 ||
                        std::size_t(texture.width) * texture.height > 16 * 1024 * 1024 ||
                        texture.pixels.size() != std::size_t(texture.width) * texture.height)
                        throw std::invalid_argument(
                            "invalid owned texture dimensions or pixel count");
                    if (texture.filter != TextureFilter::Nearest &&
                        texture.filter != TextureFilter::Bilinear &&
                        texture.filter != TextureFilter::Trilinear)
                        throw std::invalid_argument("unsupported texture filter");
                    int width = texture.width, height = texture.height;
                    for (const auto& mip : texture.mips) {
                        if (width == 1 && height == 1)
                            throw std::invalid_argument("excess mip levels");
                        width = (width + 1) / 2;
                        height = (height + 1) / 2;
                        if (mip.width != width || mip.height != height ||
                            mip.pixels.size() != std::size_t(width) * height)
                            throw std::invalid_argument("invalid mip chain");
                    }
                }
                for (const auto& material : frame.materials) {
                    if (material.shading != Shading::Reference &&
                        material.shading != Shading::Toon && material.shading != Shading::PBR &&
                        material.shading != Shading::Unlit)
                        throw std::invalid_argument("unsupported shading model");
                    if (material.alphaMode != AlphaMode::Opaque &&
                        material.alphaMode != AlphaMode::Mask &&
                        material.alphaMode != AlphaMode::Blend)
                        throw std::invalid_argument("unsupported alpha mode");
                    unitRange(material.opacity);
                    unitRange(material.alphaCutoff);
                    if (material.alphaMode == AlphaMode::Blend && material.outlinePixels)
                        throw std::invalid_argument("blended surfaces do not support outlines; use "
                                                    "an opaque or masked outline material");
                    unitRange(material.roughness);
                    unitRange(material.metallic);
                    unitRange(material.bandSoftness);
                    if (material.roughness < .045f || material.bands < 2 || material.bands > 16 ||
                        material.outlinePixels < 0 || material.outlinePixels > 4)
                        throw std::invalid_argument(
                            "invalid roughness, toon bands or outline width");
                    positive(material.normalStrength);
                    positive(material.highlight);
                    positive(material.rim);
                    rgb(material.tint);
                    if (material.shading == Shading::PBR) {
                        unitRange(material.tint.r);
                        unitRange(material.tint.g);
                        unitRange(material.tint.b);
                    }
                    rgb(material.shadowColor);
                    rgb(material.outlineColor);
                    for (int texture : {material.colorTexture, material.normalTexture})
                        if (texture < -1 ||
                            (texture >= 0 && std::size_t(texture) >= frame.textures.size()))
                            throw std::invalid_argument(
                                "material texture reference outside descriptor");
                }
                if (frame.shadow.resolution <= 0 || frame.shadow.resolution > 8192 ||
                    static_cast<std::size_t>(frame.shadow.resolution) * frame.shadow.resolution >
                        16 * 1024 * 1024)
                    throw std::invalid_argument(
                        "shadow descriptor dimensions outside target bounds");
                for (const auto& triangle : frame.triangles) {
                    finite(triangle.geometricNormal);
                    if (triangle.material < -1 ||
                        (triangle.material >= 0 &&
                         std::size_t(triangle.material) >= frame.materials.size()))
                        throw std::invalid_argument(
                            "triangle material reference outside descriptor");
                    if (triangle.vertices[0].handedness != triangle.vertices[1].handedness ||
                        triangle.vertices[0].handedness != triangle.vertices[2].handedness)
                        throw std::invalid_argument("triangle tangent handedness must agree");
                    for (const auto& vertex : triangle.vertices) {
                        finite(vertex.position);
                        direction(vertex.normal);
                        finite(vertex.uv.x);
                        finite(vertex.uv.y);
                        finite(vertex.tangent);
                        if (vertex.handedness != 1 && vertex.handedness != -1)
                            throw std::invalid_argument("tangent handedness must be +1 or -1");
                    }
                }
            }
        },
        descriptor);
}
bool PlaybackKit::setTime(double seconds) {
    if (!std::isfinite(seconds))
        throw std::invalid_argument("scene time must be finite");
    const bool changed = seconds != state_.seconds;
    state_.seconds = seconds;
    return changed;
}
bool PlaybackKit::advance(double delta) {
    if (!std::isfinite(delta) || delta < 0)
        throw std::invalid_argument("scene delta must be finite and nonnegative");
    return state_.paused ? false : setTime(state_.seconds + delta);
}
void PlaybackKit::restore(PlaybackState state) {
    if (!std::isfinite(state.seconds))
        throw std::invalid_argument("invalid playback snapshot");
    state_ = state;
}
void SceneFrameKit::submit(Descriptor descriptor) {
    validate(descriptor);
    frame_ = std::make_shared<const Descriptor>(std::move(descriptor));
}
const Descriptor& SceneFrameKit::frame() const {
    if (!frame_)
        throw std::logic_error("scene frame has not been prepared for current time");
    return *frame_;
}
void SceneFrameKit::restore(Snapshot snapshot) {
    if (snapshot)
        validate(*snapshot);
    auto replacement = snapshot ? std::make_shared<const Descriptor>(std::move(*snapshot))
                                : std::shared_ptr<const Descriptor>{};
    frame_ = std::move(replacement);
}
void SceneDSK::setTime(double seconds) {
    if (playback_.setTime(seconds))
        frames_.reset();
}
void SceneDSK::advance(double delta) {
    if (playback_.advance(delta))
        frames_.reset();
}
void SceneDSK::reset() noexcept {
    playback_.reset();
    frames_.reset();
}
Snapshot SceneDSK::snapshot() const {
    return {1, playback_.snapshot(), frames_.snapshot()};
}
void SceneDSK::restore(const Snapshot& snapshot) {
    if (snapshot.version != 1)
        throw std::invalid_argument("unsupported scene snapshot version");
    PlaybackKit playback;
    playback.restore(snapshot.playback);
    SceneFrameKit frames;
    frames.restore(snapshot.frame);
    playback_ = std::move(playback);
    frames_ = std::move(frames);
}
} // namespace nexusgl::scene
