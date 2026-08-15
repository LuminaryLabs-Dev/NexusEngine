import { lstat, mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { assertInside, contentIntegrity, requireText, stableValue } from "../../../contracts.js";

async function fetchCanonicalSource(record) {
  if (!/^https:\/\//.test(record.canonicalLocator)) {
    throw new TypeError(`Canonical source must use HTTPS: ${record.id}.`);
  }
  const response = await fetch(record.canonicalLocator, { redirect: "follow" });
  if (!response.ok) throw new Error(`Unable to retrieve ${record.id}: HTTP ${response.status}.`);
  return Object.freeze({ bytes: new Uint8Array(await response.arrayBuffer()), integrity: record.integrity });
}

function archiveEntries(stdout, record) {
  const entries = stdout.split(/\r?\n/).filter(Boolean);
  if (!entries.length) throw new Error(`Source archive is empty: ${record.id}.`);
  for (const entry of entries) {
    const normalized = entry.replaceAll("\\", "/");
    if (normalized.startsWith("/") || normalized.split("/").includes("..")) {
      throw new Error(`Source archive path escape: ${record.id}.`);
    }
  }
  return entries;
}

async function rejectLinks(root) {
  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    const pathname = path.join(root, entry.name);
    const info = await lstat(pathname);
    if (info.isSymbolicLink()) throw new Error(`Source archive contains a symbolic link: ${entry.name}.`);
    if (info.isDirectory()) await rejectLinks(pathname);
  }
}

export function createToolchainProvisionService(config = {}) {
  const cache = config.cache;
  if (!cache) throw new TypeError("Toolchain provision service requires a source cache.");
  const fetchSource = config.fetchSource ?? fetchCanonicalSource;
  const processExecution = config.processExecution;

  async function provision(record, options = {}) {
      if (record.resolutionStatus === "resolved" && record.integrity && await cache.has(record.integrity)) {
        return Object.freeze({ status: "cached", record, path: cache.path(record.integrity) });
      }
      if (options.allowNetwork !== true) {
        return Object.freeze({ status: "approval-required", record, reason: "network-provisioning-disabled" });
      }
      if (!record.license || !(options.acceptedLicenses ?? []).includes(record.license)) {
        return Object.freeze({ status: "license-approval-required", record, license: record.license });
      }
      const result = await fetchSource(record, options);
      const bytes = result?.bytes;
      if (!(bytes instanceof Uint8Array)) throw new TypeError(`Source provider returned no bytes for ${record.id}.`);
      const actualIntegrity = contentIntegrity(bytes);
      const expectedIntegrity = requireText(result.integrity ?? record.integrity, `Resolved ${record.id} integrity`);
      if (actualIntegrity !== expectedIntegrity) throw new Error(`Resolved source integrity mismatch for ${record.id}.`);
      const cached = await cache.put(bytes, expectedIntegrity);
      return Object.freeze({ status: "provisioned", record: { ...record, integrity: expectedIntegrity, resolutionStatus: "resolved" }, path: cached.path });
  }

  async function materialize(record, options = {}) {
    if (!processExecution) throw new Error("Toolchain archive materialization requires process execution.");
    const provisioned = await provision(record, options);
    if (!["cached", "provisioned"].includes(provisioned.status)) return provisioned;
    const destination = assertInside(processExecution.allowedRoot, requireText(options.destination, "Toolchain destination"), "Toolchain destination");
    const receiptPath = path.join(destination, "nexusengine-source.json");
    try {
      const receipt = JSON.parse(await readFile(receiptPath, "utf8"));
      if (receipt.source.id !== record.id || receipt.source.integrity !== record.integrity) {
        throw new Error(`Materialized source identity conflict: ${record.id}.`);
      }
      return Object.freeze({ status: "cached", record, path: destination, receipt });
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
    const temporary = `${destination}.${process.pid}.${Date.now()}.tmp`;
    await mkdir(path.dirname(destination), { recursive: true });
    await mkdir(temporary, { recursive: false });
    const listed = await processExecution.run("tar", ["-tzf", provisioned.path], { cwd: temporary });
    if (!listed.ok) throw new Error(`Unable to inspect ${record.id}: ${listed.stderr || listed.error}.`);
    archiveEntries(listed.stdout, record);
    const extracted = await processExecution.run("tar", ["-xzf", provisioned.path, "-C", temporary, "--strip-components=1"], { cwd: temporary });
    if (!extracted.ok) throw new Error(`Unable to extract ${record.id}: ${extracted.stderr || extracted.error}.`);
    await rejectLinks(temporary);
    const receipt = Object.freeze({
      schema: "nexusengine.build-materialized-source/1",
      source: record,
      archiveIntegrity: record.integrity
    });
    await writeFile(path.join(temporary, "nexusengine-source.json"), `${JSON.stringify(stableValue(receipt), null, 2)}\n`);
    await rename(temporary, destination).catch(async (error) => {
      if (error?.code !== "EEXIST" && error?.code !== "ENOTEMPTY") throw error;
      const existing = JSON.parse(await readFile(receiptPath, "utf8"));
      if (existing.source.id !== record.id || existing.source.integrity !== record.integrity) throw error;
    });
    return Object.freeze({ status: provisioned.status, record, path: destination, receipt });
  }

  return Object.freeze({ provision, materialize });
}

export default createToolchainProvisionService;
