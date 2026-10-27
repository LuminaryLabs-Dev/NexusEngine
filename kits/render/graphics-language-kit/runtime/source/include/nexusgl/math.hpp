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
// Checked affine transforms use row-major matrices and column vectors. External
// column-major arrays must be converted exactly once by their adapter.
struct AffineTransform {
    Mat4 model;
    std::array<double, 9> normal;
    double handedness = 1;
};
AffineTransform checkedAffine(const Mat4& model);
Vec3 transformPosition(const AffineTransform&, Vec3);
Vec3 transformNormal(const AffineTransform&, Vec3);
Vec3 transformTangent(const AffineTransform&, Vec3);
std::array<Vec3, 2> transformBounds(const AffineTransform&, Vec3 minimum, Vec3 maximum);
} // namespace nexusgl
