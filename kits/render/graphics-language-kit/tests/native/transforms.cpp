#include "nexusgl/math.hpp"
#include <cassert>
#include <cmath>
#include <iostream>
#include <limits>
using namespace nexusgl;
static bool near(double a, double b) { return std::abs(a - b) < 1e-12; }
int main() {
  auto m = Mat4::translation(5, 6, 7) * Mat4::rotationY(.4);
  m.values[0] *= 2;
  m.values[4] *= 2;
  m.values[8] *= 2;
  m.values[1] *= 3;
  m.values[5] *= 3;
  m.values[9] *= 3;
  auto a = checkedAffine(m);
  const auto p = transformPosition(a, {1, 0, 0});
  assert(near(p.x, 5 + 2 * std::cos(.4)) && near(p.y, 6) &&
         near(p.z, 7 - 2 * std::sin(.4)));
  auto scale = Mat4::identity();
  scale.values[0] = 2;
  scale.values[5] = 3;
  scale.values[10] = 4;
  auto n = transformNormal(checkedAffine(scale), {1, 1, 0});
  assert(near(n.x, .5) && near(n.y, 1.0 / 3));
  scale.values[0] = -2;
  const auto mirrored = checkedAffine(scale);
  assert(mirrored.handedness == -1);
  auto tangent = transformTangent(mirrored, {1, 0, 0});
  assert(tangent.x == -2 && tangent.y == 0);
  const auto bounds = transformBounds(mirrored, {-1, -2, -3}, {2, 3, 4});
  assert(bounds[0].x == -4 && bounds[1].x == 2 && bounds[0].y == -6 &&
         bounds[1].z == 16);
  for (int kind = 0; kind < 3; ++kind) {
    auto invalid = Mat4::identity();
    if (kind == 0)
      invalid.values[0] = 0;
    else if (kind == 1)
      invalid.values[2] = NAN;
    else
      invalid.values[12] = 1;
    bool rejected = false;
    try {
      checkedAffine(invalid);
    } catch (...) {
      rejected = true;
    }
    assert(rejected);
  }
  std::cout << "transforms PASS\n";
}
