#pragma once
#include "domains/render/render_dsk.hpp"
#include "render3d.hpp"
#include <stdexcept>
#include <utility>

namespace nexusgl {
struct Surface {
    int width = 900, height = 420;
};
struct Capabilities {
    bool software = true, gpu = false, textures = true, normalMaps = true, toon = true, pbr = true;
    bool alphaBlend = true, alphaMask = true, transparentBackground = true;
    bool bilinear = true, mipmaps = true, supersampling = true, anisotropic = false;
    std::size_t maxTransparentFragments = RenderTarget3D::maxTransparentFragments;
    int maxTransparentLayers = RenderTarget3D::maxTransparentLayers;
    int maxDimension = Framebuffer::maxDimension;
    std::size_t maxPixels = Framebuffer::maxPixels, maxGuidedPixels = render::maxGuidedPixels;
};
// An owned, replayable CPU command list. It contains scene values, never OS handles.
// Geometry vertices are world-space; camera/projection/light are explicit descriptors.
class CommandBuffer {
  public:
    explicit CommandBuffer(scene::SceneFrame state) : commands_(std::move(state)) {}
    explicit CommandBuffer(scene::CanvasFrame state) : commands_(std::move(state)) {}
    void clear(Color color) {
        std::visit([&](auto& f) { f.background = color; }, commands_);
    }
    void draw(scene::SurfaceTriangle triangle) {
        auto* frame = std::get_if<scene::SceneFrame>(&commands_);
        if (!frame)
            throw std::logic_error("3D draw requires 3D commands");
        frame->triangles.push_back(std::move(triangle));
    }
    void draw(scene::Draw2D draw) {
        auto* frame = std::get_if<scene::CanvasFrame>(&commands_);
        if (!frame)
            throw std::logic_error("2D draw requires 2D commands");
        frame->draws.push_back(std::move(draw));
    }
    const scene::Descriptor& descriptor() const noexcept { return commands_; }

  private:
    scene::Descriptor commands_;
};
class Renderer {
  public:
    static Capabilities capabilities() noexcept { return {}; }
    void setQuality(render::Quality quality) { service_.setQuality(quality); }
    // Returned pixels are borrowed until the next render/reset/destruction.
    // Invalid input throws invalid_argument; allocation may throw bad_alloc.
    const Framebuffer& render(const scene::Descriptor& scene, Surface surface) {
        return service_.render(scene, surface.width, surface.height);
    }
    const Framebuffer& render(const scene::PreparedScene& prepared, Surface surface) {
        return service_.render(prepared, surface.width, surface.height);
    }
    const Framebuffer& submit(const CommandBuffer& commands, Surface surface) {
        return render(commands.descriptor(), surface);
    }
    const render::Receipt& receipt() const noexcept { return service_.lastReceipt(); }
    void setResourceLimits(render::ResourceLimits limits) { service_.setResourceLimits(limits); }
    void setExternalReservation(std::uint64_t bytes) { service_.setExternalReservation(bytes); }
    render::ResourceLimits resourceLimits() const noexcept { return service_.resourceLimits(); }
    const render::FrameStatistics& statistics() const noexcept { return service_.statistics(); }
    void trimResources() { service_.trimResources(); }
    void reset() { service_.reset(); }

  private:
    render::RenderDSK service_;
};
} // namespace nexusgl
