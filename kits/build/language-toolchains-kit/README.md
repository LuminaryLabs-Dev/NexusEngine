# Language toolchains

Optional Build-only profiles. Rust and Clang produce host executables; JavaScript, TypeScript and Python produce host modules with explicit interpreter dependencies. Profiles advertise only host-native development, not distributable APK or application packaging. C# has an explicit unvalidated-driver blocker. QuickJS and web runtime descriptors require prepared runtime providers; a pinned source alone is not a ready runtime.

Use `createBuildDomain({...createLanguageToolchains(),stateRoot})`, `planProgram`, `compileProgram(plan.id,{approvePlan:plan.id})`, then `runProgram(receipt.id,{approveReceipt:receipt.id})`. Nothing is downloaded or executed at import time. Compiling an exact snapshot and running its output are separate approved actions. Dependency installation and cross-platform support require additional validated drivers/providers.
