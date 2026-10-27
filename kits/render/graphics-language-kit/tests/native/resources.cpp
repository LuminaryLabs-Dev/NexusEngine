#include "nexusgl/domains/scene/scene_dsk.hpp"
#include "nexusgl/graphics.hpp"
#include <cassert>
#include <cmath>
#include <iostream>
#include <vector>
using namespace nexusgl;
static std::vector<unsigned char> pixels(Renderer& r, const scene::PreparedScene& f) {
    const auto& p = r.render(f, {48, 40});
    return {p.data(), p.data() + p.size()};
}
int main() {
    scene::SceneDSK owner;
    auto& store = owner.resources();
    auto mesh = std::make_shared<scene::MeshData>();
    mesh->vertices = {{{-.6, -.6, .5}}, {{.6, -.6, .5}}, {{.6, .6, .5}}, {{-.6, .6, .5}}};
    mesh->indices = {0, 1, 2, 0, 2, 3};
    auto settings = store.settings();
    settings.shadow.resolution = 16;
    store.setSettings(settings);
    store.begin(store.revision());
    store.mesh(10, mesh);
    Material material;
    material.shading = Shading::Unlit;
    store.material(20, material, 0, 0);
    scene::InstanceData a;
    a.mesh = 10;
    a.material = 20;
    a.color = {210, 110, 30, 255};
    store.instance(30, a);
    auto b = a;
    b.model = Mat4::translation(.2, 0, .1);
    store.instance(31, b);
    store.commit();
    auto prepared = store.prepared();
    assert(prepared.frame().batches.size() == 2);
    assert(store.statistics().meshUploads == 1);
    assert(store.statistics().transformedVertices == 8);
    Renderer r;
    for (auto quality :
         {render::Quality::Native, render::Quality::GaussianHalf, render::Quality::GuidedHalf}) {
        r.setQuality(quality);
        const auto actual = pixels(r, prepared);
        scene::SceneFrame raw = prepared.frame();
        raw.triangles.clear();
        for (const auto& batch : raw.batches)
            raw.triangles.insert(raw.triangles.end(), batch->begin(), batch->end());
        raw.batches.clear();
        const auto& reference = r.render(raw, {48, 40});
        assert(actual ==
               std::vector<unsigned char>(reference.data(), reference.data() + reference.size()));
    }
    const auto old = pixels(r, prepared);
    const auto transforms = store.statistics().transformedVertices;
    store.begin(store.revision());
    auto changed = store.settings();
    changed.cameraPosition.x = .2;
    store.setSettings(changed);
    store.commit();
    assert(store.statistics().transformedVertices == transforms);
    assert(store.prepared().frame().batches[0] == prepared.frame().batches[0]);
    assert(store.prepared().shadowRevision() == prepared.shadowRevision());
    store.begin(store.revision());
    b.model = Mat4::translation(.3, 0, .1);
    store.instance(31, b, true);
    store.commit();
    assert(store.statistics().transformedVertices == transforms + 4);
    assert(store.prepared().frame().batches[0] == prepared.frame().batches[0]);
    assert(pixels(r, prepared) == old);
    const auto colorTransforms = store.statistics().transformedVertices;
    b.color = {20, 60, 90, 255};
    store.instance(31, b, true);
    assert(store.statistics().transformedVertices == colorTransforms);
    const auto snapshot = owner.snapshot();
    assert(snapshot.version == 2);
    const auto frozen = store.prepared();
    owner.reset();
    assert(scene::triangleCount(store.prepared().frame()) == 0);
    owner.restore(snapshot);
    assert(pixels(r, store.prepared()) == pixels(r, frozen));
    assert(store.prepared().identity() == prepared.identity());
    bool rejected = false;
    try {
        store.releaseMesh(10);
    } catch (const std::invalid_argument&) {
        rejected = true;
    }
    assert(rejected);
    store.begin(store.revision());
    store.releaseInstance(30);
    store.releaseInstance(31);
    store.releaseMaterial(20);
    store.releaseMesh(10);
    store.commit();
    assert(scene::triangleCount(store.prepared().frame()) == 0);
    assert(pixels(r, prepared) == old);
    auto tex = std::make_shared<Texture2D>();
    tex->width = tex->height = 1;
    tex->pixels = {{255, 255, 255, 255}};
    store.texture(40, tex);
    material.colorTexture = 0;
    store.material(41, material, 40, 0);
    rejected = false;
    try {
        store.releaseTexture(40);
    } catch (const std::invalid_argument&) {
        rejected = true;
    }
    assert(rejected);
    store.begin(store.revision());
    store.releaseMaterial(41);
    store.releaseTexture(40);
    store.commit();
    const auto floor = store.residentBytes();
    for (int i = 0; i < 4100; ++i) {
        store.begin(store.revision());
        store.texture(1000 + i, tex);
        store.material(10000 + i, material, 1000 + i, 0);
        store.releaseMaterial(10000 + i);
        store.releaseTexture(1000 + i);
        store.commit();
    }
    assert(store.residentBytes() <= floor + 512);
    assert(store.prepared().frame().materials.empty() &&
           store.prepared().frame().residentTextures.empty());
    scene::ResourceStore isolated;
    auto aliasedMesh = std::make_shared<scene::MeshData>(*mesh);
    auto aliasedTexture = std::make_shared<Texture2D>(*tex);
    isolated.begin(isolated.revision());
    isolated.mesh(1, aliasedMesh);
    isolated.texture(2, aliasedTexture);
    Material textured;
    textured.shading = Shading::Unlit;
    isolated.material(3, textured, 2, 0);
    scene::InstanceData aliasedInstance;
    aliasedInstance.mesh = 1;
    aliasedInstance.material = 3;
    isolated.instance(4, aliasedInstance);
    isolated.commit();
    const auto retained = isolated.prepared();
    const auto retainedPixels = pixels(r, retained);
    aliasedMesh->indices[0] = 999999;
    aliasedMesh->vertices[0].position.x = NAN;
    aliasedTexture->pixels[0] = {0, 0, 0, 0};
    aliasedInstance.model = Mat4::translation(.1, 0, 0);
    isolated.instance(4, aliasedInstance, true);
    assert(pixels(r, retained) == retainedPixels);
    assert(isolated.prepared().frame().residentTextures[0]->pixels[0].a == 255);
    pixels(r, isolated.prepared());
    auto legacy = std::make_shared<std::vector<scene::SurfaceTriangle>>(1);
    (*legacy)[0] = (*retained.frame().batches[0])[0];
    scene::ResourceStore legacyStore;
    (*legacy)[0].material = -1;
    legacyStore.append(legacy);
    const auto legacyFrame = legacyStore.prepared();
    const auto legacyPixels = pixels(r, legacyFrame);
    (*legacy)[0].vertices[0].position.x = NAN;
    assert(pixels(r, legacyFrame) == legacyPixels);
    auto rawBatch =
        std::make_shared<std::vector<scene::SurfaceTriangle>>(*retained.frame().batches[0]);
    auto rawTexture = std::make_shared<Texture2D>(*tex);
    scene::SceneFrame rawShared;
    rawShared.shadow.resolution = 16;
    rawShared.batches = {rawBatch};
    rawShared.residentTextures = {rawTexture};
    textured.colorTexture = 0;
    rawShared.materials = {textured};
    scene::SceneFrameKit rawFrames;
    rawFrames.submit(rawShared);
    const auto immutable = rawFrames.immutableFrame();
    const auto& beforeRaw = r.render(*immutable, {48, 40});
    const std::vector<unsigned char> rawPixels(beforeRaw.data(),
                                               beforeRaw.data() + beforeRaw.size());
    (*rawBatch)[0].vertices[0].position.x = NAN;
    rawTexture->pixels[0].a = 0;
    const auto& afterRaw = r.render(*immutable, {48, 40});
    assert(rawPixels ==
           std::vector<unsigned char>(afterRaw.data(), afterRaw.data() + afterRaw.size()));
    (*rawBatch)[0] = (*retained.frame().batches[0])[0];
    rawTexture->pixels[0].a = 255;
    rawFrames.restore(scene::SceneFrameKit::Snapshot(rawShared));
    const auto restoredRaw = rawFrames.immutableFrame();
    (*rawBatch)[0].vertices[0].position.x = NAN;
    rawTexture->pixels[0].a = 0;
    const auto& afterRestore = r.render(*restoredRaw, {48, 40});
    assert(rawPixels == std::vector<unsigned char>(afterRestore.data(),
                                                   afterRestore.data() + afterRestore.size()));
    scene::ResourceStore replay;
    replay.mesh(1, mesh);
    scene::InstanceData placement;
    placement.mesh = 1;
    replay.instance(2, placement);
    const auto originalSnapshot = replay.snapshot();
    auto replaySettings = replay.settings();
    replaySettings.cameraPosition.x = .5;
    replay.setSettings(replaySettings);
    replay.restore(originalSnapshot);
    replay.setSettings(replaySettings);
    const auto reservation = replay.residentBytes();
    for (int i = 0; i < 128; ++i) {
        replay.restore(originalSnapshot);
        replay.setSettings(replaySettings);
        assert(replay.residentBytes() == reservation);
    }
    replay.begin(replay.revision());
    const auto staging = replay.stagingBytes();
    replay.abort();
    replay.setBudget(replay.residentBytes() + staging - 1);
    rejected = false;
    try {
        replay.begin(replay.revision());
    } catch (const std::runtime_error&) {
        rejected = true;
    }
    assert(rejected && !replay.staging());
    replay.setBudget(replay.residentBytes() + staging);
    replay.begin(replay.revision());
    assert(replay.stagingBytes() == staging);
    replay.abort();
    std::cout << "resources PASS\n";
}
