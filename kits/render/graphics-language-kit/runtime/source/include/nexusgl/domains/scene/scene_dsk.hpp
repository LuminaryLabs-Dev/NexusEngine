#pragma once
#include "descriptors.hpp"
#include "resource_store.hpp"
#include <memory>
#include <optional>
#include <utility>

namespace nexusgl::scene {
struct PlaybackState {
    double seconds = 0;
    bool paused = false;
};
class PlaybackKit {
  public:
    const PlaybackState& state() const noexcept { return state_; }
    bool setTime(double seconds);
    bool advance(double delta);
    void setPaused(bool paused) noexcept { state_.paused = paused; }
    void reset() noexcept { state_ = {}; }
    PlaybackState snapshot() const noexcept { return state_; }
    void restore(PlaybackState state);

  private:
    PlaybackState state_;
};
class SceneFrameKit {
  public:
    using Snapshot = std::optional<Descriptor>;
    void submit(Descriptor descriptor);
    const Descriptor& frame() const;
    bool prepared() const noexcept { return bool(frame_); }
    void reset() noexcept { frame_.reset(); }
    Snapshot snapshot() const { return frame_ ? Snapshot(*frame_) : std::nullopt; }
    std::shared_ptr<const Descriptor> immutableFrame() const {
        (void)frame();
        return frame_;
    }
    void restore(Snapshot snapshot);

  private:
    std::shared_ptr<const Descriptor> frame_;
};
struct Snapshot {
    unsigned version = 1;
    PlaybackState playback;
    SceneFrameKit::Snapshot frame;
    std::shared_ptr<const ResourceStore::Snapshot> resources;
};
class SceneDSK {
  public:
    static constexpr const char* id = "nexusgl.scene";
    ResourceStore& resources() noexcept { return resources_; }
    const ResourceStore& resources() const noexcept { return resources_; }
    const PlaybackState& playback() const noexcept { return playback_.state(); }
    void setTime(double seconds);
    void advance(double delta);
    void setPaused(bool paused) noexcept { playback_.setPaused(paused); }
    void prepare(Descriptor descriptor) { frames_.submit(std::move(descriptor)); }
    const Descriptor& frame() const { return frames_.frame(); }
    std::shared_ptr<const Descriptor> immutableFrame() const { return frames_.immutableFrame(); }
    void reset();
    Snapshot snapshot() const;
    void restore(const Snapshot& snapshot);

  private:
    ResourceStore resources_;
    PlaybackKit playback_;
    SceneFrameKit frames_;
};
} // namespace nexusgl::scene
