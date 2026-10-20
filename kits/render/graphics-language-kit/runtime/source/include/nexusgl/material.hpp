#pragma once
#include "types.hpp"
#include <vector>

namespace nexusgl {
// Data contracts. Texture bytes are owned, tightly packed RGBA; UVs repeat.
// Color textures are sRGB. Normal textures contain linear tangent-space XYZ.
enum class TextureFilter { Nearest, Bilinear, Trilinear };
struct TextureLevel {
    int width = 0, height = 0;
    std::vector<Color> pixels;
};
struct Texture2D {
    int width = 0, height = 0;
    std::vector<Color> pixels;
    TextureFilter filter = TextureFilter::Nearest;
    std::vector<TextureLevel> mips{};
};
enum class AlphaMode { Opaque, Mask, Blend };
enum class Shading { Reference, Toon, PBR, Unlit };
struct Material {
    Shading shading = Shading::Reference;
    LinearRGB tint{1, 1, 1};
    float roughness = .5f, metallic = 0;
    int colorTexture = -1, normalTexture = -1;
    float normalStrength = 1;
    int bands = 3;
    float bandSoftness = 0, highlight = .25f, rim = .15f;
    LinearRGB shadowColor{.16f, .22f, .32f};
    int outlinePixels = 0;
    LinearRGB outlineColor{.015f, .02f, .03f};
    AlphaMode alphaMode = AlphaMode::Opaque;
    float opacity = 1, alphaCutoff = .5f;
};
struct LightParameters {
    struct RGB {
        double r, g, b;
    };
    RGB color{1, .88, .72};
    double intensity = 2.2, fill = .35, sky = .08, skyGradient = .12;
    double specular = .65, specularPower = 56;
};
struct DisplaySettings {
    float exposure = 1.25f;
    int sampleScale = 1;
};
} // namespace nexusgl
