// Browser target has no implicit OS, audio, library-manager or network access.
use std::path::{Path, PathBuf};
#[derive(Debug, Clone)]
pub struct AudioInput { pub path: PathBuf, pub format: String, pub data_base64: String }
impl AudioInput {
 pub fn from_path(_: &Path, _: &str) -> Result<Self, String> { Err("Browser audio/filesystem capability unavailable".into()) }
 pub fn save_wav(&self, _: &Path) -> Result<(), String> { Err("Browser filesystem capability unavailable".into()) }
}
pub fn record_microphone(_: Option<u64>) -> Result<AudioInput, String> { Err("Browser microphone capability unavailable".into()) }
#[link(wasm_import_module = "camel")]
unsafe extern "C" { fn now() -> f64; }
pub fn browser_now() -> f64 { unsafe { now() } }
