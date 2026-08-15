#include "nexus_openxr_host.h"

#include <stdio.h>
#include <string.h>

#if defined(_WIN32)
#include <windows.h>
static HMODULE nexus_loader;
#define NEXUS_LIBRARY_NAME "openxr_loader.dll"
#else
#include <dlfcn.h>
static void *nexus_loader;
#if defined(__ANDROID__)
#define NEXUS_LIBRARY_NAME "libopenxr_loader.so"
#else
#define NEXUS_LIBRARY_NAME "libopenxr_loader.so.1"
#endif
#endif

static PFN_xrGetInstanceProcAddr nexus_get_instance_proc_addr;

int nexus_openxr_contract_validate(void) {
    return XR_CURRENT_API_VERSION >= XR_MAKE_VERSION(1, 0, 0)
        && sizeof(XrView) > 0
        && sizeof(XrFrameState) > 0
        && sizeof(NexusOpenXrCore) > 0;
}

XrResult nexus_openxr_load(void) {
    if (nexus_get_instance_proc_addr) return XR_SUCCESS;
#if defined(_WIN32)
    nexus_loader = LoadLibraryA(NEXUS_LIBRARY_NAME);
    if (!nexus_loader) return XR_ERROR_RUNTIME_UNAVAILABLE;
    nexus_get_instance_proc_addr = (PFN_xrGetInstanceProcAddr)GetProcAddress(nexus_loader, "xrGetInstanceProcAddr");
#else
    nexus_loader = dlopen(NEXUS_LIBRARY_NAME, RTLD_NOW | RTLD_LOCAL);
    if (!nexus_loader) return XR_ERROR_RUNTIME_UNAVAILABLE;
    nexus_get_instance_proc_addr = (PFN_xrGetInstanceProcAddr)dlsym(nexus_loader, "xrGetInstanceProcAddr");
#endif
    return nexus_get_instance_proc_addr ? XR_SUCCESS : XR_ERROR_FUNCTION_UNSUPPORTED;
}

XrResult nexus_openxr_proc(XrInstance instance, const char *name, PFN_xrVoidFunction *function) {
    XrResult loaded = nexus_openxr_load();
    if (XR_FAILED(loaded)) return loaded;
    return nexus_get_instance_proc_addr(instance, name, function);
}

XrResult nexus_openxr_create_instance(NexusOpenXrCore *core, const char *application_name) {
    if (!core || !application_name) return XR_ERROR_VALIDATION_FAILURE;
    PFN_xrCreateInstance create_instance = NULL;
    XrResult result = nexus_openxr_proc(XR_NULL_HANDLE, "xrCreateInstance", (PFN_xrVoidFunction *)&create_instance);
    if (XR_FAILED(result)) return result;
    XrInstanceCreateInfo info = { XR_TYPE_INSTANCE_CREATE_INFO };
    snprintf(info.applicationInfo.applicationName, XR_MAX_APPLICATION_NAME_SIZE, "%s", application_name);
    snprintf(info.applicationInfo.engineName, XR_MAX_ENGINE_NAME_SIZE, "%s", "NexusEngine");
    info.applicationInfo.applicationVersion = 4;
    info.applicationInfo.engineVersion = 4;
    info.applicationInfo.apiVersion = XR_CURRENT_API_VERSION;
    result = create_instance(&info, &core->instance);
    if (XR_FAILED(result)) return result;
    PFN_xrGetSystem get_system = NULL;
    result = nexus_openxr_proc(core->instance, "xrGetSystem", (PFN_xrVoidFunction *)&get_system);
    if (XR_FAILED(result)) return result;
    XrSystemGetInfo system_info = { XR_TYPE_SYSTEM_GET_INFO };
    system_info.formFactor = XR_FORM_FACTOR_HEAD_MOUNTED_DISPLAY;
    return get_system(core->instance, &system_info, &core->system_id);
}

XrResult nexus_openxr_create_session(NexusOpenXrCore *core, const void *graphics_binding) {
    if (!core || core->instance == XR_NULL_HANDLE || core->system_id == XR_NULL_SYSTEM_ID || !graphics_binding) {
        return XR_ERROR_VALIDATION_FAILURE;
    }
    PFN_xrCreateSession create_session = NULL;
    XrResult result = nexus_openxr_proc(core->instance, "xrCreateSession", (PFN_xrVoidFunction *)&create_session);
    if (XR_FAILED(result)) return result;
    XrSessionCreateInfo info = { XR_TYPE_SESSION_CREATE_INFO };
    info.next = graphics_binding;
    info.systemId = core->system_id;
    return create_session(core->instance, &info, &core->session);
}

XrResult nexus_openxr_create_local_space(NexusOpenXrCore *core) {
    PFN_xrCreateReferenceSpace create_space = NULL;
    XrResult result = nexus_openxr_proc(core->instance, "xrCreateReferenceSpace", (PFN_xrVoidFunction *)&create_space);
    if (XR_FAILED(result)) return result;
    XrReferenceSpaceCreateInfo info = { XR_TYPE_REFERENCE_SPACE_CREATE_INFO };
    info.referenceSpaceType = XR_REFERENCE_SPACE_TYPE_LOCAL;
    info.poseInReferenceSpace.orientation.w = 1.0f;
    return create_space(core->session, &info, &core->local_space);
}

XrResult nexus_openxr_poll_event(NexusOpenXrCore *core, int *should_exit) {
    if (!core || core->instance == XR_NULL_HANDLE || !should_exit) return XR_ERROR_VALIDATION_FAILURE;
    *should_exit = 0;
    PFN_xrPollEvent poll_event = NULL;
    XrResult result = nexus_openxr_proc(core->instance, "xrPollEvent", (PFN_xrVoidFunction *)&poll_event);
    if (XR_FAILED(result)) return result;
    XrEventDataBuffer event = { XR_TYPE_EVENT_DATA_BUFFER };
    result = poll_event(core->instance, &event);
    if (result == XR_EVENT_UNAVAILABLE) return result;
    if (XR_FAILED(result)) return result;
    if (event.type != XR_TYPE_EVENT_DATA_SESSION_STATE_CHANGED) return XR_SUCCESS;
    const XrEventDataSessionStateChanged *changed = (const XrEventDataSessionStateChanged *)&event;
    core->session_state = changed->state;
    if (changed->state == XR_SESSION_STATE_READY) {
        PFN_xrBeginSession begin_session = NULL;
        result = nexus_openxr_proc(core->instance, "xrBeginSession", (PFN_xrVoidFunction *)&begin_session);
        if (XR_FAILED(result)) return result;
        XrSessionBeginInfo info = { XR_TYPE_SESSION_BEGIN_INFO };
        info.primaryViewConfigurationType = XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO;
        return begin_session(core->session, &info);
    }
    if (changed->state == XR_SESSION_STATE_STOPPING) {
        PFN_xrEndSession end_session = NULL;
        result = nexus_openxr_proc(core->instance, "xrEndSession", (PFN_xrVoidFunction *)&end_session);
        return XR_FAILED(result) ? result : end_session(core->session);
    }
    if (changed->state == XR_SESSION_STATE_EXITING || changed->state == XR_SESSION_STATE_LOSS_PENDING) *should_exit = 1;
    return XR_SUCCESS;
}

void nexus_openxr_shutdown(NexusOpenXrCore *core) {
    if (!core) return;
    PFN_xrDestroySpace destroy_space = NULL;
    PFN_xrDestroySession destroy_session = NULL;
    PFN_xrDestroyInstance destroy_instance = NULL;
    if (core->instance != XR_NULL_HANDLE) {
        nexus_openxr_proc(core->instance, "xrDestroySpace", (PFN_xrVoidFunction *)&destroy_space);
        nexus_openxr_proc(core->instance, "xrDestroySession", (PFN_xrVoidFunction *)&destroy_session);
        nexus_openxr_proc(core->instance, "xrDestroyInstance", (PFN_xrVoidFunction *)&destroy_instance);
    }
    if (destroy_space && core->local_space != XR_NULL_HANDLE) destroy_space(core->local_space);
    if (destroy_session && core->session != XR_NULL_HANDLE) destroy_session(core->session);
    if (destroy_instance && core->instance != XR_NULL_HANDLE) destroy_instance(core->instance);
    memset(core, 0, sizeof(*core));
}

#if defined(__ANDROID__)
#include <jni.h>
JNIEXPORT jint JNICALL Java_dev_luminarylabs_nexusengine_MainActivity_nativeValidatePackage(JNIEnv *env, jclass type) {
    (void)env;
    (void)type;
    return nexus_openxr_contract_validate() && nexus_openxr_input_contract_validate() && nexus_openxr_render_contract_validate();
}
#endif

#if defined(NEXUS_OPENXR_STANDALONE)
int main(int argc, char **argv) {
    if (argc == 2 && strcmp(argv[1], "--validate-package") == 0) {
        const int valid = nexus_openxr_contract_validate() && nexus_openxr_input_contract_validate() && nexus_openxr_render_contract_validate();
        printf("{\"schema\":\"nexusengine.openxr-package-validation/1\",\"valid\":%s,\"hardware\":false}\n", valid ? "true" : "false");
        return valid ? 0 : 2;
    }
    fprintf(stderr, "Pass --validate-package for no-runtime package validation.\n");
    return 3;
}
#endif
