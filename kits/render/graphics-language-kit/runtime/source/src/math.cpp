#include "nexusgl/math.hpp"
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
} // namespace nexusgl
