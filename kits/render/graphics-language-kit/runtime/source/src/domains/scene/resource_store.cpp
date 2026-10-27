#include "nexusgl/domains/scene/resource_store.hpp"
#include <algorithm>
#include <atomic>
#include <cmath>
#include <cstring>
#include <set>

namespace nexusgl::scene {
namespace {
std::atomic<std::uint64_t> nextIdentity{1};
Vec3 geometric(const std::array<SurfaceVertex, 3>& v) {
    const auto a = v[0].position, b = v[1].position, c = v[2].position;
    const Vec3 u{b.x - a.x, b.y - a.y, b.z - a.z}, w{c.x - a.x, c.y - a.y, c.z - a.z};
    Vec3 n{u.y * w.z - u.z * w.y, u.z * w.x - u.x * w.z, u.x * w.y - u.y * w.x};
    const double length = std::hypot(n.x, std::hypot(n.y, n.z));
    return length > 0 ? Vec3{n.x / length, n.y / length, n.z / length} : n;
}
struct TextureRecord {
    std::size_t slot;
    std::shared_ptr<const Texture2D> data;
};
struct MaterialRecord {
    std::size_t slot;
    Material value;
    ResourceHandle color = 0, normal = 0;
};
struct InstanceRecord {
    InstanceData value;
    std::shared_ptr<const MeshData> cachedMesh;
    Mat4 cachedModel = Mat4::identity();
    std::shared_ptr<const std::vector<SurfaceVertex>> transformed;
    std::shared_ptr<const std::vector<SurfaceTriangle>> triangles;
    bool dirty = true;
};
std::uint64_t bytes(const Texture2D& t) {
    auto result = checkedAdd(sizeof(t), checkedMultiply(t.pixels.capacity(), sizeof(Color)));
    result = checkedAdd(result, checkedMultiply(t.mips.capacity(), sizeof(TextureLevel)));
    for (const auto& mip : t.mips)
        result = checkedAdd(result, checkedMultiply(mip.pixels.capacity(), sizeof(Color)));
    return result;
}
template <class T> std::size_t freeSlot(const std::map<ResourceHandle, T>& entries) {
    std::set<std::size_t> used;
    for (const auto& p : entries)
        used.insert(p.second.slot);
    std::size_t slot = 0;
    while (used.count(slot))
        ++slot;
    return slot;
}
template <class T> std::size_t slotExtent(const std::map<ResourceHandle, T>& entries) {
    std::size_t count = 0;
    for (const auto& p : entries)
        count = std::max(count, p.second.slot + 1);
    return count;
}
template <class T> void push(std::vector<std::uint8_t>& out, const T& value) {
    const auto* p = reinterpret_cast<const std::uint8_t*>(&value);
    out.insert(out.end(), p, p + sizeof(value));
}
} // namespace
struct ResourceStore::State {
    SceneFrame settings;
    std::map<ResourceHandle, TextureRecord> textures;
    std::map<ResourceHandle, MaterialRecord> materials;
    std::map<ResourceHandle, std::shared_ptr<const MeshData>> meshes;
    std::map<ResourceHandle, InstanceRecord> instances;
    std::vector<ResourceHandle> order;
    std::vector<std::shared_ptr<const std::vector<SurfaceTriangle>>> legacy;
    std::shared_ptr<const std::vector<std::uint8_t>> shadowDependencies =
        std::make_shared<const std::vector<std::uint8_t>>();
    std::size_t textureSlots = 0, materialSlots = 0;
    ResourceStatistics delta;
    bool shadowDirty = false;
    std::uint64_t bytesUsed(bool cloning = false) const {
        std::uint64_t result = sizeof(State) +
                               textures.size() * (sizeof(decltype(textures)::value_type) + 64) +
                               materials.size() * (sizeof(decltype(materials)::value_type) + 64) +
                               meshes.size() * (sizeof(decltype(meshes)::value_type) + 64) +
                               instances.size() * (sizeof(decltype(instances)::value_type) + 64);
        result = checkedAdd(result,
                            (cloning ? order.size() : order.capacity()) * sizeof(ResourceHandle) +
                                (cloning ? legacy.size() : legacy.capacity()) *
                                    sizeof(decltype(legacy)::value_type) +
                                shadowDependencies->capacity());
        for (const auto& pair : textures)
            result = checkedAdd(result, bytes(*pair.second.data));
        for (const auto& pair : meshes)
            result =
                checkedAdd(result, sizeof(MeshData) +
                                       pair.second->vertices.capacity() * sizeof(SurfaceVertex) +
                                       pair.second->indices.capacity() * sizeof(std::uint32_t));
        for (const auto& pair : instances) {
            if (pair.second.triangles)
                result =
                    checkedAdd(result, pair.second.triangles->capacity() * sizeof(SurfaceTriangle));
            if (pair.second.transformed)
                result =
                    checkedAdd(result, pair.second.transformed->capacity() * sizeof(SurfaceVertex));
        }
        for (const auto& batch : legacy)
            result = checkedAdd(result, batch->capacity() * sizeof(SurfaceTriangle));
        return result;
    }
};
namespace {
std::uint64_t frameBytes(const SceneFrame& frame, bool payload) {
    auto result = checkedAdd(sizeof(SceneFrame),
                             checkedMultiply(frame.materials.capacity(), sizeof(Material)));
    result = checkedAdd(
        result, checkedMultiply(frame.residentTextures.capacity() + frame.batches.capacity(),
                                sizeof(std::shared_ptr<const void>)));
    if (payload) {
        for (const auto& t : frame.residentTextures)
            result = checkedAdd(result, bytes(*t));
        for (const auto& b : frame.batches)
            result = checkedAdd(result, checkedMultiply(b->capacity(), sizeof(SurfaceTriangle)));
    }
    return result;
}
} // namespace
struct ResourceStore::Snapshot {
    unsigned version = 2;
    std::shared_ptr<const State> state;
    PreparedScene prepared;
};
ResourceStore::ResourceStore() : identity_(nextIdentity++) {
    state_ = std::make_shared<State>();
    begin(0);
    commit();
}
ResourceStore::~ResourceStore() = default;
const ResourceStore::State& ResourceStore::current() const {
    return staged_ ? *staged_ : *state_;
}
const SceneFrame& ResourceStore::settings() const {
    return current().settings;
}
void ResourceStore::begin(std::uint64_t expected) {
    if (staged_)
        throw std::logic_error("scene transaction already active");
    if (expected != revision_)
        throw std::invalid_argument("stale expected scene revision");
    // Match stagingBytes()'s conservative shared-payload reservation before copying
    // any metadata. Vector copies need their active sizes, not unused old capacity.
    requireBudget(residentBytes(), state_->bytesUsed(true), budget_);
    staged_ = std::make_unique<State>(*state_);
    staged_->delta = {};
    staged_->shadowDirty = false;
    failed_ = false;
}
void ResourceStore::abort() {
    if (!staged_)
        throw std::logic_error("no scene transaction to abort");
    staged_.reset();
    failed_ = false;
    ++statistics_.abortedTransactions;
}
void ResourceStore::setBudget(std::uint64_t value) {
    if (residentBytes() > value || stagingBytes() > value - residentBytes())
        throw std::runtime_error("resident scenes exceed resource budget");
    budget_ = value;
}
std::uint64_t ResourceStore::residentBytes() const {
    auto total = state_->bytesUsed();
    if (prepared_.frame_)
        total = checkedAdd(total, frameBytes(*prepared_.frame_, false));
    for (const auto& weak : retainedStates_)
        if (auto state = weak.lock())
            if (state != state_)
                total = checkedAdd(total, state->bytesUsed());
    for (const auto& weak : retainedFrames_)
        if (auto frame = weak.lock())
            if (frame != prepared_.frame_)
                total = checkedAdd(total, frameBytes(*frame, true));
    return total;
}
std::uint64_t ResourceStore::stagingBytes() const {
    return staged_ ? staged_->bytesUsed() : 0;
}
int ResourceStore::materialIndex(ResourceHandle id) const {
    if (!id)
        return -1;
    auto it = current().materials.find(id);
    if (it == current().materials.end())
        throw std::invalid_argument("invalid material resource");
    return int(it->second.slot);
}
void ResourceStore::setSettings(const SceneFrame& settings) {
    change([&](State& s) {
        SceneFrame candidate;
        candidate.background = settings.background;
        candidate.viewProjection = settings.viewProjection;
        candidate.cameraPosition = settings.cameraPosition;
        candidate.shadow = settings.shadow;
        candidate.light = settings.light;
        candidate.display = settings.display;
        validate(candidate);
        s.settings = std::move(candidate);
    });
}
void ResourceStore::texture(ResourceHandle id, std::shared_ptr<const Texture2D> input,
                            bool update) {
    change([&](State& s) {
        if (!input)
            throw std::invalid_argument("missing immutable texture");
        requireBudget(checkedAdd(residentBytes(), s.bytesUsed()), bytes(*input), budget_);
        texture(id, std::make_unique<Texture2D>(*input), update);
    });
}
void ResourceStore::texture(ResourceHandle id, std::unique_ptr<Texture2D> input, bool update) {
    change([&](State& s) {
        if (!input)
            throw std::invalid_argument("missing immutable texture");
        std::shared_ptr<const Texture2D> texture(std::move(input));
        auto it = s.textures.find(id);
        if (!id || (update != (it != s.textures.end())))
            throw std::invalid_argument("invalid texture identity");
        if (!update && s.textures.size() >= 4096)
            throw std::runtime_error("scene texture limit reached");
        requireBudget(checkedAdd(residentBytes(), s.bytesUsed()), bytes(*texture), budget_);
        SceneFrame test;
        test.residentTextures.push_back(texture);
        validate(test);
        const auto size = bytes(*texture);
        s.delta.uploadedBytes += size;
        s.delta.copiedBytes += size;
        for (const auto& p : s.materials)
            if (p.second.value.alphaMode == AlphaMode::Mask && p.second.color == id)
                s.shadowDirty = true;
        if (update)
            it->second.data = std::move(texture);
        else {
            const auto slot = freeSlot(s.textures);
            s.textures.emplace(id, TextureRecord{slot, std::move(texture)});
            s.textureSlots = std::max(s.textureSlots, slot + 1);
        }
    });
}
void ResourceStore::material(ResourceHandle id, Material m, ResourceHandle color,
                             ResourceHandle normal, bool update) {
    change([&](State& s) {
        auto it = s.materials.find(id);
        if (!id || (update != (it != s.materials.end())))
            throw std::invalid_argument("invalid material identity");
        if (!update && s.materials.size() >= 4096)
            throw std::runtime_error("scene material limit reached");
        const auto slot = [&](ResourceHandle h) {
            if (!h)
                return -1;
            auto t = s.textures.find(h);
            if (t == s.textures.end())
                throw std::invalid_argument("invalid material texture");
            return int(t->second.slot);
        };
        m.colorTexture = slot(color);
        m.normalTexture = slot(normal);
        SceneFrame test;
        auto valid = m;
        valid.colorTexture = valid.normalTexture = -1;
        test.materials.push_back(valid);
        validate(test);
        if (update) {
            const auto& old = it->second;
            if (old.value.alphaMode != m.alphaMode || old.value.opacity != m.opacity ||
                old.value.alphaCutoff != m.alphaCutoff || old.color != color)
                s.shadowDirty = true;
            it->second = {it->second.slot, m, color, normal};
        } else {
            const auto slot = freeSlot(s.materials);
            s.materials.emplace(id, MaterialRecord{slot, m, color, normal});
            s.materialSlots = std::max(s.materialSlots, slot + 1);
        }
        s.delta.uploadedBytes += sizeof(Material);
        s.delta.copiedBytes += sizeof(Material);
    });
}
void ResourceStore::mesh(ResourceHandle id, std::shared_ptr<const MeshData> input, bool update) {
    change([&](State& s) {
        if (!input)
            throw std::invalid_argument("missing immutable mesh");
        const auto size = checkedAdd(checkedMultiply(input->vertices.size(), sizeof(SurfaceVertex)),
                                     checkedMultiply(input->indices.size(), sizeof(std::uint32_t)));
        requireBudget(checkedAdd(residentBytes(), s.bytesUsed()), size, budget_);
        mesh(id, std::make_unique<MeshData>(*input), update);
    });
}
void ResourceStore::mesh(ResourceHandle id, std::unique_ptr<MeshData> input, bool update) {
    change([&](State& s) {
        if (!input)
            throw std::invalid_argument("missing immutable mesh");
        std::shared_ptr<const MeshData> mesh(std::move(input));
        const auto it = s.meshes.find(id);
        if (!id || (update != (it != s.meshes.end())))
            throw std::invalid_argument("invalid mesh identity");
        if (mesh->indices.size() % 3)
            throw std::invalid_argument("mesh index count must be a multiple of 3");
        const auto size = checkedAdd(checkedMultiply(mesh->vertices.size(), sizeof(SurfaceVertex)),
                                     checkedMultiply(mesh->indices.size(), sizeof(std::uint32_t)));
        requireBudget(checkedAdd(residentBytes(), s.bytesUsed()), size, budget_);
        // Validate every supplied vertex, including unused vertices, exactly once
        // on upload.
        for (const auto& vertex : mesh->vertices)
            validateVertex(vertex);
        for (std::size_t i = 0; i < mesh->indices.size(); i += 3) {
            for (int k = 0; k < 3; ++k)
                if (mesh->indices[i + k] >= mesh->vertices.size())
                    throw std::invalid_argument("mesh index outside vertices");
            const double h = mesh->vertices[mesh->indices[i]].handedness;
            if (mesh->vertices[mesh->indices[i + 1]].handedness != h ||
                mesh->vertices[mesh->indices[i + 2]].handedness != h)
                throw std::invalid_argument("mesh tangent handedness must agree per triangle");
        }
        s.shadowDirty = true;
        s.meshes[id] = std::move(mesh);
        ++s.delta.meshUploads;
        s.delta.uploadedBytes += size;
        s.delta.copiedBytes += size;
        s.delta.validatedVertices += s.meshes[id]->vertices.size();
    });
}
void ResourceStore::instance(ResourceHandle id, const InstanceData& value, bool update) {
    change([&](State& s) {
        auto it = s.instances.find(id);
        if (!id || (update != (it != s.instances.end())))
            throw std::invalid_argument("invalid instance identity");
        checkedAffine(value.model);
        if (!s.meshes.count(value.mesh) || (value.material && !s.materials.count(value.material)))
            throw std::invalid_argument("instance references missing resource");
        if (update) {
            const auto& old = it->second.value;
            const bool dirty = old.mesh != value.mesh || old.material != value.material ||
                               old.model.values != value.model.values ||
                               std::memcmp(&old.color, &value.color, sizeof(Color)) ||
                               old.castsShadow != value.castsShadow ||
                               old.twoSidedShadow != value.twoSidedShadow;
            it->second.value = value;
            it->second.dirty |= dirty;
            s.shadowDirty |= dirty;
        } else {
            s.shadowDirty = true;
            s.instances.emplace(id, InstanceRecord{value, {}, Mat4::identity(), {}, {}, true});
            s.order.push_back(id);
        }
    });
}
void ResourceStore::order(const std::vector<ResourceHandle>& order) {
    change([&](State& s) {
        if (order.size() != s.instances.size())
            throw std::invalid_argument("instance order must name every instance exactly once");
        std::set<ResourceHandle> seen;
        for (auto id : order)
            if (!s.instances.count(id) || !seen.insert(id).second)
                throw std::invalid_argument("invalid or duplicate instance in order");
        s.shadowDirty |= s.order != order;
        s.order = order;
    });
}
void ResourceStore::releaseInstance(ResourceHandle id) {
    change([&](State& s) {
        s.shadowDirty = true;
        if (!s.instances.erase(id))
            throw std::invalid_argument("invalid instance resource");
        s.order.erase(std::remove(s.order.begin(), s.order.end(), id), s.order.end());
    });
}
void ResourceStore::releaseMesh(ResourceHandle id) {
    change([&](State& s) {
        for (const auto& p : s.instances)
            if (p.second.value.mesh == id)
                throw std::invalid_argument("mesh still referenced by instance");
        if (!s.meshes.erase(id))
            throw std::invalid_argument("invalid mesh resource");
    });
}
void ResourceStore::releaseMaterial(ResourceHandle id) {
    change([&](State& s) {
        const int slot = materialIndex(id);
        for (const auto& p : s.instances)
            if (p.second.value.material == id)
                throw std::invalid_argument("material still referenced by instance");
        for (const auto& b : s.legacy)
            for (const auto& t : *b)
                if (t.material == slot)
                    throw std::invalid_argument("material still referenced by geometry");
        if (!s.materials.erase(id))
            throw std::invalid_argument("invalid material resource");
        s.materialSlots = slotExtent(s.materials);
    });
}
void ResourceStore::releaseTexture(ResourceHandle id) {
    change([&](State& s) {
        for (const auto& p : s.materials)
            if (p.second.color == id || p.second.normal == id)
                throw std::invalid_argument("texture still referenced by material");
        if (!s.textures.erase(id))
            throw std::invalid_argument("invalid texture resource");
        s.textureSlots = slotExtent(s.textures);
    });
}
void ResourceStore::append(std::shared_ptr<const std::vector<SurfaceTriangle>> input) {
    change([&](State& s) {
        if (!input)
            throw std::invalid_argument("missing immutable geometry");
        requireBudget(checkedAdd(residentBytes(), s.bytesUsed()),
                      checkedMultiply(input->size(), sizeof(SurfaceTriangle)), budget_);
        append(std::make_unique<std::vector<SurfaceTriangle>>(*input));
    });
}
void ResourceStore::append(std::unique_ptr<std::vector<SurfaceTriangle>> input) {
    change([&](State& s) {
        if (!input)
            throw std::invalid_argument("missing immutable geometry");
        std::shared_ptr<const std::vector<SurfaceTriangle>> triangles(std::move(input));
        requireBudget(checkedAdd(residentBytes(), s.bytesUsed()),
                      triangles->size() * sizeof(SurfaceTriangle), budget_);
        validateTriangles(*triangles, s.materialSlots);
        s.delta.validatedVertices += triangles->size() * 3;
        s.delta.uploadedBytes += triangles->size() * sizeof(SurfaceTriangle);
        s.delta.copiedBytes += triangles->size() * sizeof(SurfaceTriangle);
        s.shadowDirty = true;
        s.legacy.push_back(std::move(triangles));
    });
}
void ResourceStore::clearGeometry() {
    change([](State& s) {
        s.shadowDirty = true;
        s.legacy.clear();
        s.instances.clear();
        s.order.clear();
    });
}
void ResourceStore::commit() {
    if (!staged_)
        throw std::logic_error("no scene transaction to commit");
    if (failed_)
        throw std::logic_error("transaction requires abort after failed operation");
    try {
        auto& s = *staged_;
        auto frame = std::make_shared<SceneFrame>(s.settings);
        frame->materials.resize(s.materialSlots);
        for (const auto& p : s.materials)
            frame->materials[p.second.slot] = p.second.value;
        // Empty slots are valid immutable 1x1 textures; reuse occurs only in new
        // tables.
        static const auto empty = std::make_shared<const Texture2D>(
            Texture2D{1, 1, {{0, 0, 0, 0}}, TextureFilter::Nearest, {}});
        frame->residentTextures.resize(s.textureSlots, empty);
        for (const auto& p : s.textures)
            frame->residentTextures[p.second.slot] = p.second.data;
        // Already-validated immutable texture bytes are not traversed again at
        // commit.
        SceneFrame settingsCheck = s.settings;
        validate(settingsCheck);
        frame->batches = s.legacy;
        for (const auto id : s.order) {
            auto& instance = s.instances.at(id);
            const auto mesh = s.meshes.at(instance.value.mesh);
            if (instance.dirty || instance.cachedMesh != mesh) {
                requireBudget(checkedAdd(residentBytes(), s.bytesUsed()),
                              checkedMultiply(mesh->indices.size() / 3, sizeof(SurfaceTriangle)),
                              budget_);
                auto triangles = std::make_shared<std::vector<SurfaceTriangle>>();
                triangles->reserve(mesh->indices.size() / 3);
                if (instance.cachedMesh != mesh ||
                    instance.cachedModel.values != instance.value.model.values ||
                    !instance.transformed) {
                    requireBudget(checkedAdd(residentBytes(), s.bytesUsed()),
                                  checkedMultiply(mesh->vertices.size(), sizeof(SurfaceVertex)),
                                  budget_);
                    const auto transform = checkedAffine(instance.value.model);
                    auto vertices = std::make_shared<std::vector<SurfaceVertex>>();
                    vertices->reserve(mesh->vertices.size());
                    for (auto v : mesh->vertices) {
                        v.position = transformPosition(transform, v.position);
                        v.normal = transformNormal(transform, v.normal);
                        v.tangent = transformTangent(transform, v.tangent);
                        v.handedness *= transform.handedness;
                        vertices->push_back(v);
                    }
                    s.delta.transformedVertices += vertices->size();
                    instance.transformed = std::move(vertices);
                    instance.cachedModel = instance.value.model;
                }
                for (std::size_t i = 0; i < mesh->indices.size(); i += 3) {
                    SurfaceTriangle t;
                    for (int k = 0; k < 3; ++k)
                        t.vertices[k] = (*instance.transformed)[mesh->indices[i + k]];
                    t.geometricNormal = geometric(t.vertices);
                    t.albedo = instance.value.color;
                    t.material = instance.value.material
                                     ? int(s.materials.at(instance.value.material).slot)
                                     : -1;
                    t.castsShadow = instance.value.castsShadow;
                    t.twoSidedShadow = instance.value.twoSidedShadow;
                    triangles->push_back(t);
                }
                instance.triangles = std::move(triangles);
                instance.cachedMesh = mesh;
                instance.dirty = false;
            }
            frame->batches.push_back(instance.triangles);
        }
        std::vector<std::uint8_t> deps;
        // Dependency records reference immutable batches. Camera, exposure and
        // noncoverage material changes do not invalidate caster depth. No per-frame
        // triangle byte key.
        if (s.shadowDirty)
            for (const auto& batch : frame->batches) {
                const auto address = reinterpret_cast<std::uintptr_t>(batch.get());
                bool included = false;
                for (const auto& t : *batch) {
                    const auto* m = t.material < 0 ? nullptr : &frame->materials[t.material];
                    if (!t.castsShadow || (m && m->alphaMode == AlphaMode::Blend))
                        continue;
                    if (!included) {
                        push(deps, address);
                        included = true;
                    }
                    if (m && m->alphaMode == AlphaMode::Mask) {
                        push(deps, t.material);
                        push(deps, m->opacity);
                        push(deps, m->alphaCutoff);
                        push(deps, m->colorTexture);
                        if (m->colorTexture >= 0) {
                            const auto ptr = reinterpret_cast<std::uintptr_t>(
                                frame->residentTextures[m->colorTexture].get());
                            push(deps, ptr);
                        }
                    }
                }
            }
        requireBudget(residentBytes(),
                      checkedAdd(s.bytesUsed(), checkedAdd(deps.size(), frameBytes(*frame, false))),
                      budget_);
        const bool shadowChanged = s.shadowDirty && deps != *state_->shadowDependencies;
        if (s.shadowDirty)
            s.shadowDependencies =
                std::make_shared<const std::vector<std::uint8_t>>(std::move(deps));
        retainedStates_.erase(std::remove_if(retainedStates_.begin(), retainedStates_.end(),
                                             [](const auto& p) { return p.expired(); }),
                              retainedStates_.end());
        retainedFrames_.erase(std::remove_if(retainedFrames_.begin(), retainedFrames_.end(),
                                             [](const auto& p) { return p.expired(); }),
                              retainedFrames_.end());
        retainedStates_.reserve(retainedStates_.size() + 1);
        retainedFrames_.reserve(retainedFrames_.size() + 1);
        auto replacement = std::shared_ptr<const State>(std::move(staged_));
        state_ = std::move(replacement);
        ++revision_;
        if (shadowChanged)
            ++shadowRevision_;
        retainedStates_.push_back(state_);
        retainedFrames_.push_back(frame);
        prepared_.frame_ = std::move(frame);
        prepared_.identity_ = identity_;
        prepared_.revision_ = revision_;
        prepared_.shadowRevision_ = shadowRevision_;
        const auto& d = state_->delta;
        statistics_.meshUploads += d.meshUploads;
        statistics_.uploadedBytes += d.uploadedBytes;
        statistics_.copiedBytes += d.copiedBytes;
        statistics_.validatedVertices += d.validatedVertices;
        statistics_.transformedVertices += d.transformedVertices;
        ++statistics_.committedTransactions;
    } catch (...) {
        failed_ = true;
        throw;
    }
}
std::shared_ptr<const ResourceStore::Snapshot> ResourceStore::snapshot() const {
    return std::make_shared<const Snapshot>(Snapshot{2, state_, prepared_});
}
void ResourceStore::restore(std::shared_ptr<const Snapshot> snapshot) {
    if (!snapshot || snapshot->version != 2 || !snapshot->state)
        throw std::invalid_argument("unsupported resident snapshot");
    if (staged_)
        throw std::logic_error("abort transaction before restore");
    requireBudget(residentBytes(),
                  snapshot->state->bytesUsed() + frameBytes(*snapshot->prepared.frame_, false),
                  budget_);
    const bool knownState =
        std::any_of(retainedStates_.begin(), retainedStates_.end(),
                    [&](const auto& weak) { return weak.lock() == snapshot->state; });
    const bool knownFrame =
        std::any_of(retainedFrames_.begin(), retainedFrames_.end(),
                    [&](const auto& weak) { return weak.lock() == snapshot->prepared.frame_; });
    if (!knownState)
        retainedStates_.reserve(retainedStates_.size() + 1);
    if (!knownFrame)
        retainedFrames_.reserve(retainedFrames_.size() + 1);
    state_ = snapshot->state;
    prepared_ = snapshot->prepared;
    if (!knownState)
        retainedStates_.push_back(state_);
    if (!knownFrame)
        retainedFrames_.push_back(prepared_.frame_);
    prepared_.identity_ = identity_;
    prepared_.revision_ = ++revision_;
    prepared_.shadowRevision_ = ++shadowRevision_;
}
void ResourceStore::reset() {
    if (staged_)
        abort();
    begin(revision_);
    try {
        auto empty = std::make_unique<State>();
        empty->shadowDirty = true;
        staged_.swap(empty);
        commit();
        ++shadowRevision_;
        prepared_.shadowRevision_ = shadowRevision_;
    } catch (...) {
        if (staged_)
            abort();
        throw;
    }
}
} // namespace nexusgl::scene
