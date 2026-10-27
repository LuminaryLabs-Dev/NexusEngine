#include "nexusgl/graphics.hpp"
#include <cassert>
#include <iostream>
using namespace nexusgl;
int main() {
    Framebuffer framebuffer(64, 64);
    const auto cap = framebuffer.allocatedBytes();
    const auto allocations = framebuffer.allocations();
    framebuffer.clear({100, 120, 140, 160});
    framebuffer.resize(32, 32);
    const auto cleared = framebuffer.pixel(0, 0);
    assert(cleared.r == 0 && cleared.g == 0 && cleared.b == 0 && cleared.a == 0);
    framebuffer.resize(64, 64);
    assert(framebuffer.allocatedBytes() == cap && framebuffer.allocations() == allocations);
    try {
        framebuffer.resize(-1, 32);
        assert(false);
    } catch (const std::invalid_argument&) {
    }
    assert(framebuffer.width() == 64);
    RenderTarget3D resizedTarget(16, 16);
    resizedTarget.setLighting(LightingSettings{});
    resizedTarget.captureSurfaces(true);
    resizedTarget.clear({30, 40, 50, 255});
    resizedTarget.triangle(ClipVertex{{-.8, -.8, .5, 1}, {255, 0, 0}},
                           ClipVertex{{.8, -.8, .5, 1}, {255, 0, 0}},
                           ClipVertex{{0, .8, .5, 1}, {255, 0, 0}});
    bool covered = false;
    for (const auto& surface : resizedTarget.surfaces())
        covered |= surface.covered;
    assert(covered);
    resizedTarget.resize(8, 8);
    assert(resizedTarget.depth(4, 4) == 1 && resizedTarget.alpha()[0] == 1 &&
           resizedTarget.radiance()[0].r == 0);
    for (const auto& surface : resizedTarget.surfaces())
        assert(!surface.covered);
    const auto targetColor = resizedTarget.color().pixel(0, 0);
    assert(targetColor.r == 0 && targetColor.a == 0);
    scene::SceneFrame frame;
    frame.shadow.resolution = 16;
    frame.background = {0, 0, 0, 0};
    Material glass;
    glass.shading = Shading::Unlit;
    glass.alphaMode = AlphaMode::Blend;
    glass.opacity = .5;
    frame.materials.push_back(glass);
    scene::SurfaceTriangle triangle;
    triangle.vertices = {scene::SurfaceVertex{{-.5, -.5, .5}}, scene::SurfaceVertex{{.5, -.5, .5}},
                         scene::SurfaceVertex{{0, .5, .5}}};
    triangle.material = 0;
    frame.triangles.push_back(triangle);
    Renderer renderer;
    const auto cycle = [&] {
        for (auto quality : {render::Quality::Native, render::Quality::GaussianHalf,
                             render::Quality::GuidedHalf}) {
            renderer.setQuality(quality);
            renderer.render(frame, {64, 64});
            renderer.render(frame, {32, 32});
            renderer.render(scene::CanvasFrame{}, {64, 64});
        }
    };
    cycle();
    cycle();
    const auto stable = renderer.statistics().residentBytes;
    cycle();
    assert(renderer.statistics().residentBytes == stable);
    renderer.setQuality(render::Quality::Native);
    renderer.render(frame, {64, 64});
    const auto before = renderer.statistics().allocations;
    const auto fragmentCapacity = renderer.statistics().fragmentCapacity;
    assert(fragmentCapacity > 0 && fragmentCapacity < RenderTarget3D::maxTransparentFragments);
    for (int i = 0; i < 10; ++i) {
        renderer.render(frame, {64, 64});
        assert(renderer.statistics().allocations == before);
    }
    const auto limits = renderer.resourceLimits();
    renderer.setResourceLimits(limits);
    renderer.render(frame, {64, 64});
    assert(renderer.statistics().allocations == before);
    const auto retained = renderer.statistics().residentBytes;
    renderer.trimResources();
    renderer.render(scene::CanvasFrame{}, {8, 8});
    assert(renderer.statistics().residentBytes < retained);
    std::cout << "memory-reuse PASS\n";
}
