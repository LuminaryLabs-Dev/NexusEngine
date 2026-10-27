#pragma once
#include <cstdint>
#include <limits>
#include <stdexcept>
namespace nexusgl {
inline std::uint64_t checkedAdd(std::uint64_t a, std::uint64_t b) {
    if (b > std::numeric_limits<std::uint64_t>::max() - a)
        throw std::runtime_error("resource byte count overflow");
    return a + b;
}
inline std::uint64_t checkedMultiply(std::uint64_t a, std::uint64_t b) {
    if (a && b > std::numeric_limits<std::uint64_t>::max() / a)
        throw std::runtime_error("resource byte count overflow");
    return a * b;
}
inline void requireBudget(std::uint64_t used, std::uint64_t requested, std::uint64_t budget) {
    if (checkedAdd(used, requested) > budget)
        throw std::runtime_error("resident/staging resource budget exceeded");
}
} // namespace nexusgl
