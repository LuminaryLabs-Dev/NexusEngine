#include "nexusgl/domains/scene/resource_store.hpp"
#include "nexusgl/graphics.hpp"
#include <cassert>
#include <iostream>
#include <vector>
using namespace nexusgl;
static std::vector<unsigned char> capture(Renderer& r, const scene::PreparedScene& f) {
    const auto& p = r.render(f, {24, 24});
    return {p.data(), p.data() + p.size()};
}
int main() {
    for (std::size_t count : {2047, 2048, 2049, 4096}) {
        scene::ResourceStore store;
        auto settings = store.settings();
        settings.shadow.resolution = 16;
        settings.shadow.closedBackFacesOnly = false;
        store.setSettings(settings);
        auto mesh = std::make_shared<scene::MeshData>();
        mesh->vertices = {{{-.7, -.7, .5}}, {{.7, -.7, .5}}, {{0, .7, .5}}};
        for (std::size_t i = 0; i < count; ++i)
            mesh->indices.insert(mesh->indices.end(), {0, 1, 2});
        store.mesh(1, mesh);
        scene::InstanceData instance;
        instance.mesh = 1;
        store.instance(2, instance);
        Renderer r;
        r.setQuality(render::Quality::Native);
        const auto baseline = capture(r, store.prepared());
        assert(!r.statistics().shadowCacheHit);
        assert(capture(r, store.prepared()) == baseline && r.statistics().shadowCacheHit);
        const auto transforms = store.statistics().transformedVertices;
        settings.cameraPosition.x = .2;
        store.setSettings(settings);
        capture(r, store.prepared());
        assert(r.statistics().shadowCacheHit &&
               store.statistics().transformedVertices == transforms);
        settings.shadow.directionToLight = {1, 2, 3};
        store.setSettings(settings);
        capture(r, store.prepared());
        assert(r.statistics().shadowCacheMiss);
        capture(r, store.prepared());
        assert(r.statistics().shadowCacheHit);
        instance.model = Mat4::translation(.1, 0, 0);
        store.instance(2, instance, true);
        const auto changed = capture(r, store.prepared());
        assert(!r.statistics().shadowCacheHit);
        auto limits = r.resourceLimits();
        limits.shadowCacheBytes = 0;
        r.setResourceLimits(limits);
        assert(capture(r, store.prepared()) == changed && r.statistics().shadowCacheBypass);
        r.trimResources();
        assert(capture(r, store.prepared()) == changed);
        // Raw descriptors use a bounded exact byte key and remain safe at the old
        // 2048 gate.
        auto raw = store.prepared().frame();
        limits.shadowCacheBytes = 32 * 1024 * 1024;
        r.setResourceLimits(limits);
        r.render(raw, {24, 24});
        r.render(raw, {24, 24});
        assert(r.statistics().shadowCacheHit);
    }
    scene::ResourceStore bounded;
    auto caster = std::make_shared<scene::MeshData>();
    caster->vertices = {{{-.5, -.5, .5}}, {{.5, -.5, .5}}, {{0, .5, .5}}};
    caster->indices = {0, 1, 2};
    bounded.mesh(1, caster);
    scene::InstanceData instance;
    instance.mesh = 1;
    bounded.instance(2, instance);
    auto settings = bounded.settings();
    settings.shadow.resolution = 128;
    bounded.setSettings(settings);
    Renderer capped;
    auto cap = capped.resourceLimits();
    cap.shadowCacheBytes = 20000;
    capped.setResourceLimits(cap);
    capture(capped, bounded.prepared());
    assert(capped.statistics().shadowCacheBypass);
    settings.shadow.resolution = 16;
    bounded.setSettings(settings);
    capture(capped, bounded.prepared());
    assert(capped.statistics().shadowCacheBypass &&
           capped.statistics().shadowCacheBytes <= cap.shadowCacheBytes);
    capped.trimResources();
    capture(capped, bounded.prepared());
    capture(capped, bounded.prepared());
    assert(capped.statistics().shadowCacheHit &&
           capped.statistics().shadowCacheBytes <= cap.shadowCacheBytes);
    std::cout << "shadow-cache PASS\n";
}
