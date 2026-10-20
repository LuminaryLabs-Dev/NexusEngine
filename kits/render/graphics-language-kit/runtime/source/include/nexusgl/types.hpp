#pragma once
#include <cstdint>

namespace nexusgl {
struct Color {
    std::uint8_t r, g, b, a = 255;
};
struct Point {
    double x, y;
};
struct LinearRGB {
    float r = 0, g = 0, b = 0;
};
} // namespace nexusgl
