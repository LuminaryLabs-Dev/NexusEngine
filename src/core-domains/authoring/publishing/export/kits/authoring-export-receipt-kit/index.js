import { createAuthoringIOKit } from "../../../../contracts/io-kit.js";
import { installExportReceipt } from '../../services.js';
import manifest from './kit.manifest.js';
export function createAuthoringExportReceiptKit(config={}) { return createAuthoringIOKit(manifest, installExportReceipt, config); }
