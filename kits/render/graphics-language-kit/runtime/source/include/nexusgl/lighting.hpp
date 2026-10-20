#pragma once
#include "renderer.hpp"

namespace nexusgl {
struct Vec3;
struct Mat4;
class RenderTarget3D;
float srgbToLinear(std::uint8_t channel) noexcept;
Color displayColor(LinearRGB color) noexcept;
Color displayColor(LinearRGB color, float exposure) noexcept; // Reinhard + sRGB, opaque.
} // namespace nexusgl
