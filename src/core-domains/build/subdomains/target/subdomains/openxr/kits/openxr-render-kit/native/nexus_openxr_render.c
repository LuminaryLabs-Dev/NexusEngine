#include "nexus_openxr_host.h"

#include <string.h>

int nexus_openxr_render_contract_validate(void) {
    return sizeof(NexusOpenXrFrame) > 0 && (sizeof(((NexusOpenXrFrame *)0)->views) / sizeof(XrView)) == 2;
}

XrResult nexus_openxr_create_stereo_swapchains(NexusOpenXrCore *core, NexusOpenXrFrame *frame, int64_t format, uint32_t width, uint32_t height) {
    PFN_xrCreateSwapchain create_swapchain = NULL;
    XrResult result = nexus_openxr_proc(core->instance, "xrCreateSwapchain", (PFN_xrVoidFunction *)&create_swapchain);
    if (XR_FAILED(result)) return result;
    XrSwapchainCreateInfo info = { XR_TYPE_SWAPCHAIN_CREATE_INFO };
    info.usageFlags = XR_SWAPCHAIN_USAGE_COLOR_ATTACHMENT_BIT | XR_SWAPCHAIN_USAGE_SAMPLED_BIT;
    info.format = format;
    info.sampleCount = 1;
    info.width = width;
    info.height = height;
    info.faceCount = 1;
    info.arraySize = 1;
    info.mipCount = 1;
    for (uint32_t eye = 0; eye < 2; eye++) {
        result = create_swapchain(core->session, &info, &frame->swapchains[eye]);
        if (XR_FAILED(result)) return result;
    }
    return XR_SUCCESS;
}

XrResult nexus_openxr_begin_frame(NexusOpenXrCore *core, NexusOpenXrFrame *frame) {
    PFN_xrWaitFrame wait_frame = NULL;
    PFN_xrBeginFrame begin_frame = NULL;
    XrResult result = nexus_openxr_proc(core->instance, "xrWaitFrame", (PFN_xrVoidFunction *)&wait_frame);
    if (XR_FAILED(result)) return result;
    result = nexus_openxr_proc(core->instance, "xrBeginFrame", (PFN_xrVoidFunction *)&begin_frame);
    if (XR_FAILED(result)) return result;
    XrFrameWaitInfo wait_info = { XR_TYPE_FRAME_WAIT_INFO };
    memset(&frame->state, 0, sizeof(frame->state));
    frame->state.type = XR_TYPE_FRAME_STATE;
    result = wait_frame(core->session, &wait_info, &frame->state);
    if (XR_FAILED(result)) return result;
    XrFrameBeginInfo begin_info = { XR_TYPE_FRAME_BEGIN_INFO };
    core->frame_index++;
    return begin_frame(core->session, &begin_info);
}

XrResult nexus_openxr_locate_views(NexusOpenXrCore *core, NexusOpenXrFrame *frame) {
    PFN_xrLocateViews locate_views = NULL;
    XrResult result = nexus_openxr_proc(core->instance, "xrLocateViews", (PFN_xrVoidFunction *)&locate_views);
    if (XR_FAILED(result)) return result;
    XrViewLocateInfo info = { XR_TYPE_VIEW_LOCATE_INFO };
    info.viewConfigurationType = XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO;
    info.displayTime = frame->state.predictedDisplayTime;
    info.space = core->local_space;
    XrViewState state = { XR_TYPE_VIEW_STATE };
    for (uint32_t eye = 0; eye < 2; eye++) frame->views[eye].type = XR_TYPE_VIEW;
    frame->view_count = 0;
    result = locate_views(core->session, &info, &state, 2, &frame->view_count, frame->views);
    if (XR_FAILED(result)) return result;
    return frame->view_count == 2 ? XR_SUCCESS : XR_ERROR_RUNTIME_FAILURE;
}

XrResult nexus_openxr_acquire_images(NexusOpenXrCore *core, NexusOpenXrFrame *frame) {
    PFN_xrAcquireSwapchainImage acquire = NULL;
    PFN_xrWaitSwapchainImage wait = NULL;
    XrResult result = nexus_openxr_proc(core->instance, "xrAcquireSwapchainImage", (PFN_xrVoidFunction *)&acquire);
    if (XR_FAILED(result)) return result;
    result = nexus_openxr_proc(core->instance, "xrWaitSwapchainImage", (PFN_xrVoidFunction *)&wait);
    if (XR_FAILED(result)) return result;
    XrSwapchainImageAcquireInfo acquire_info = { XR_TYPE_SWAPCHAIN_IMAGE_ACQUIRE_INFO };
    XrSwapchainImageWaitInfo wait_info = { XR_TYPE_SWAPCHAIN_IMAGE_WAIT_INFO };
    wait_info.timeout = XR_INFINITE_DURATION;
    for (uint32_t eye = 0; eye < 2; eye++) {
        result = acquire(frame->swapchains[eye], &acquire_info, &frame->image_indices[eye]);
        if (XR_FAILED(result)) return result;
        result = wait(frame->swapchains[eye], &wait_info);
        if (XR_FAILED(result)) return result;
    }
    return XR_SUCCESS;
}

XrResult nexus_openxr_release_images(NexusOpenXrCore *core, NexusOpenXrFrame *frame) {
    PFN_xrReleaseSwapchainImage release = NULL;
    XrResult result = nexus_openxr_proc(core->instance, "xrReleaseSwapchainImage", (PFN_xrVoidFunction *)&release);
    if (XR_FAILED(result)) return result;
    XrSwapchainImageReleaseInfo info = { XR_TYPE_SWAPCHAIN_IMAGE_RELEASE_INFO };
    for (uint32_t eye = 0; eye < 2; eye++) {
        result = release(frame->swapchains[eye], &info);
        if (XR_FAILED(result)) return result;
    }
    return XR_SUCCESS;
}

XrResult nexus_openxr_end_frame(NexusOpenXrCore *core, NexusOpenXrFrame *frame, const XrCompositionLayerBaseHeader *const *layers, uint32_t layer_count) {
    PFN_xrEndFrame end_frame = NULL;
    XrResult result = nexus_openxr_proc(core->instance, "xrEndFrame", (PFN_xrVoidFunction *)&end_frame);
    if (XR_FAILED(result)) return result;
    XrFrameEndInfo info = { XR_TYPE_FRAME_END_INFO };
    info.displayTime = frame->state.predictedDisplayTime;
    info.environmentBlendMode = XR_ENVIRONMENT_BLEND_MODE_OPAQUE;
    info.layerCount = layer_count;
    info.layers = layers;
    return end_frame(core->session, &info);
}
