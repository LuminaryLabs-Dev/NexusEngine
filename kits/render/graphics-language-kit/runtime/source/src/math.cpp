#include "nexusgl/math.hpp"
#include <algorithm>
#include <cmath>
#include <stdexcept>

namespace nexusgl {
Mat4 Mat4::identity() noexcept {
    Mat4 m;
    for (int i = 0; i < 4; ++i)
        m.values[i * 4 + i] = 1;
    return m;
}
Mat4 Mat4::translation(double x, double y, double z) noexcept {
    auto m = identity();
    m.values[3] = x;
    m.values[7] = y;
    m.values[11] = z;
    return m;
}
Mat4 Mat4::rotationX(double a) noexcept {
    auto m = identity();
    const auto c = std::cos(a), s = std::sin(a);
    m.values[5] = c;
    m.values[6] = -s;
    m.values[9] = s;
    m.values[10] = c;
    return m;
}
Mat4 Mat4::rotationY(double a) noexcept {
    auto m = identity();
    const auto c = std::cos(a), s = std::sin(a);
    m.values[0] = c;
    m.values[2] = s;
    m.values[8] = -s;
    m.values[10] = c;
    return m;
}
Mat4 Mat4::perspective(double fov, double aspect, double nearPlane, double farPlane) {
    constexpr double pi = 3.14159265358979323846;
    if (!std::isfinite(fov) || !std::isfinite(aspect) || !std::isfinite(nearPlane) ||
        !std::isfinite(farPlane) || fov <= 0 || fov >= pi || aspect <= 0 || nearPlane <= 0 ||
        farPlane <= nearPlane)
        throw std::invalid_argument("invalid perspective parameters");
    const double focal = 1 / std::tan(fov / 2);
    Mat4 m;
    m.values[0] = focal / aspect;
    m.values[5] = focal;
    m.values[10] = farPlane / (nearPlane - farPlane);
    m.values[11] = nearPlane * m.values[10];
    m.values[14] = -1;
    for (double value : m.values)
        if (!std::isfinite(value))
            throw std::invalid_argument("perspective matrix overflow");
    return m;
}
Mat4 operator*(const Mat4& a, const Mat4& b) noexcept {
    Mat4 result;
    for (int row = 0; row < 4; ++row)
        for (int col = 0; col < 4; ++col)
            for (int k = 0; k < 4; ++k)
                result.values[row * 4 + col] += a.values[row * 4 + k] * b.values[k * 4 + col];
    return result;
}
Vec4 operator*(const Mat4& m, Vec4 v) noexcept {
    const auto& a = m.values;
    return {a[0] * v.x + a[1] * v.y + a[2] * v.z + a[3] * v.w,
            a[4] * v.x + a[5] * v.y + a[6] * v.z + a[7] * v.w,
            a[8] * v.x + a[9] * v.y + a[10] * v.z + a[11] * v.w,
            a[12] * v.x + a[13] * v.y + a[14] * v.z + a[15] * v.w};
}
namespace {
void checkVector(Vec3 v) {
    for (double x : {v.x, v.y, v.z})
        if (!std::isfinite(x) || std::abs(x) > 1e9)
            throw std::invalid_argument("transformed vector outside finite bounds");
}
} // namespace
AffineTransform checkedAffine(const Mat4& model) {
    const auto& m = model.values;
    for (double x : m)
        if (!std::isfinite(x) || std::abs(x) > 1e9)
            throw std::invalid_argument("model matrix outside finite bounds");
    if (m[12] != 0 || m[13] != 0 || m[14] != 0 || m[15] != 1)
        throw std::invalid_argument("model transform must be affine");
    const double det = m[0] * (m[5] * m[10] - m[6] * m[9]) - m[1] * (m[4] * m[10] - m[6] * m[8]) +
                       m[2] * (m[4] * m[9] - m[5] * m[8]);
    if (!std::isfinite(det) || std::abs(det) < 1e-12)
        throw std::invalid_argument("model transform must be nonsingular");
    AffineTransform result{model, {}, det < 0 ? -1.0 : 1.0};
    result.normal = {(m[5] * m[10] - m[6] * m[9]) / det, (m[6] * m[8] - m[4] * m[10]) / det,
                     (m[4] * m[9] - m[5] * m[8]) / det,  (m[2] * m[9] - m[1] * m[10]) / det,
                     (m[0] * m[10] - m[2] * m[8]) / det, (m[1] * m[8] - m[0] * m[9]) / det,
                     (m[1] * m[6] - m[2] * m[5]) / det,  (m[2] * m[4] - m[0] * m[6]) / det,
                     (m[0] * m[5] - m[1] * m[4]) / det};
    for (double x : result.normal)
        if (!std::isfinite(x))
            throw std::invalid_argument("normal transform overflow");
    return result;
}
Vec3 transformPosition(const AffineTransform& a, Vec3 v) {
    const auto p = a.model * Vec4{v.x, v.y, v.z, 1};
    Vec3 out{p.x, p.y, p.z};
    checkVector(out);
    return out;
}
Vec3 transformNormal(const AffineTransform& a, Vec3 v) {
    const auto& n = a.normal;
    Vec3 p{n[0] * v.x + n[1] * v.y + n[2] * v.z, n[3] * v.x + n[4] * v.y + n[5] * v.z,
           n[6] * v.x + n[7] * v.y + n[8] * v.z};
    const double length = std::hypot(p.x, std::hypot(p.y, p.z));
    if (!std::isfinite(length) || length < 1e-24)
        throw std::invalid_argument("invalid transformed normal");
    checkVector(p);
    return p; // Preserve interpolation weights; rasterization normalizes per
              // sample.
}
Vec3 transformTangent(const AffineTransform& a, Vec3 v) {
    const auto p = a.model * Vec4{v.x, v.y, v.z, 0};
    Vec3 out{p.x, p.y, p.z};
    checkVector(out);
    return out;
}
std::array<Vec3, 2> transformBounds(const AffineTransform& a, Vec3 lo, Vec3 hi) {
    checkVector(lo);
    checkVector(hi);
    if (lo.x > hi.x || lo.y > hi.y || lo.z > hi.z)
        throw std::invalid_argument("invalid bounds");
    std::array<Vec3, 2> result{{{1e9, 1e9, 1e9}, {-1e9, -1e9, -1e9}}};
    for (int i = 0; i < 8; ++i) {
        const auto p =
            transformPosition(a, {i & 1 ? hi.x : lo.x, i & 2 ? hi.y : lo.y, i & 4 ? hi.z : lo.z});
        result[0].x = std::min(result[0].x, p.x);
        result[0].y = std::min(result[0].y, p.y);
        result[0].z = std::min(result[0].z, p.z);
        result[1].x = std::max(result[1].x, p.x);
        result[1].y = std::max(result[1].y, p.y);
        result[1].z = std::max(result[1].z, p.z);
    }
    return result;
}
} // namespace nexusgl
