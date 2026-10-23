# Code authoring and language toolchains

Authoring Code owns code documents and revisioned text operations. Authoring Project remains the sole transaction, undo/redo, receipt and persistence owner. Portable Code intelligence records revision-bound requests and derived results; it never starts a language server. Reset clears transient requests without erasing source.

Build Toolchain now registers immutable descriptors, resolves host/target/version constraints and transitive runtime requirements, and reports ambiguous or unavailable choices. Discovery probes registered commands; provisioning still uses exact source identities and the existing explicit network/license approvals. The Compiler Driver consumes an immutable exported source snapshot, requires approval of its retained plan, uses a fresh isolated attempt, rechecks the selected toolchain and records output integrity. Running the output requires separate receipt approval. This host-development program route is exposed as `planProgram`, `compileProgram`, and `runProgram`; it does not replace platform packaging or imply new APK/Flatpak support.

```js
import {createEngine} from 'nexusengine';
import {createAuthoringDomain} from 'nexusengine/domains/authoring';
import {createBuildDomain} from 'nexusengine/domains/build';
import {createLanguageToolchains} from 'nexusengine/kits/build/language-toolchains';
const engine=createEngine({kits:createAuthoringDomain()});
const project=engine.n.authoringProject;
project.execute({requestId:'create-code',epoch:project.context().epoch,operations:[
 {id:'code.set',args:{id:'main',content:{path:'main.rs',language:'rust',text:'fn main(){println!("Nexus");}'}}}
]});
const source=engine.n.authoringCode.exportFiles();
const build=createBuildDomain({...createLanguageToolchains(),stateRoot:'/absolute/external-build-state'});
const plan=build.planProgram({projectRoot:'/absolute/project',entry:'main.rs',files:source.files.map(f=>({path:f.path,content:f.text})),toolchain:{language:'rust',host:process.platform+'-'+process.arch,target:'host-native'}});
// Show requirements and approve this exact plan before calling compileProgram.
```

`code.edit` accepts UTF-16 offset edits. Overlap, split surrogate pairs, unsafe paths, unsupported encoding and stale revisions fail. `code.apply-edits` applies a bounded list of document changes as one Project transaction. Each member requires its current revision. UTF-8 source content and declared LF/CRLF/preserve newline policies survive roundtrip. Export rejects case-conflicting source paths. `code.rename` changes the logical path through Project; it does not rename external files.

Intelligence requests capture the complete code workspace identity. `accept` returns stale if any source changes; `apply` submits only current proposed edits through Project. Formatting/refactoring results remain proposals until explicit apply. Providers must translate their ranges into the documented UTF-16 offsets. No compiler/interpreter provider is trusted to mutate Authoring source.

Optional profiles: Rust/Clang host compilation, JS/TS host modules with Node runtime, Python host modules with Python runtime. C# advertises an unavailable driver until implemented/validated. QuickJS and web-host descriptors are unavailable until actual providers are prepared. Toolchain registration is not general JavaScript-to-Rust translation. No installation, network download or browser rendering is performed by import or registration.

The optional IDE host composes these APIs with a loopback editor. Its authorization callback controls disk reads/writes and processes. Save conflicts preserve external edits; Project snapshots reopen the session. Noninteractive terminal argument arrays, read-only Git status/diff and configurable LSP/DAP transports are host adapters. Full PTY and debugger widgets are not claimed. The visible first slice covers edit, diagnostics, language queries, format, source persistence, build and run.

Validate through `Auditor/validation.toolchain-code.json` with the separately installed Nexus Audit Kit. The checked-out source fingerprint, selected external Auditor pin and real compiler receipts belong in the run report. Source/runtime, visible editor, and third-party LSP/DAP evidence remain separate.
