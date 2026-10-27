#pragma once
#include "descriptors.hpp"
#include "nexusgl/resource_budget.hpp"
#include <limits>
#include <map>
#include <memory>

namespace nexusgl::scene {
using ResourceHandle = std::uint64_t;
struct MeshData {
    std::vector<SurfaceVertex> vertices;
    std::vector<std::uint32_t> indices;
};
struct InstanceData {
    ResourceHandle mesh = 0, material = 0;
    Mat4 model = Mat4::identity();
    Color color{255, 255, 255, 255};
    bool castsShadow = true, twoSidedShadow = false;
};
struct ResourceStatistics {
    std::uint64_t meshUploads = 0, uploadedBytes = 0, copiedBytes = 0, validatedVertices = 0,
                  transformedVertices = 0, committedTransactions = 0, abortedTransactions = 0;
};
class ResourceStore;
// Only ResourceStore can mint trusted descriptors. Retained readers share
// immutable payloads and never borrow transaction staging. Version 2 snapshots
// remain process-local.
class PreparedScene {
  public:
    const SceneFrame& frame() const {
        if (!frame_)
            throw std::logic_error("empty prepared scene");
        return *frame_;
    }
    std::uint64_t identity() const noexcept { return identity_; }
    std::uint64_t revision() const noexcept { return revision_; }
    std::uint64_t shadowRevision() const noexcept { return shadowRevision_; }

  private:
    friend class ResourceStore;
    PreparedScene() = default;
    std::shared_ptr<const SceneFrame> frame_;
    std::uint64_t identity_ = 0, revision_ = 0, shadowRevision_ = 0;
};
class ResourceStore {
  public:
    ResourceStore();
    ~ResourceStore();
    ResourceStore(const ResourceStore&) = delete;
    ResourceStore& operator=(const ResourceStore&) = delete;
    void begin(std::uint64_t expectedRevision);
    void commit();
    void abort();
    bool staging() const noexcept { return bool(staged_); }
    void poison() noexcept {
        if (staged_)
            failed_ = true;
    }
    std::uint64_t revision() const noexcept { return revision_; }
    void setBudget(std::uint64_t bytes);
    std::uint64_t residentBytes() const;
    std::uint64_t stagingBytes() const;
    const ResourceStatistics& statistics() const noexcept { return statistics_; }
    PreparedScene prepared() const { return prepared_; }
    void setSettings(const SceneFrame&);
    const SceneFrame& settings() const;
    // Shared input is defensively cloned. Owned uploads transfer their sole mutable
    // owner without an extra payload copy (the C adapter uses this path).
    void texture(ResourceHandle, std::shared_ptr<const Texture2D>, bool update = false);
    void texture(ResourceHandle, std::unique_ptr<Texture2D>, bool update = false);
    void material(ResourceHandle, Material, ResourceHandle color, ResourceHandle normal,
                  bool update = false);
    void mesh(ResourceHandle, std::shared_ptr<const MeshData>, bool update = false);
    void mesh(ResourceHandle, std::unique_ptr<MeshData>, bool update = false);
    void instance(ResourceHandle, const InstanceData&, bool update = false);
    void order(const std::vector<ResourceHandle>&);
    void releaseTexture(ResourceHandle);
    void releaseMaterial(ResourceHandle);
    void releaseMesh(ResourceHandle);
    void releaseInstance(ResourceHandle);
    void append(std::shared_ptr<const std::vector<SurfaceTriangle>>);
    void append(std::unique_ptr<std::vector<SurfaceTriangle>>);
    void clearGeometry();
    int materialIndex(ResourceHandle) const;
    struct Snapshot;
    std::shared_ptr<const Snapshot> snapshot() const;
    void restore(std::shared_ptr<const Snapshot>);
    void reset();

  private:
    struct State;
    template <class F> void change(F action) {
        const bool automatic = !staged_;
        if (automatic)
            begin(revision_);
        try {
            if (failed_)
                throw std::logic_error("transaction requires abort after failed operation");
            action(*staged_);
            if (automatic)
                commit();
        } catch (...) {
            if (automatic) {
                if (staged_)
                    abort();
            } else
                failed_ = true;
            throw;
        }
    }
    const State& current() const;
    std::shared_ptr<const State> state_;
    std::unique_ptr<State> staged_;
    PreparedScene prepared_;
    std::vector<std::weak_ptr<const State>> retainedStates_;
    std::vector<std::weak_ptr<const SceneFrame>> retainedFrames_;
    ResourceStatistics statistics_;
    std::uint64_t revision_ = 0, identity_ = 0, shadowRevision_ = 0, budget_ = 512ULL * 1024 * 1024;
    bool failed_ = false;
};
} // namespace nexusgl::scene
