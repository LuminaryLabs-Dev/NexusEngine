#pragma once
#include <array>

namespace nexusgl {
struct Vec3 {
    double x, y, z;
};
struct Vec4 {
    double x, y, z, w;
};
struct Mat4 {
    std::array<double, 16> values{}; // Row-major, column vectors.
    static Mat4 identity() noexcept;
    static Mat4 translation(double x, double y, double z) noexcept;
    static Mat4 rotationX(double radians) noexcept;
    static Mat4 rotationY(double radians) noexcept;
    // Right-handed camera looking down -Z; normalized depth is 0..1.
    static Mat4 perspective(double verticalFov, double aspect, double nearPlane, double farPlane);
};
Mat4 operator*(const Mat4& a, const Mat4& b) noexcept;
Vec4 operator*(const Mat4& m, Vec4 v) noexcept;
} // namespace nexusgl
