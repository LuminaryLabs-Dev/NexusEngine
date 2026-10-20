#pragma once
#include "lighting.hpp"
#include "material.hpp"
#include "math.hpp"
#include "renderer.hpp"
#include <array>

namespace nexusgl {
class RenderTarget3D;
struct LightingSettings {
    Vec3 camera{0, 0, 5};
    Vec3 directionToLight{-0.5, 1, 0.8};
    const RenderTarget3D* shadowMap = nullptr; // Borrowed through triangle submission.
    Mat4 worldToShadow = Mat4::identity();
    LightParameters parameters;
    const std::vector<Texture2D>* textures = nullptr;
    double shadowBias = .0005, receiverPlaneClamp = .03;
    int shadowFilterRadius = 1;
    bool prepared = false;
    Vec3 normalizedLight{}, shadowCofactorX{}, shadowCofactorY{}, shadowCofactorZ{};
};
struct ClipVertex {
    Vec4 position;
    Color color;
    Vec3 worldPosition{};
    Vec3 normal{0, 0, 1};
    Point uv{0, 0};
    Vec3 tangent{1, 0, 0};
    double handedness = 1;
};
LinearRGB illuminate(LinearRGB albedo, Vec3 world, Vec3 normal,
                     const LightingSettings& settings) noexcept;

struct SurfaceSample {
    float world[3]{}, normal[3]{};
    LinearRGB base{};
    int material = -1;
    std::uint32_t key = 0;
    bool covered = false;
};
float shadowVisibility(Vec3 world, Vec3 normal, const LightingSettings& settings) noexcept;
LinearRGB shadeMaterial(LinearRGB base, Vec3 world, Vec3 normal, const Material& material,
                        const LightingSettings& settings, float visibility = -1) noexcept;
float sampleTextureAlpha(const Texture2D& texture, Point uv, float lod = 0) noexcept;
void generateMipmaps(Texture2D& texture, bool srgb = true);
LinearRGB sampleTexture(const Texture2D& texture, Point uv, bool srgb, float lod = 0) noexcept;
Vec3 textureNormal(Vec3 normal, Vec3 tangent, double handedness, LinearRGB sample,
                   float strength) noexcept;
// CPU color/depth target. Explicit clear, homogeneous clip, perspective divide,
// top-left triangle coverage, perspective-correct RGBA and strict LESS depth.
class RenderTarget3D {
  public:
    RenderTarget3D(int width, int height, bool depthOnly = false);
    int width() const noexcept { return width_; }
    int height() const noexcept { return height_; }
    std::size_t allocatedBytes() const noexcept;
    void setFragmentLimit(std::size_t count);
    void resize(int width, int height); // Strong exception guarantee.
    void clear(Color color) noexcept;
    void setLighting(const LightingSettings& settings);
    bool lightingEnabled() const noexcept { return !radiance_.empty(); }
    const std::vector<LinearRGB>& radiance() const;
    static constexpr std::size_t maxTransparentFragments = 8 * 1024 * 1024;
    static constexpr int maxTransparentLayers = 64;
    void prepareTransparency(bool enabled);
    void resolveTransparency(); // Reports allocation/layer limits; never drops fragments silently.
    void setTextureSource(const std::vector<Texture2D>* textures) noexcept {
        lighting_.textures = textures;
    }
    const std::vector<float>& alpha() const noexcept { return alpha_; }
    void triangle(ClipVertex a, ClipVertex b, ClipVertex c) noexcept;
    void setMaterial(const Material* material, int index = -1, std::uint32_t key = 0) noexcept {
        material_ = material;
        materialIndex_ = index;
        surfaceKey_ = key;
    }
    void captureSurfaces(bool enabled, bool deferred = false);
    const std::vector<SurfaceSample>& surfaces() const noexcept { return surfaces_; }
    // Lit submissions write radiance(); color() is the unlit attachment.
    const Framebuffer& color() const noexcept { return color_; }
    float depth(int x, int y) const;

  private:
    friend class render::CpuFrameKit;
    struct Fragment {
        LinearRGB color;
        float alpha, depth;
        std::uint32_t next;
    };
    std::vector<Fragment> fragments_;
    std::vector<std::uint32_t> heads_;
    std::vector<std::uint8_t> layers_;
    enum class TransparencyError { None, Lifecycle, Budget, Allocation };
    enum class TransparencyPhase { Disabled, Prepared, Drawing, Resolved };
    TransparencyError transparencyError_ = TransparencyError::None;
    TransparencyPhase transparencyPhase_ = TransparencyPhase::Disabled;
    struct Vertex {
        Vec4 p;
        std::array<double, 4> color;
        Vec3 world;
        Vec3 normal;
        Point uv;
        Vec3 tangent;
        double handedness;
    };
    void rasterize(Vertex a, Vertex b, Vertex c) noexcept;
    int width_, height_;
    bool depthOnly_;
    std::size_t fragmentLimit_ = maxTransparentFragments;
    Framebuffer color_;
    std::vector<float> depth_, alpha_;
    std::vector<LinearRGB> radiance_;
    LightingSettings lighting_;
    const Material* material_ = nullptr; // Borrowed for a triangle submission only.
    int materialIndex_ = -1;
    std::uint32_t surfaceKey_ = 0;
    bool deferred_ = false;
    std::vector<SurfaceSample> surfaces_;
};
} // namespace nexusgl
