import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { crc32 } from "node:zlib";
import { createZipBufferFromPaths, extractZipArchive, listZipEntries, openZipArchive } from "./zip.js";

const LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50;
const CENTRAL_DIRECTORY_HEADER_SIGNATURE = 0x02014b50;
const END_OF_CENTRAL_DIRECTORY_SIGNATURE = 0x06054b50;

function buildStoredZip(entries) {
  const localRecords = [];
  const centralRecords = [];
  let localOffset = 0;

  for (const entry of entries) {
    const nameBuffer = Buffer.from(entry.name, "utf8");
    const data = entry.isDirectory ? Buffer.alloc(0) : Buffer.from(entry.data || "");
    const checksum = crc32(data) >>> 0;

    const localHeader = Buffer.alloc(30 + nameBuffer.length);
    localHeader.writeUInt32LE(LOCAL_FILE_HEADER_SIGNATURE, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(data.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(nameBuffer.length, 26);
    nameBuffer.copy(localHeader, 30);

    const centralHeader = Buffer.alloc(46 + nameBuffer.length);
    centralHeader.writeUInt32LE(CENTRAL_DIRECTORY_HEADER_SIGNATURE, 0);
    centralHeader.writeUInt16LE(0x0314, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt32LE(checksum, 16);
    centralHeader.writeUInt32LE(data.length, 20);
    centralHeader.writeUInt32LE(data.length, 24);
    centralHeader.writeUInt16LE(nameBuffer.length, 28);
    centralHeader.writeUInt32LE(entry.isDirectory ? 0x10 : 0, 38);
    centralHeader.writeUInt32LE(localOffset, 42);
    nameBuffer.copy(centralHeader, 46);

    localRecords.push(localHeader, data);
    centralRecords.push(centralHeader);
    localOffset += localHeader.length + data.length;
  }

  const centralDirectory = Buffer.concat(centralRecords);
  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(END_OF_CENTRAL_DIRECTORY_SIGNATURE, 0);
  endRecord.writeUInt16LE(entries.length, 8);
  endRecord.writeUInt16LE(entries.length, 10);
  endRecord.writeUInt32LE(centralDirectory.length, 12);
  endRecord.writeUInt32LE(localOffset, 16);

  return Buffer.concat([...localRecords, centralDirectory, endRecord]);
}

test("createZipBufferFromPaths creates a portable archive that round-trips", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "cios-zip-test-"));
  const sourceDir = path.join(tempRoot, "source");
  const extractedDir = path.join(tempRoot, "extracted");

  try {
    await fs.mkdir(path.join(sourceDir, "uploads", "nested"), { recursive: true });
    await fs.writeFile(path.join(sourceDir, "backup.sql"), "select 1;\n");
    await fs.writeFile(path.join(sourceDir, "manifest.json"), '{"type":"cios-backup"}\n');
    await fs.writeFile(path.join(sourceDir, "uploads", "file.txt"), "hello");
    await fs.writeFile(path.join(sourceDir, "uploads", "nested", "deep.txt"), "world");

    const zipBuffer = await createZipBufferFromPaths(sourceDir, ["backup.sql", "manifest.json", "uploads"]);
    const archive = openZipArchive(zipBuffer);

    assert.deepEqual(listZipEntries(archive), [
      "backup.sql",
      "manifest.json",
      "uploads/",
      "uploads/file.txt",
      "uploads/nested/",
      "uploads/nested/deep.txt",
    ]);

    await extractZipArchive(archive, extractedDir);

    assert.equal(
      await fs.readFile(path.join(extractedDir, "backup.sql"), "utf8"),
      "select 1;\n",
    );
    assert.equal(
      await fs.readFile(path.join(extractedDir, "uploads", "file.txt"), "utf8"),
      "hello",
    );
    assert.equal(
      await fs.readFile(path.join(extractedDir, "uploads", "nested", "deep.txt"), "utf8"),
      "world",
    );
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
});

test("openZipArchive reads a standard stored zip archive", async () => {
  const archive = openZipArchive(
    buildStoredZip([
      { name: "backup.sql", data: "select 1;\n" },
      { name: "uploads/", isDirectory: true },
      { name: "uploads/file.txt", data: "ok" },
    ]),
  );

  assert.deepEqual(listZipEntries(archive), ["backup.sql", "uploads/", "uploads/file.txt"]);
});

test("openZipArchive rejects unsafe paths", () => {
  assert.throws(
    () =>
      openZipArchive(
        buildStoredZip([
          { name: "../backup.sql", data: "select 1;\n" },
          { name: "uploads/", isDirectory: true },
        ]),
      ),
    /Invalid backup archive contents/,
  );
});
