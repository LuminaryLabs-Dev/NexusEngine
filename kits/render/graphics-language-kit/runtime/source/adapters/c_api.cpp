#include "nexusgl/c_api.h"
#include "nexusgl/domains/scene/scene_dsk.hpp"
#include "nexusgl/graphics.hpp"
#include <algorithm>
#include <cmath>
#include <cstdio>
#include <limits>
#include <map>
#include <memory>
#include <mutex>
#include <stdexcept>
using namespace nexusgl;
namespace {
struct Device {
    Renderer renderer;
    std::uint64_t shadowHits = 0, shadowMisses = 0, shadowBypasses = 0;
    std::map<nx_handle, std::unique_ptr<scene::SceneDSK>> scenes;
};
std::map<nx_handle, std::unique_ptr<Device>> devices;
std::mutex mutex;
nx_handle nextId = 1;
thread_local char error[512]{};
nx_handle identity() {
    if (nextId == std::numeric_limits<nx_handle>::max())
        throw std::runtime_error("handle space exhausted");
    return nextId++;
}
Device& device(nx_handle id) {
    auto it = devices.find(id);
    if (it == devices.end())
        throw std::invalid_argument("invalid or destroyed device");
    return *it->second;
}
scene::ResourceStore& sceneOf(Device& d, nx_handle id) {
    auto it = d.scenes.find(id);
    if (it == d.scenes.end())
        throw std::invalid_argument("invalid, foreign or destroyed scene");
    return it->second->resources();
}
std::uint64_t ownedBytes(const Device& d) {
    std::uint64_t total = 0;
    for (const auto& p : d.scenes)
        total = checkedAdd(total, checkedAdd(p.second->resources().residentBytes(),
                                             p.second->resources().stagingBytes()));
    return total;
}
template <class F> auto call(F action) -> decltype(action()) {
    std::lock_guard<std::mutex> lock(mutex);
    error[0] = 0;
    try {
        return action();
    } catch (const std::exception& e) {
        std::snprintf(error, sizeof(error), "%s", e.what());
        return {};
    } catch (...) {
        std::snprintf(error, sizeof(error), "unrecognized rendering failure");
        return {};
    }
}
template <class F>
auto sceneCall(nx_handle d, nx_handle s, F action)
    -> decltype(action(std::declval<Device&>(), std::declval<scene::ResourceStore&>())) {
    return call([&] {
        auto& dev = device(d);
        auto& store = sceneOf(dev, s);
        try {
            // Every scene mutation reserves the other scenes before accepting staged
            // payloads.
            const auto own = checkedAdd(store.residentBytes(), store.stagingBytes());
            const auto all = ownedBytes(dev);
            const auto budget = dev.renderer.resourceLimits().budgetBytes;
            if (all - own >= budget)
                throw std::runtime_error("other scenes exceed device budget");
            store.setBudget(budget - (all - own));
            return action(dev, store);
        } catch (...) {
            store.poison();
            throw;
        }
    });
}
Vec3 vec(const double* v) {
    return {v[0], v[1], v[2]};
}
scene::SurfaceVertex vertex(const nx_vertex& v) {
    return {vec(v.position), vec(v.normal), {v.uv[0], v.uv[1]}, vec(v.tangent), v.handedness};
}
Material material(const nx_material* input) {
    if (!input)
        throw std::invalid_argument("missing material");
    Material m;
    m.shading = Shading(input->shading);
    m.alphaMode = AlphaMode(input->alpha_mode);
    m.tint = {input->tint[0], input->tint[1], input->tint[2]};
    m.roughness = input->roughness;
    m.metallic = input->metallic;
    m.opacity = input->opacity;
    m.alphaCutoff = input->alpha_cutoff;
    m.normalStrength = input->normal_strength;
    m.bands = input->bands;
    m.outlinePixels = input->outline_pixels;
    m.bandSoftness = input->softness;
    m.highlight = input->highlight;
    m.rim = input->rim;
    m.shadowColor = {input->shadow_color[0], input->shadow_color[1], input->shadow_color[2]};
    m.outlineColor = {input->outline_color[0], input->outline_color[1], input->outline_color[2]};
    return m;
}
std::unique_ptr<Texture2D> texture(Device& d, int width, int height, const uint8_t* rgba,
                                         size_t stride, int filter, int normal) {
    if (!rgba || width < 1 || height < 1 || width > 8192 || height > 8192 ||
        uint64_t(width) * height > Framebuffer::maxPixels || stride < size_t(width) * 4 ||
        stride > SIZE_MAX / size_t(height) || filter < 0 || filter > 2)
        throw std::invalid_argument("invalid texture upload");
    requireBudget(ownedBytes(d), uint64_t(width) * height * 16,
                  d.renderer.resourceLimits().budgetBytes);
    auto t = std::make_unique<Texture2D>();
    t->width = width;
    t->height = height;
    t->filter = TextureFilter(filter);
    t->pixels.resize(size_t(width) * height);
    for (int y = 0; y < height; ++y)
        for (int x = 0; x < width; ++x) {
            const auto* p = rgba + size_t(y) * stride + size_t(x) * 4;
            t->pixels[size_t(y) * width + x] = {p[0], p[1], p[2], p[3]};
        }
    if (filter == 2)
        generateMipmaps(*t, normal == 0);
    return t;
}
std::unique_ptr<scene::MeshData> mesh(Device& d, const nx_vertex* vertices, size_t vc,
                                            const uint32_t* indices, size_t ic) {
    if ((!vertices && vc) || (!indices && ic) || ic % 3)
        throw std::invalid_argument("invalid indexed mesh input");
    requireBudget(ownedBytes(d),
                  checkedAdd(checkedMultiply(vc, sizeof(scene::SurfaceVertex)),
                             checkedMultiply(ic, sizeof(uint32_t))),
                  d.renderer.resourceLimits().budgetBytes);
    auto m = std::make_unique<scene::MeshData>();
    m->vertices.reserve(vc);
    for (size_t i = 0; i < vc; ++i)
        m->vertices.push_back(vertex(vertices[i]));
    if (ic)
        m->indices.assign(indices, indices + ic);
    return m;
}
scene::InstanceData instance(nx_handle mesh, nx_handle material, const double* matrix,
                             const uint8_t* color, int casts, int two) {
    if (!matrix || !color)
        throw std::invalid_argument("missing instance transform or color");
    scene::InstanceData i;
    i.mesh = mesh;
    i.material = material;
    std::copy_n(matrix, 16, i.model.values.begin());
    i.color = {color[0], color[1], color[2], color[3]};
    i.castsShadow = casts != 0;
    i.twoSidedShadow = two != 0;
    return i;
}
} // namespace
extern "C" {
const char* nx_last_error(void) {
    return error;
}
unsigned nx_get_abi_version(void) {
    return 2;
}
nx_capabilities nx_get_capabilities(void) {
    const auto c = Renderer::capabilities();
    return {1,
            c.software,
            c.gpu,
            c.alphaBlend,
            c.alphaMask,
            c.mipmaps,
            c.supersampling,
            c.maxDimension,
            c.maxPixels,
            c.maxGuidedPixels,
            c.maxTransparentFragments,
            render::ResourceLimits{}.budgetBytes};
}
nx_material nx_default_material(void) {
    nx_material m{};
    m.tint[0] = m.tint[1] = m.tint[2] = 1;
    m.roughness = .5f;
    m.opacity = 1;
    m.alpha_cutoff = .5f;
    m.normal_strength = 1;
    m.bands = 3;
    m.highlight = .25f;
    m.rim = .15f;
    m.shadow_color[0] = .16f;
    m.shadow_color[1] = .22f;
    m.shadow_color[2] = .32f;
    m.outline_color[0] = .015f;
    m.outline_color[1] = .02f;
    m.outline_color[2] = .03f;
    return m;
}
nx_view nx_default_view(void) {
    nx_view v{};
    for (int i = 0; i < 16; ++i)
        v.projection[i] = v.shadow_projection[i] = i % 5 == 0 ? 1 : 0;
    v.camera[2] = 5;
    v.light_direction[0] = -5;
    v.light_direction[1] = 8;
    v.light_direction[2] = 6;
    v.shadow_resolution = 1024;
    v.closed_back_faces = 1;
    v.exposure = 1.25f;
    v.sample_scale = 1;
    v.shadow_bias = .0005;
    v.receiver_plane_clamp = .03;
    v.shadow_filter_radius = 1;
    return v;
}
nx_light nx_default_light(void) {
    return {{1, .88, .72}, 2.2, .35, .08, .12, .65, 56};
}

nx_handle nx_device_create(void) {
    return call([] {
        const auto id = identity();
        devices.emplace(id, std::make_unique<Device>());
        return id;
    });
}
int nx_device_destroy(nx_handle id) {
    return call([&] {
        device(id);
        devices.erase(id);
        return 1;
    });
}
int nx_device_set_limits(nx_handle id, uint64_t bytes, uint64_t fragments) {
    return call([&] {
        auto& d = device(id);
        if (ownedBytes(d) > bytes)
            throw std::runtime_error("owned scenes exceed requested budget");
        auto limits = d.renderer.resourceLimits();
        limits.budgetBytes = bytes;
        limits.transparentFragments = fragments;
        d.renderer.setResourceLimits(limits);
        return 1;
    });
}
int nx_device_set_shadow_cache_limit(nx_handle id, uint64_t bytes) {
    return call([&] {
        auto& d = device(id);
        auto limits = d.renderer.resourceLimits();
        if (bytes > limits.budgetBytes)
            throw std::invalid_argument("shadow cache limit exceeds device budget");
        limits.shadowCacheBytes = bytes;
        d.renderer.setResourceLimits(limits);
        return 1;
    });
}
int nx_device_trim(nx_handle id) {
    return call([&] {
        device(id).renderer.trimResources();
        return 1;
    });
}
nx_handle nx_scene_create(nx_handle id) {
    return call([&] {
        auto& d = device(id);
        if (d.scenes.size() >= 256)
            throw std::runtime_error("device scene limit reached");
        requireBudget(ownedBytes(d), 4096, d.renderer.resourceLimits().budgetBytes);
        auto s = std::make_unique<scene::SceneDSK>();
        const auto key = identity();
        d.scenes.emplace(key, std::move(s));
        return key;
    });
}
int nx_scene_destroy(nx_handle d, nx_handle s) {
    return call([&] {
        auto& dev = device(d);
        sceneOf(dev, s);
        dev.scenes.erase(s);
        return 1;
    });
}
int nx_scene_begin(nx_handle d, nx_handle s, uint64_t revision) {
    return sceneCall(d, s, [&](auto&, auto& store) {
        store.begin(revision);
        return 1;
    });
}
int nx_scene_commit(nx_handle d, nx_handle s) {
    return sceneCall(d, s, [&](auto&, auto& store) {
        store.commit();
        return 1;
    });
}
int nx_scene_abort(nx_handle d, nx_handle s) {
    return call([&] {
        sceneOf(device(d), s).abort();
        return 1;
    });
}
uint64_t nx_scene_revision(nx_handle d, nx_handle s) {
    return call([&] { return sceneOf(device(d), s).revision(); });
}
int nx_scene_set_background(nx_handle d, nx_handle s, uint8_t r, uint8_t g, uint8_t b, uint8_t a) {
    return sceneCall(d, s, [&](auto&, auto& store) {
        auto f = store.settings();
        f.background = {r, g, b, a};
        store.setSettings(f);
        return 1;
    });
}
int nx_scene_set_light(nx_handle d, nx_handle s, const nx_light* light) {
    return sceneCall(d, s, [&](auto&, auto& store) {
        if (!light)
            throw std::invalid_argument("missing light");
        auto f = store.settings();
        f.light.color = {light->color[0], light->color[1], light->color[2]};
        f.light.intensity = light->intensity;
        f.light.fill = light->fill;
        f.light.sky = light->sky;
        f.light.skyGradient = light->sky_gradient;
        f.light.specular = light->specular;
        f.light.specularPower = light->specular_power;
        store.setSettings(f);
        return 1;
    });
}
int nx_scene_set_view(nx_handle d, nx_handle s, const nx_view* view) {
    return sceneCall(d, s, [&](auto&, auto& store) {
        if (!view)
            throw std::invalid_argument("missing view");
        auto f = store.settings();
        std::copy_n(view->projection, 16, f.viewProjection.values.begin());
        f.cameraPosition = vec(view->camera);
        std::copy_n(view->shadow_projection, 16, f.shadow.viewProjection.values.begin());
        f.shadow.directionToLight = vec(view->light_direction);
        f.shadow.resolution = view->shadow_resolution;
        f.shadow.closedBackFacesOnly = view->closed_back_faces != 0;
        f.display.exposure = view->exposure;
        f.display.sampleScale = view->sample_scale;
        f.shadow.bias = view->shadow_bias;
        f.shadow.receiverPlaneClamp = view->receiver_plane_clamp;
        f.shadow.filterRadius = view->shadow_filter_radius;
        store.setSettings(f);
        return 1;
    });
}
int nx_scene_clear_geometry(nx_handle d, nx_handle s) {
    return sceneCall(d, s, [&](auto&, auto& store) {
        store.clearGeometry();
        return 1;
    });
}
nx_handle nx_texture_create(nx_handle d, nx_handle s, int w, int h, const uint8_t* rgba,
                            size_t stride, int filter, int normal) {
    return sceneCall(d, s, [&](auto& dev, auto& store) {
        auto t = texture(dev, w, h, rgba, stride, filter, normal);
        const auto id = identity();
        store.texture(id, std::move(t));
        return id;
    });
}
int nx_texture_update(nx_handle d, nx_handle s, nx_handle id, int w, int h, const uint8_t* rgba,
                      size_t stride, int filter, int normal) {
    return sceneCall(d, s, [&](auto& dev, auto& store) {
        store.texture(id, texture(dev, w, h, rgba, stride, filter, normal), true);
        return 1;
    });
}
int nx_texture_release(nx_handle d, nx_handle s, nx_handle id) {
    return sceneCall(d, s, [&](auto&, auto& store) {
        store.releaseTexture(id);
        return 1;
    });
}
nx_handle nx_material_create(nx_handle d, nx_handle s, const nx_material* input) {
    return sceneCall(d, s, [&](auto&, auto& store) {
        const auto value = material(input);
        const auto id = identity();
        store.material(id, value, input->color_texture, input->normal_texture);
        return id;
    });
}
int nx_material_update(nx_handle d, nx_handle s, nx_handle id, const nx_material* input) {
    return sceneCall(d, s, [&](auto&, auto& store) {
        const auto value = material(input);
        store.material(id, value, input->color_texture, input->normal_texture, true);
        return 1;
    });
}
int nx_material_release(nx_handle d, nx_handle s, nx_handle id) {
    return sceneCall(d, s, [&](auto&, auto& store) {
        store.releaseMaterial(id);
        return 1;
    });
}
nx_handle nx_mesh_create(nx_handle d, nx_handle s, const nx_vertex* v, size_t vc,
                         const uint32_t* indices, size_t ic) {
    return sceneCall(d, s, [&](auto& dev, auto& store) {
        auto value = mesh(dev, v, vc, indices, ic);
        const auto id = identity();
        store.mesh(id, std::move(value));
        return id;
    });
}
int nx_mesh_update(nx_handle d, nx_handle s, nx_handle id, const nx_vertex* v, size_t vc,
                   const uint32_t* indices, size_t ic) {
    return sceneCall(d, s, [&](auto& dev, auto& store) {
        store.mesh(id, mesh(dev, v, vc, indices, ic), true);
        return 1;
    });
}
int nx_mesh_release(nx_handle d, nx_handle s, nx_handle id) {
    return sceneCall(d, s, [&](auto&, auto& store) {
        store.releaseMesh(id);
        return 1;
    });
}
nx_handle nx_instance_create(nx_handle d, nx_handle s, nx_handle meshId, nx_handle materialId,
                             const double* model, const uint8_t* color, int casts, int two) {
    return sceneCall(d, s, [&](auto&, auto& store) {
        const auto value = instance(meshId, materialId, model, color, casts, two);
        const auto id = identity();
        store.instance(id, value);
        return id;
    });
}
int nx_instance_update(nx_handle d, nx_handle s, nx_handle id, nx_handle meshId,
                       nx_handle materialId, const double* model, const uint8_t* color, int casts,
                       int two) {
    return sceneCall(d, s, [&](auto&, auto& store) {
        store.instance(id, instance(meshId, materialId, model, color, casts, two), true);
        return 1;
    });
}
int nx_instance_release(nx_handle d, nx_handle s, nx_handle id) {
    return sceneCall(d, s, [&](auto&, auto& store) {
        store.releaseInstance(id);
        return 1;
    });
}
int nx_instance_order(nx_handle d, nx_handle s, const nx_handle* ids, size_t count) {
    return sceneCall(d, s, [&](auto& dev, auto& store) {
        if (!ids && count)
            throw std::invalid_argument("missing instance order");
        requireBudget(ownedBytes(dev), checkedMultiply(count, sizeof(nx_handle)),
                      dev.renderer.resourceLimits().budgetBytes);
        std::vector<nx_handle> order;
        if (count)
            order.assign(ids, ids + count);
        store.order(order);
        return 1;
    });
}
int nx_draw_triangles(nx_handle d, nx_handle s, const nx_triangle* input, size_t count) {
    return sceneCall(d, s, [&](auto& dev, auto& store) {
        if (!input && count)
            throw std::invalid_argument("missing triangles");
        requireBudget(ownedBytes(dev), checkedMultiply(count, sizeof(scene::SurfaceTriangle)),
                      dev.renderer.resourceLimits().budgetBytes);
        auto triangles = std::make_unique<std::vector<scene::SurfaceTriangle>>();
        triangles->reserve(count);
        for (size_t i = 0; i < count; ++i) {
            const auto& in = input[i];
            scene::SurfaceTriangle out;
            for (int k = 0; k < 3; ++k)
                out.vertices[k] = vertex(in.vertices[k]);
            out.albedo = {in.color[0], in.color[1], in.color[2], in.color[3]};
            out.material = store.materialIndex(in.material);
            out.castsShadow = in.casts_shadow != 0;
            out.twoSidedShadow = in.two_sided_shadow != 0;
            const auto a = out.vertices[0].position, b = out.vertices[1].position,
                       c = out.vertices[2].position;
            const Vec3 u{b.x - a.x, b.y - a.y, b.z - a.z}, v{c.x - a.x, c.y - a.y, c.z - a.z};
            out.geometricNormal = {u.y * v.z - u.z * v.y, u.z * v.x - u.x * v.z,
                                   u.x * v.y - u.y * v.x};
            const double length = std::hypot(
                out.geometricNormal.x, std::hypot(out.geometricNormal.y, out.geometricNormal.z));
            if (length > 0)
                out.geometricNormal = {out.geometricNormal.x / length,
                                       out.geometricNormal.y / length,
                                       out.geometricNormal.z / length};
            triangles->push_back(out);
        }
        store.append(std::move(triangles));
        return 1;
    });
}
int nx_submit(nx_handle d, nx_handle s, int w, int h, int quality, nx_frame* frame) {
    if (frame)
        *frame = {};
    return call([&] {
        if (!frame)
            throw std::invalid_argument("missing output frame");
        auto& dev = device(d);
        auto& store = sceneOf(dev, s);
        if (store.staging())
            throw std::logic_error("commit or abort transaction before submission");
        dev.renderer.setExternalReservation(ownedBytes(dev));
        dev.renderer.setQuality(render::Quality(quality));
        const auto& pixels = dev.renderer.render(store.prepared(), {w, h});
        const auto& stats = dev.renderer.statistics();
        dev.shadowHits += stats.shadowCacheHit;
        dev.shadowMisses += stats.shadowCacheMiss;
        dev.shadowBypasses += stats.shadowCacheBypass;
        *frame = {pixels.data(), w, h, pixels.stride(), dev.renderer.receipt().serial};
        return 1;
    });
}
int nx_get_statistics(nx_handle d, nx_handle s, nx_statistics* result) {
    return call([&] {
        if (!result || result->struct_size != sizeof(nx_statistics) ||
            (result->abi_version && result->abi_version != 2))
            throw std::invalid_argument("incompatible statistics size/version");
        auto& dev = device(d);
        auto& store = sceneOf(dev, s);
        const auto& r = store.statistics();
        const auto& f = dev.renderer.statistics();
        *result = {sizeof(nx_statistics),
                   2,
                   store.revision(),
                   r.meshUploads,
                   r.uploadedBytes,
                   r.copiedBytes,
                   r.validatedVertices,
                   r.transformedVertices,
                   r.committedTransactions,
                   r.abortedTransactions,
                   store.residentBytes() + f.residentBytes,
                   store.stagingBytes(),
                   f.allocations,
                   dev.shadowHits,
                   dev.shadowMisses,
                   dev.shadowBypasses,
                   f.shadowCacheBytes,
                   f.fragmentCapacity};
        return 1;
    });
}
}
