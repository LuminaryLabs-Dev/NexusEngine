#include "nexusgl/c_api.h"
#include <atomic>
#include <cassert>
#include <cmath>
#include <cstdlib>
#include <cstring>
#include <iostream>
#include <new>
#include <vector>
static std::atomic<bool> failAllocation{false};
void* operator new(std::size_t size) {
    if (failAllocation.exchange(false))
        throw std::bad_alloc();
    if (void* p = std::malloc(size ? size : 1))
        return p;
    throw std::bad_alloc();
}
void operator delete(void* p) noexcept {
    std::free(p);
}
void operator delete(void* p, std::size_t) noexcept {
    std::free(p);
}
static nx_triangle triangle() {
    nx_triangle t{};
    const double points[3][3] = {{-.7, -.7, .5}, {.7, -.7, .5}, {0, .7, .5}};
    for (int i = 0; i < 3; ++i) {
        std::copy_n(points[i], 3, t.vertices[i].position);
        t.vertices[i].normal[2] = 1;
        t.vertices[i].tangent[0] = 1;
        t.vertices[i].handedness = 1;
    }
    t.color[0] = 230;
    t.color[1] = 100;
    t.color[2] = 30;
    t.color[3] = 255;
    t.casts_shadow = 1;
    t.two_sided_shadow = 1;
    return t;
}
static std::vector<unsigned char> render(nx_handle d, nx_handle s) {
    nx_frame f{};
    assert(nx_submit(d, s, 32, 32, 1, &f));
    return {f.rgba, f.rgba + f.stride * f.height};
}
int main() {
    assert(nx_get_abi_version() == 2);
    assert(nx_get_capabilities().abi_version == 1);
    const auto d = nx_device_create(), s = nx_scene_create(d);
    assert(d && s);
    auto view = nx_default_view();
    view.shadow_resolution = 16;
    assert(nx_scene_set_view(d, s, &view));
    auto t = triangle();
    assert(nx_draw_triangles(d, s, &t, 1));
    const auto baseline = render(d, s);
    for (size_t count : {63, 64, 65, 127, 128, 129}) {
        const auto before = nx_scene_revision(d, s);
        assert(nx_scene_begin(d, s, before));
        assert(nx_scene_clear_geometry(d, s));
        std::vector<nx_triangle> triangles(count, triangle());
        size_t cursor = 0;
        while (cursor < triangles.size()) {
            const auto n = std::min(size_t(64), triangles.size() - cursor);
            assert(nx_draw_triangles(d, s, triangles.data() + cursor, n));
            cursor += n;
        }
        auto invalid = triangle();
        invalid.vertices[2].position[0] = NAN;
        assert(!nx_draw_triangles(d, s, &invalid, 1));
        assert(!nx_scene_commit(d, s));
        assert(nx_scene_revision(d, s) == before);
        assert(nx_scene_abort(d, s));
        assert(render(d, s) == baseline);
        assert(nx_scene_begin(d, s, before));
        assert(nx_scene_clear_geometry(d, s));
        assert(nx_draw_triangles(d, s, triangles.data(), triangles.size()));
        assert(nx_scene_commit(d, s));
        assert(nx_scene_revision(d, s) == before + 1);
        assert(render(d, s) == baseline);
    }
    const auto revision = nx_scene_revision(d, s);
    assert(!nx_scene_begin(d, s, revision - 1));
    assert(!nx_scene_commit(d, s));
    assert(!nx_scene_abort(d, s));
    assert(nx_scene_begin(d, s, revision));
    auto m = nx_default_material();
    const auto handle = nx_material_create(d, s, &m);
    assert(handle);
    assert(nx_scene_abort(d, s));
    assert(!nx_material_update(d, s, handle, &m));
    assert(nx_scene_revision(d, s) == revision);
    assert(nx_scene_begin(d, s, revision));
    nx_triangle bad = triangle();
    bad.material = 999999;
    assert(!nx_draw_triangles(d, s, &bad, 1));
    assert(!nx_scene_commit(d, s));
    assert(nx_scene_abort(d, s));
    assert(nx_scene_begin(d, s, revision));
    assert(!nx_mesh_create(d, s, nullptr, SIZE_MAX, nullptr, 0));
    assert(!nx_scene_commit(d, s));
    assert(nx_scene_abort(d, s));
    assert(render(d, s) == baseline);
    assert(nx_scene_begin(d, s, revision));
    failAllocation = true;
    assert(!nx_scene_commit(d, s));
    assert(nx_scene_revision(d, s) == revision);
    assert(nx_scene_abort(d, s));
    assert(render(d, s) == baseline);
    assert(nx_scene_begin(d, s, revision));
    const nx_handle dummy = 1;
    assert(!nx_instance_order(d, s, &dummy, SIZE_MAX));
    assert(!nx_scene_commit(d, s));
    assert(nx_scene_abort(d, s));
    nx_statistics stats{};
    assert(!nx_get_statistics(d, s, &stats));
    stats.struct_size = sizeof(stats);
    assert(nx_get_statistics(d, s, &stats));
    assert(stats.abi_version == 2 && stats.staging_bytes == 0);
    assert(nx_device_destroy(d));
    std::cout << "transactions PASS\n";
}
