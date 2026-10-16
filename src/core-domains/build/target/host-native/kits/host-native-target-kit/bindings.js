/** One lowering record generates both sides of the numeric synchronous contract. */
export function nativeBindings(exports) {
  if (exports.some((record) => record.parameters.length > 8))
    throw new Error("Native bridge supports at most eight numeric arguments.");
  const declarations = exports
    .map(
      (record) =>
        `extern "C" double ${record.symbol}(${record.parameters.map(() => "double").join(",")});`,
    )
    .join("\n");
  const callbacks = exports
    .map(
      (record, index) => `
static napi_value invoke_${index}(napi_env env, napi_callback_info info) {
  size_t argc = ${record.parameters.length + 1}; napi_value args[${record.parameters.length + 1}];
  if(napi_get_cb_info(env,info,&argc,args,nullptr,nullptr)!=napi_ok || argc!=${record.parameters.length}) { napi_throw_type_error(env,nullptr,"Wrong native contract arity"); return nullptr; }
  double values[${Math.max(1, record.parameters.length)}];
  for(size_t i=0;i<argc;i++) if(napi_get_value_double(env,args[i],&values[i])!=napi_ok) { napi_throw_type_error(env,nullptr,"Native contract requires numbers"); return nullptr; }
  double value = ${record.symbol}(${record.parameters.map((_, i) => `values[${i}]`).join(",")});
  napi_value output; napi_create_double(env,value,&output); return output;
}`,
    )
    .join("\n");
  const registrations = exports
    .map(
      (record, index) =>
        `{ napi_value fn; napi_create_function(env,${JSON.stringify(record.symbol)},NAPI_AUTO_LENGTH,invoke_${index},nullptr,&fn); napi_set_named_property(env,exports,${JSON.stringify(record.symbol)},fn); }`,
    )
    .join("\n");
  return `#include <node_api.h>\n${declarations}\n${callbacks}\nNAPI_MODULE_INIT() { ${registrations} return exports; }\n`;
}

export function moduleFacade(modulePath, exports, addonRelative) {
  const selected = exports.filter((record) => record.modulePath === modulePath);
  const header = `import { createRequire } from 'node:module';\nconst native = createRequire(import.meta.url)(${JSON.stringify(addonRelative)});\nexport const nexusBuildMode = 'native';\n`;
  return (
    header +
    selected
      .map(
        (record) =>
          `export function ${record.name}(${record.parameters.map((_, i) => `arg${i}`).join(",")}) { return native[${JSON.stringify(record.symbol)}](...arguments); }`,
      )
      .join("\n") +
    "\n"
  );
}
