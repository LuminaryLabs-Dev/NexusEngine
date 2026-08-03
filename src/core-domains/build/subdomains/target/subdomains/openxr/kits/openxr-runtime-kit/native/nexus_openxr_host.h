#ifndef NEXUS_OPENXR_HOST_H
#define NEXUS_OPENXR_HOST_H

#define XR_NO_PROTOTYPES
#include <openxr/openxr.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef struct NexusOpenXrCore {
    XrInstance instance;
    XrSystemId system_id;
    XrSession session;
    XrSpace local_space;
    XrSessionState session_state;
    uint64_t frame_index;
} NexusOpenXrCore;

typedef struct NexusOpenXrInput {
    XrActionSet action_set;
    XrAction left_pose;
    XrAction right_pose;
    XrAction select_action;
    XrAction haptic_action;
} NexusOpenXrInput;

typedef struct NexusOpenXrFrame {
    XrFrameState state;
    XrView views[2];
    uint32_t view_count;
    XrSwapchain swapchains[2];
    uint32_t image_indices[2];
} NexusOpenXrFrame;

int nexus_openxr_contract_validate(void);
XrResult nexus_openxr_load(void);
XrResult nexus_openxr_proc(XrInstance instance, const char *name, PFN_xrVoidFunction *function);
XrResult nexus_openxr_create_instance(NexusOpenXrCore *core, const char *application_name);
XrResult nexus_openxr_create_session(NexusOpenXrCore *core, const void *graphics_binding);
XrResult nexus_openxr_create_local_space(NexusOpenXrCore *core);
XrResult nexus_openxr_poll_event(NexusOpenXrCore *core, int *should_exit);
void nexus_openxr_shutdown(NexusOpenXrCore *core);

int nexus_openxr_input_contract_validate(void);
XrResult nexus_openxr_create_actions(NexusOpenXrCore *core, NexusOpenXrInput *input);
XrResult nexus_openxr_attach_actions(NexusOpenXrCore *core, NexusOpenXrInput *input);
XrResult nexus_openxr_sync_actions(NexusOpenXrCore *core, NexusOpenXrInput *input);
XrResult nexus_openxr_read_select(NexusOpenXrCore *core, NexusOpenXrInput *input, XrBool32 *selected);
XrResult nexus_openxr_apply_haptic(NexusOpenXrCore *core, NexusOpenXrInput *input, float amplitude, XrDuration duration);

int nexus_openxr_render_contract_validate(void);
XrResult nexus_openxr_create_stereo_swapchains(NexusOpenXrCore *core, NexusOpenXrFrame *frame, int64_t format, uint32_t width, uint32_t height);
XrResult nexus_openxr_begin_frame(NexusOpenXrCore *core, NexusOpenXrFrame *frame);
XrResult nexus_openxr_locate_views(NexusOpenXrCore *core, NexusOpenXrFrame *frame);
XrResult nexus_openxr_acquire_images(NexusOpenXrCore *core, NexusOpenXrFrame *frame);
XrResult nexus_openxr_release_images(NexusOpenXrCore *core, NexusOpenXrFrame *frame);
XrResult nexus_openxr_end_frame(NexusOpenXrCore *core, NexusOpenXrFrame *frame, const XrCompositionLayerBaseHeader *const *layers, uint32_t layer_count);

#ifdef __cplusplus
}
#endif

#endif
