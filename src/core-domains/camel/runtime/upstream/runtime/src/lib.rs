pub mod language;
#[cfg(not(target_arch = "wasm32"))]
pub use camel_library_manager as libraries;
#[cfg(not(target_arch = "wasm32"))]
include!("native.rs");
#[cfg(target_arch = "wasm32")]
mod browser_host;
#[cfg(target_arch = "wasm32")]
pub use browser_host::*;
