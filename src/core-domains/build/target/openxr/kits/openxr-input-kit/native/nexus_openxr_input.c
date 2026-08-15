#include "nexus_openxr_host.h"

#include <stdio.h>
#include <string.h>

int nexus_openxr_input_contract_validate(void) {
    return sizeof(NexusOpenXrInput) > 0 && XR_ACTION_TYPE_POSE_INPUT != XR_ACTION_TYPE_VIBRATION_OUTPUT;
}

XrResult nexus_openxr_create_actions(NexusOpenXrCore *core, NexusOpenXrInput *input) {
    if (!core || !input) return XR_ERROR_VALIDATION_FAILURE;
    PFN_xrCreateActionSet create_action_set = NULL;
    PFN_xrCreateAction create_action = NULL;
    XrResult result = nexus_openxr_proc(core->instance, "xrCreateActionSet", (PFN_xrVoidFunction *)&create_action_set);
    if (XR_FAILED(result)) return result;
    result = nexus_openxr_proc(core->instance, "xrCreateAction", (PFN_xrVoidFunction *)&create_action);
    if (XR_FAILED(result)) return result;
    XrActionSetCreateInfo set_info = { XR_TYPE_ACTION_SET_CREATE_INFO };
    snprintf(set_info.actionSetName, XR_MAX_ACTION_SET_NAME_SIZE, "%s", "nexus_gameplay");
    snprintf(set_info.localizedActionSetName, XR_MAX_LOCALIZED_ACTION_SET_NAME_SIZE, "%s", "Nexus Gameplay");
    result = create_action_set(core->instance, &set_info, &input->action_set);
    if (XR_FAILED(result)) return result;
    XrActionCreateInfo action_info = { XR_TYPE_ACTION_CREATE_INFO };
    action_info.actionType = XR_ACTION_TYPE_BOOLEAN_INPUT;
    snprintf(action_info.actionName, XR_MAX_ACTION_NAME_SIZE, "%s", "select");
    snprintf(action_info.localizedActionName, XR_MAX_LOCALIZED_ACTION_NAME_SIZE, "%s", "Select");
    result = create_action(input->action_set, &action_info, &input->select_action);
    if (XR_FAILED(result)) return result;
    action_info.actionType = XR_ACTION_TYPE_POSE_INPUT;
    snprintf(action_info.actionName, XR_MAX_ACTION_NAME_SIZE, "%s", "left_pose");
    snprintf(action_info.localizedActionName, XR_MAX_LOCALIZED_ACTION_NAME_SIZE, "%s", "Left Pose");
    result = create_action(input->action_set, &action_info, &input->left_pose);
    if (XR_FAILED(result)) return result;
    snprintf(action_info.actionName, XR_MAX_ACTION_NAME_SIZE, "%s", "right_pose");
    snprintf(action_info.localizedActionName, XR_MAX_LOCALIZED_ACTION_NAME_SIZE, "%s", "Right Pose");
    result = create_action(input->action_set, &action_info, &input->right_pose);
    if (XR_FAILED(result)) return result;
    action_info.actionType = XR_ACTION_TYPE_VIBRATION_OUTPUT;
    snprintf(action_info.actionName, XR_MAX_ACTION_NAME_SIZE, "%s", "haptic");
    snprintf(action_info.localizedActionName, XR_MAX_LOCALIZED_ACTION_NAME_SIZE, "%s", "Haptic");
    return create_action(input->action_set, &action_info, &input->haptic_action);
}

XrResult nexus_openxr_attach_actions(NexusOpenXrCore *core, NexusOpenXrInput *input) {
    if (!core || !input || input->action_set == XR_NULL_HANDLE) return XR_ERROR_VALIDATION_FAILURE;
    PFN_xrAttachSessionActionSets attach = NULL;
    XrResult result = nexus_openxr_proc(core->instance, "xrAttachSessionActionSets", (PFN_xrVoidFunction *)&attach);
    if (XR_FAILED(result)) return result;
    XrSessionActionSetsAttachInfo info = { XR_TYPE_SESSION_ACTION_SETS_ATTACH_INFO };
    info.countActionSets = 1;
    info.actionSets = &input->action_set;
    return attach(core->session, &info);
}

XrResult nexus_openxr_sync_actions(NexusOpenXrCore *core, NexusOpenXrInput *input) {
    PFN_xrSyncActions sync_actions = NULL;
    XrResult result = nexus_openxr_proc(core->instance, "xrSyncActions", (PFN_xrVoidFunction *)&sync_actions);
    if (XR_FAILED(result)) return result;
    XrActiveActionSet active = { input->action_set, XR_NULL_PATH };
    XrActionsSyncInfo info = { XR_TYPE_ACTIONS_SYNC_INFO };
    info.countActiveActionSets = 1;
    info.activeActionSets = &active;
    return sync_actions(core->session, &info);
}

XrResult nexus_openxr_read_select(NexusOpenXrCore *core, NexusOpenXrInput *input, XrBool32 *selected) {
    if (!core || !input || !selected) return XR_ERROR_VALIDATION_FAILURE;
    PFN_xrGetActionStateBoolean get_state = NULL;
    XrResult result = nexus_openxr_proc(core->instance, "xrGetActionStateBoolean", (PFN_xrVoidFunction *)&get_state);
    if (XR_FAILED(result)) return result;
    XrActionStateGetInfo info = { XR_TYPE_ACTION_STATE_GET_INFO };
    info.action = input->select_action;
    XrActionStateBoolean state = { XR_TYPE_ACTION_STATE_BOOLEAN };
    result = get_state(core->session, &info, &state);
    if (XR_SUCCEEDED(result)) *selected = state.isActive && state.currentState;
    return result;
}

XrResult nexus_openxr_apply_haptic(NexusOpenXrCore *core, NexusOpenXrInput *input, float amplitude, XrDuration duration) {
    PFN_xrApplyHapticFeedback apply = NULL;
    XrResult result = nexus_openxr_proc(core->instance, "xrApplyHapticFeedback", (PFN_xrVoidFunction *)&apply);
    if (XR_FAILED(result)) return result;
    XrHapticActionInfo action_info = { XR_TYPE_HAPTIC_ACTION_INFO };
    action_info.action = input->haptic_action;
    XrHapticVibration vibration = { XR_TYPE_HAPTIC_VIBRATION };
    vibration.amplitude = amplitude;
    vibration.duration = duration;
    vibration.frequency = XR_FREQUENCY_UNSPECIFIED;
    return apply(core->session, &action_info, (const XrHapticBaseHeader *)&vibration);
}
