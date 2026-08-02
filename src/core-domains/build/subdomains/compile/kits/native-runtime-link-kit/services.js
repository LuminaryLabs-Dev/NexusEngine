export function createNativeRuntimeLinkService() {
  return Object.freeze({
    plan({ target, generatedRuntime, openxrSource, quickJsSource = null }) {
      return Object.freeze({
        schema: "nexusengine.native-runtime-link/1",
        target,
        generatedRuntime,
        libraries: Object.freeze([openxrSource, ...(quickJsSource ? [quickJsSource] : [])]),
        arguments: Object.freeze([]),
        ready: Boolean(generatedRuntime && openxrSource)
      });
    }
  });
}

export default createNativeRuntimeLinkService;
