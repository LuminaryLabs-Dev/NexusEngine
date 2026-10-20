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
struct Scene {
    scene::SceneDSK owner;
    std::map<nx_handle, int> textures, materials;
};
struct Device {
    Renderer renderer;
    std::map<nx_handle, std::unique_ptr<Scene>> scenes;
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
    auto i = devices.find(id);
    if (i == devices.end())
        throw std::invalid_argument("invalid or destroyed device");
    return *i->second;
}
Scene& sceneOf(Device& d, nx_handle id) {
    auto i = d.scenes.find(id);
    if (i == d.scenes.end())
        throw std::invalid_argument("invalid, foreign or destroyed scene");
    return *i->second;
}
std::uint64_t ownedBytes(const Device& device) {
    std::uint64_t result = 512 * device.scenes.size();
    for (const auto& entry : device.scenes) {
        const auto& f = std::get<scene::SceneFrame>(entry.second->owner.frame());
        result += f.triangles.size() * sizeof(scene::SurfaceTriangle) +
                  f.materials.capacity() * sizeof(Material) +
                  f.textures.capacity() * sizeof(Texture2D) +
                  (entry.second->textures.size() + entry.second->materials.size()) * 128;
        for (const auto& t : f.textures) {
            result +=
                t.pixels.capacity() * sizeof(Color) + t.mips.capacity() * sizeof(TextureLevel);
            for (const auto& m : t.mips)
                result += m.pixels.capacity() * sizeof(Color);
        }
    }
    return result;
}
int resource(const std::map<nx_handle, int>& entries, nx_handle id) {
    if (!id)
        return -1;
    auto i = entries.find(id);
    if (i == entries.end())
        throw std::invalid_argument("invalid or foreign scene resource");
    return i->second;
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
template <class F> void mutate(Scene& s, F action) {
    auto frame = std::get<scene::SceneFrame>(s.owner.frame());
    action(frame);
    s.owner.prepare(std::move(frame));
}
Vec3 vec(const double* v) {
    return {v[0], v[1], v[2]};
}
} // namespace
extern "C" {
const char* nx_last_error(void) {
    return error;
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
        if (fragments > RenderTarget3D::maxTransparentFragments)
            throw std::invalid_argument("fragment limit too large");
        auto& d = device(id);
        if (ownedBytes(d) * 2 > bytes)
            throw std::runtime_error("owned scenes exceed requested budget");
        d.renderer.setResourceLimits({bytes, std::size_t(fragments)});
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
        auto s = std::make_unique<Scene>();
        s->owner.prepare(scene::SceneFrame{});
        const auto key = identity();
        d.scenes.emplace(key, std::move(s));
        return key;
    });
}
int nx_scene_destroy(nx_handle id, nx_handle scene) {
    return call([&] {
        auto& d = device(id);
        sceneOf(d, scene);
        d.scenes.erase(scene);
        return 1;
    });
}
int nx_scene_set_background(nx_handle id, nx_handle scene, uint8_t r, uint8_t g, uint8_t b,
                            uint8_t a) {
    return call([&] {
        auto& s = sceneOf(device(id), scene);
        mutate(s, [&](auto& f) { f.background = {r, g, b, a}; });
        return 1;
    });
}
int nx_scene_set_light(nx_handle id, nx_handle scene, const nx_light* light) {
    return call([&] {
        if (!light)
            throw std::invalid_argument("missing light");
        auto& s = sceneOf(device(id), scene);
        mutate(s, [&](auto& f) {
            f.light.color = {light->color[0], light->color[1], light->color[2]};
            f.light.intensity = light->intensity;
            f.light.fill = light->fill;
            f.light.sky = light->sky;
            f.light.skyGradient = light->sky_gradient;
            f.light.specular = light->specular;
            f.light.specularPower = light->specular_power;
        });
        return 1;
    });
}
int nx_scene_set_view(nx_handle id, nx_handle scene, const nx_view* view) {
    return call([&] {
        if (!view)
            throw std::invalid_argument("missing view");
        auto& s = sceneOf(device(id), scene);
        mutate(s, [&](auto& f) {
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
        });
        return 1;
    });
}
int nx_scene_clear_geometry(nx_handle id, nx_handle scene) {
    return call([&] {
        auto& s = sceneOf(device(id), scene);
        mutate(s, [](auto& f) { f.triangles.clear(); });
        return 1;
    });
}
nx_handle nx_texture_create(nx_handle id, nx_handle scene, int width, int height,
                            const uint8_t* rgba, size_t stride, int filter, int normal_map) {
    return call([&] {
        auto& d = device(id);
        auto& s = sceneOf(d, scene);
        if (s.textures.size() >= 4096)
            throw std::runtime_error("scene texture limit reached");
        if (!rgba || width < 1 || height < 1 || width > 8192 || height > 8192 ||
            uint64_t(width) * height > Framebuffer::maxPixels || stride < size_t(width) * 4 ||
            stride > SIZE_MAX / size_t(height) || filter < 0 || filter > 2)
            throw std::invalid_argument("invalid texture upload");
        if (ownedBytes(d) * 2 + uint64_t(width) * height * 16 >
            d.renderer.resourceLimits().budgetBytes)
            throw std::runtime_error("texture upload exceeds device budget");
        Texture2D texture;
        texture.width = width;
        texture.height = height;
        texture.filter = TextureFilter(filter);
        texture.pixels.resize(size_t(width) * height);
        for (int y = 0; y < height; ++y)
            for (int x = 0; x < width; ++x) {
                const auto* p = rgba + size_t(y) * stride + size_t(x) * 4;
                texture.pixels[size_t(y) * width + x] = {p[0], p[1], p[2], p[3]};
            }
        if (filter == 2)
            generateMipmaps(texture, normal_map == 0);
        const int index = int(std::get<scene::SceneFrame>(s.owner.frame()).textures.size());
        const auto key = identity();
        s.textures.emplace(key, index);
        try {
            mutate(s, [&](auto& f) { f.textures.push_back(std::move(texture)); });
        } catch (...) {
            s.textures.erase(key);
            throw;
        }
        return key;
    });
}
nx_handle nx_material_create(nx_handle id, nx_handle scene, const nx_material* input) {
    return call([&] {
        if (!input)
            throw std::invalid_argument("missing material");
        auto& d = device(id);
        auto& s = sceneOf(d, scene);
        if (ownedBytes(d) * 2 + sizeof(Material) * 4 > d.renderer.resourceLimits().budgetBytes)
            throw std::runtime_error("material upload exceeds device budget");
        if (s.materials.size() >= 4096)
            throw std::runtime_error("scene material limit reached");
        Material m;
        m.shading = Shading(input->shading);
        m.alphaMode = AlphaMode(input->alpha_mode);
        m.tint = {input->tint[0], input->tint[1], input->tint[2]};
        m.roughness = input->roughness;
        m.metallic = input->metallic;
        m.opacity = input->opacity;
        m.alphaCutoff = input->alpha_cutoff;
        m.normalStrength = input->normal_strength;
        m.colorTexture = resource(s.textures, input->color_texture);
        m.normalTexture = resource(s.textures, input->normal_texture);
        m.bands = input->bands;
        m.outlinePixels = input->outline_pixels;
        m.bandSoftness = input->softness;
        m.highlight = input->highlight;
        m.rim = input->rim;
        m.shadowColor = {input->shadow_color[0], input->shadow_color[1], input->shadow_color[2]};
        m.outlineColor = {input->outline_color[0], input->outline_color[1],
                          input->outline_color[2]};
        const int index = int(std::get<scene::SceneFrame>(s.owner.frame()).materials.size());
        const auto key = identity();
        s.materials.emplace(key, index);
        try {
            mutate(s, [&](auto& f) { f.materials.push_back(m); });
        } catch (...) {
            s.materials.erase(key);
            throw;
        }
        return key;
    });
}
int nx_draw_triangles(nx_handle id, nx_handle scene, const nx_triangle* input, size_t count) {
    return call([&] {
        auto& d = device(id);
        auto& s = sceneOf(d, scene);
        if (!input && count)
            throw std::invalid_argument("missing triangles");
        const auto& current = std::get<scene::SceneFrame>(s.owner.frame());
        const auto maximum =
            d.renderer.resourceLimits().budgetBytes / (sizeof(scene::SurfaceTriangle) * 4);
        if (count > maximum || current.triangles.size() > maximum - count ||
            ownedBytes(d) * 2 + count * sizeof(scene::SurfaceTriangle) * 4 >
                d.renderer.resourceLimits().budgetBytes)
            throw std::runtime_error("geometry upload exceeds device budget");
        mutate(s, [&](auto& f) {
            for (size_t i = 0; i < count; ++i) {
                const auto& t = input[i];
                scene::SurfaceTriangle out;
                for (int k = 0; k < 3; ++k) {
                    const auto& v = t.vertices[k];
                    out.vertices[k] = {vec(v.position),
                                       vec(v.normal),
                                       {v.uv[0], v.uv[1]},
                                       vec(v.tangent),
                                       v.handedness};
                }
                out.albedo = {t.color[0], t.color[1], t.color[2], t.color[3]};
                out.material = resource(s.materials, t.material);
                out.castsShadow = t.casts_shadow != 0;
                out.twoSidedShadow = t.two_sided_shadow != 0;
                const auto& a = out.vertices[0].position;
                const auto& b = out.vertices[1].position;
                const auto& c = out.vertices[2].position;
                const Vec3 u{b.x - a.x, b.y - a.y, b.z - a.z}, v{c.x - a.x, c.y - a.y, c.z - a.z};
                out.geometricNormal = {u.y * v.z - u.z * v.y, u.z * v.x - u.x * v.z,
                                       u.x * v.y - u.y * v.x};
                const double length =
                    std::hypot(out.geometricNormal.x,
                               std::hypot(out.geometricNormal.y, out.geometricNormal.z));
                if (length > 0)
                    out.geometricNormal = {out.geometricNormal.x / length,
                                           out.geometricNormal.y / length,
                                           out.geometricNormal.z / length};
                f.triangles.push_back(out);
            }
        });
        return 1;
    });
}
int nx_submit(nx_handle id, nx_handle scene, int width, int height, int quality, nx_frame* frame) {
    if (frame)
        *frame = {};
    return call([&] {
        if (!frame)
            throw std::invalid_argument("missing output frame");
        auto& d = device(id);
        auto& s = sceneOf(d, scene);
        d.renderer.setExternalReservation(ownedBytes(d));
        d.renderer.setQuality(render::Quality(quality));
        const auto& pixels = d.renderer.render(s.owner.frame(), {width, height});
        *frame = {pixels.data(), width, height, pixels.stride(), d.renderer.receipt().serial};
        return 1;
    });
}
}
