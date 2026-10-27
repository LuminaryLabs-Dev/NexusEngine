#pragma once
#include "nexusgl/material.hpp"
#include "nexusgl/math.hpp"
#include "nexusgl/types.hpp"
#include <array>
#include <variant>
#include <vector>

namespace nexusgl::scene {
struct Triangle2D {
    std::array<Point, 3> vertices{};
    Color color{255, 255, 255};
};
struct Rectangle2D {
    double x = 0, y = 0, width = 0, height = 0;
    Color color{255, 255, 255};
};
struct Circle2D {
    Point center{};
    double radius = 0;
    Color color{255, 255, 255};
};
using Draw2D = std::variant<Triangle2D, Rectangle2D, Circle2D>;
struct CanvasFrame {
    Color background{22, 27, 36};
    std::vector<Draw2D> draws;
};
struct SurfaceVertex {
    Vec3 position{};
    Vec3 normal{0, 0, 1};
    Point uv{0, 0};
    Vec3 tangent{1, 0, 0};
    double handedness = 1;
};
struct SurfaceTriangle {
    std::array<SurfaceVertex, 3> vertices{};
    Vec3 geometricNormal{0, 0, 1};
    Color albedo{255, 255, 255};
    bool castsShadow = true;
    int material = -1;           // -1 selects the reference material.
    bool twoSidedShadow = false; // Open sheets opt in without changing closed meshes.
};
struct ShadowDescriptor {
    Mat4 viewProjection = Mat4::identity();
    Vec3 directionToLight{-5, 8, 6};
    int resolution = 1024;
    bool closedBackFacesOnly = true;
    double bias = .0005, receiverPlaneClamp = .03;
    int filterRadius = 1;
};
struct SceneFrame {
    Color background{22, 27, 36};
    Mat4 viewProjection = Mat4::identity();
    Vec3 cameraPosition{0, 0, 5};
    ShadowDescriptor shadow;
    std::vector<SurfaceTriangle> triangles;
    // Owner-produced immutable instance batches; legacy triangles retain their
    // ordering.
    std::vector<std::shared_ptr<const std::vector<SurfaceTriangle>>> batches;
    std::vector<std::shared_ptr<const Texture2D>> residentTextures;
    std::vector<Material> materials;
    std::vector<Texture2D> textures;
    LightParameters light;
    DisplaySettings display;
};
inline TextureTableView texturesOf(const SceneFrame& frame) noexcept {
    TextureTableView view(&frame.textures);
    if (!frame.residentTextures.empty())
        view.resident = &frame.residentTextures;
    return view;
}
template <class F> void eachTriangle(const SceneFrame& frame, F action) {
    for (const auto& triangle : frame.triangles)
        action(triangle);
    for (const auto& batch : frame.batches)
        for (const auto& triangle : *batch)
            action(triangle);
}
inline std::size_t triangleCount(const SceneFrame& frame) noexcept {
    std::size_t count = frame.triangles.size();
    for (const auto& batch : frame.batches)
        count += batch->size();
    return count;
}
using Descriptor = std::variant<CanvasFrame, SceneFrame>;
// Shared descriptor contract; no raster targets, host types, IO or timers.
void validate(const Descriptor& descriptor);
void validateVertex(const SurfaceVertex&);
void validateTriangles(const std::vector<SurfaceTriangle>&, std::size_t materialCount);
} // namespace nexusgl::scene
