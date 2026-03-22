import fs from "node:fs/promises";
import path from "node:path";
import { crc32, deflateRawSync, inflateRawSync } from "node:zlib";

const LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50;
const CENTRAL_DIRECTORY_HEADER_SIGNATURE = 0x02014b50;
const END_OF_CENTRAL_DIRECTORY_SIGNATURE = 0x06054b50;

const COMPRESSION_STORE = 0;
const COMPRESSION_DEFLATE = 8;

const VERSION_NEEDED = 20;
const VERSION_MADE_BY = 0x0314;
const UTF8_FLAG = 0x0800;
const DIRECTORY_ATTRIBUTE = 0x10;
const FILE_MODE = (0o100644 << 16) >>> 0;
const DIRECTORY_MODE = ((0o40755 << 16) | DIRECTORY_ATTRIBUTE) >>> 0;
const MAX_EOCD_COMMENT_LENGTH = 0xffff;

function toZipPath(inputPath, isDirectory = false) {
  const normalized = String(inputPath || "").replace(/\\/g, "/");
  const trimmed = normalized.replace(/^\/+/, "").replace(/\/+$/, "");
  return isDirectory ? `${trimmed}/` : trimmed;
}

function ensureSafeZipEntryName(entryName) {
  const normalized = String(entryName || "").replace(/\\/g, "/");
  const isDirectory = normalized.endsWith("/");
  const baseName = isDirectory ? normalized.slice(0, -1) : normalized;

  if (!baseName || baseName.startsWith("/") || /^[a-zA-Z]:/.test(baseName) || baseName.includes("\0")) {
    throw new Error("Invalid backup archive contents");
  }

  const parts = baseName.split("/");
  if (parts.some((part) => !part || part === "." || part === "..")) {
    throw new Error("Invalid backup archive contents");
  }

  return isDirectory ? `${parts.join("/")}/` : parts.join("/");
}

function getDosDateTime(input) {
  const date = input instanceof Date ? input : new Date(input);
  const year = Math.max(date.getFullYear(), 1980);
  const month = Math.min(Math.max(date.getMonth() + 1, 1), 12);
  const day = Math.min(Math.max(date.getDate(), 1), 31);
  const hours = Math.min(Math.max(date.getHours(), 0), 23);
  const minutes = Math.min(Math.max(date.getMinutes(), 0), 59);
  const seconds = Math.min(Math.max(Math.floor(date.getSeconds() / 2), 0), 29);

  return {
    dosDate: ((year - 1980) << 9) | (month << 5) | day,
    dosTime: (hours << 11) | (minutes << 5) | seconds,
  };
}

function buildLocalHeader({
  fileNameBuffer,
  compressionMethod,
  dosDate,
  dosTime,
  checksum,
  compressedSize,
  uncompressedSize,
}) {
  const header = Buffer.alloc(30 + fileNameBuffer.length);
  header.writeUInt32LE(LOCAL_FILE_HEADER_SIGNATURE, 0);
  header.writeUInt16LE(VERSION_NEEDED, 4);
  header.writeUInt16LE(UTF8_FLAG, 6);
  header.writeUInt16LE(compressionMethod, 8);
  header.writeUInt16LE(dosTime, 10);
  header.writeUInt16LE(dosDate, 12);
  header.writeUInt32LE(checksum, 14);
  header.writeUInt32LE(compressedSize, 18);
  header.writeUInt32LE(uncompressedSize, 22);
  header.writeUInt16LE(fileNameBuffer.length, 26);
  header.writeUInt16LE(0, 28);
  fileNameBuffer.copy(header, 30);
  return header;
}

function buildCentralDirectoryHeader({
  fileNameBuffer,
  compressionMethod,
  dosDate,
  dosTime,
  checksum,
  compressedSize,
  uncompressedSize,
  localHeaderOffset,
  externalAttributes,
}) {
  const header = Buffer.alloc(46 + fileNameBuffer.length);
  header.writeUInt32LE(CENTRAL_DIRECTORY_HEADER_SIGNATURE, 0);
  header.writeUInt16LE(VERSION_MADE_BY, 4);
  header.writeUInt16LE(VERSION_NEEDED, 6);
  header.writeUInt16LE(UTF8_FLAG, 8);
  header.writeUInt16LE(compressionMethod, 10);
  header.writeUInt16LE(dosTime, 12);
  header.writeUInt16LE(dosDate, 14);
  header.writeUInt32LE(checksum, 16);
  header.writeUInt32LE(compressedSize, 20);
  header.writeUInt32LE(uncompressedSize, 24);
  header.writeUInt16LE(fileNameBuffer.length, 28);
  header.writeUInt16LE(0, 30);
  header.writeUInt16LE(0, 32);
  header.writeUInt16LE(0, 34);
  header.writeUInt16LE(0, 36);
  header.writeUInt32LE(externalAttributes, 38);
  header.writeUInt32LE(localHeaderOffset, 42);
  fileNameBuffer.copy(header, 46);
  return header;
}

function buildEndOfCentralDirectory(entryCount, centralDirectorySize, centralDirectoryOffset) {
  const record = Buffer.alloc(22);
  record.writeUInt32LE(END_OF_CENTRAL_DIRECTORY_SIGNATURE, 0);
  record.writeUInt16LE(0, 4);
  record.writeUInt16LE(0, 6);
  record.writeUInt16LE(entryCount, 8);
  record.writeUInt16LE(entryCount, 10);
  record.writeUInt32LE(centralDirectorySize, 12);
  record.writeUInt32LE(centralDirectoryOffset, 16);
  record.writeUInt16LE(0, 20);
  return record;
}

async function collectEntriesFromDisk(diskPath, zipPath, entries) {
  const stats = await fs.lstat(diskPath);
  if (stats.isSymbolicLink()) {
    throw new Error("Backup archives do not support symbolic links");
  }

  if (stats.isDirectory()) {
    const directoryZipPath = ensureSafeZipEntryName(toZipPath(zipPath, true));
    entries.push({
      name: directoryZipPath,
      data: Buffer.alloc(0),
      isDirectory: true,
      modifiedAt: stats.mtime,
    });

    const children = await fs.readdir(diskPath, { withFileTypes: true });
    children.sort((left, right) => left.name.localeCompare(right.name));
    for (const child of children) {
      await collectEntriesFromDisk(
        path.join(diskPath, child.name),
        `${directoryZipPath}${child.name}`,
        entries,
      );
    }
    return;
  }

  if (!stats.isFile()) {
    throw new Error("Backup archives only support regular files and folders");
  }

  entries.push({
    name: ensureSafeZipEntryName(toZipPath(zipPath)),
    data: await fs.readFile(diskPath),
    isDirectory: false,
    modifiedAt: stats.mtime,
  });
}

function buildResolvedOutputPath(outputDir, entryName) {
  const baseOutputPath = path.resolve(outputDir);
  const relativePath = entryName.endsWith("/") ? entryName.slice(0, -1) : entryName;
  const segments = relativePath.split("/");
  const resolvedPath = path.resolve(baseOutputPath, ...segments);

  if (resolvedPath !== baseOutputPath && !resolvedPath.startsWith(`${baseOutputPath}${path.sep}`)) {
    throw new Error("Invalid backup archive contents");
  }

  return resolvedPath;
}

function extractEntryData(archive, entry) {
  const compressedData = archive.buffer.subarray(entry.dataOffset, entry.dataOffset + entry.compressedSize);

  if (entry.compressionMethod === COMPRESSION_STORE) {
    return Buffer.from(compressedData);
  }

  if (entry.compressionMethod === COMPRESSION_DEFLATE) {
    try {
      return inflateRawSync(compressedData);
    } catch {
      throw new Error(`Failed to extract backup entry: ${entry.name}`);
    }
  }

  throw new Error(`Unsupported backup compression method: ${entry.compressionMethod}`);
}

function findEndOfCentralDirectory(buffer) {
  const minimumOffset = Math.max(0, buffer.length - (22 + MAX_EOCD_COMMENT_LENGTH));
  for (let offset = buffer.length - 22; offset >= minimumOffset; offset -= 1) {
    if (
      buffer.readUInt32LE(offset) === END_OF_CENTRAL_DIRECTORY_SIGNATURE &&
      offset + 22 + buffer.readUInt16LE(offset + 20) === buffer.length
    ) {
      return offset;
    }
  }
  throw new Error("Invalid backup archive");
}

function readArchiveBuffer(input) {
  return Buffer.isBuffer(input) ? input : Buffer.from(input);
}

export async function createZipBufferFromPaths(baseDir, relativePaths) {
  const entries = [];
  for (const relativePath of relativePaths) {
    await collectEntriesFromDisk(path.join(baseDir, relativePath), relativePath, entries);
  }

  const localFileRecords = [];
  const centralDirectoryRecords = [];
  let localHeaderOffset = 0;

  for (const entry of entries) {
    const fileNameBuffer = Buffer.from(entry.name, "utf8");
    const uncompressedData = entry.data;
    const compressionMethod =
      entry.isDirectory || !uncompressedData.length ? COMPRESSION_STORE : COMPRESSION_DEFLATE;
    const compressedData =
      compressionMethod === COMPRESSION_DEFLATE ? deflateRawSync(uncompressedData) : uncompressedData;
    const checksum = crc32(uncompressedData) >>> 0;
    const { dosDate, dosTime } = getDosDateTime(entry.modifiedAt);
    const localHeader = buildLocalHeader({
      fileNameBuffer,
      compressionMethod,
      dosDate,
      dosTime,
      checksum,
      compressedSize: compressedData.length,
      uncompressedSize: uncompressedData.length,
    });

    localFileRecords.push(localHeader, compressedData);
    centralDirectoryRecords.push(
      buildCentralDirectoryHeader({
        fileNameBuffer,
        compressionMethod,
        dosDate,
        dosTime,
        checksum,
        compressedSize: compressedData.length,
        uncompressedSize: uncompressedData.length,
        localHeaderOffset,
        externalAttributes: entry.isDirectory ? DIRECTORY_MODE : FILE_MODE,
      }),
    );

    localHeaderOffset += localHeader.length + compressedData.length;
  }

  if (entries.length > 0xffff || localHeaderOffset > 0xffffffff) {
    throw new Error("Backup archive is too large to create");
  }

  const centralDirectoryBuffer = Buffer.concat(centralDirectoryRecords);
  if (centralDirectoryBuffer.length > 0xffffffff) {
    throw new Error("Backup archive is too large to create");
  }

  return Buffer.concat([
    ...localFileRecords,
    centralDirectoryBuffer,
    buildEndOfCentralDirectory(entries.length, centralDirectoryBuffer.length, localHeaderOffset),
  ]);
}

export function openZipArchive(input) {
  const buffer = readArchiveBuffer(input);
  if (!buffer.length) {
    throw new Error("Invalid backup archive");
  }

  const endOfCentralDirectoryOffset = findEndOfCentralDirectory(buffer);
  const diskNumber = buffer.readUInt16LE(endOfCentralDirectoryOffset + 4);
  const centralDirectoryDiskNumber = buffer.readUInt16LE(endOfCentralDirectoryOffset + 6);
  const entryCount = buffer.readUInt16LE(endOfCentralDirectoryOffset + 10);
  const centralDirectorySize = buffer.readUInt32LE(endOfCentralDirectoryOffset + 12);
  const centralDirectoryOffset = buffer.readUInt32LE(endOfCentralDirectoryOffset + 16);

  if (diskNumber !== 0 || centralDirectoryDiskNumber !== 0) {
    throw new Error("Multi-part backup archives are not supported");
  }

  if (centralDirectoryOffset + centralDirectorySize > buffer.length) {
    throw new Error("Invalid backup archive");
  }

  const entries = [];
  let cursor = centralDirectoryOffset;

  for (let index = 0; index < entryCount; index += 1) {
    if (cursor + 46 > buffer.length || buffer.readUInt32LE(cursor) !== CENTRAL_DIRECTORY_HEADER_SIGNATURE) {
      throw new Error("Invalid backup archive");
    }

    const flags = buffer.readUInt16LE(cursor + 8);
    const compressionMethod = buffer.readUInt16LE(cursor + 10);
    const checksum = buffer.readUInt32LE(cursor + 16);
    const compressedSize = buffer.readUInt32LE(cursor + 20);
    const uncompressedSize = buffer.readUInt32LE(cursor + 24);
    const fileNameLength = buffer.readUInt16LE(cursor + 28);
    const extraFieldLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const localHeaderOffset = buffer.readUInt32LE(cursor + 42);
    const recordSize = 46 + fileNameLength + extraFieldLength + commentLength;

    if (cursor + recordSize > buffer.length) {
      throw new Error("Invalid backup archive");
    }

    if (flags & 0x0001) {
      throw new Error("Encrypted backup archives are not supported");
    }

    const entryName = ensureSafeZipEntryName(
      buffer.subarray(cursor + 46, cursor + 46 + fileNameLength).toString("utf8"),
    );

    if (localHeaderOffset + 30 > buffer.length || buffer.readUInt32LE(localHeaderOffset) !== LOCAL_FILE_HEADER_SIGNATURE) {
      throw new Error("Invalid backup archive");
    }

    const localFileNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
    const localExtraFieldLength = buffer.readUInt16LE(localHeaderOffset + 28);
    const dataOffset = localHeaderOffset + 30 + localFileNameLength + localExtraFieldLength;
    const dataEnd = dataOffset + compressedSize;

    if (dataEnd > buffer.length) {
      throw new Error("Invalid backup archive");
    }

    entries.push({
      name: entryName,
      isDirectory: entryName.endsWith("/"),
      compressionMethod,
      checksum,
      compressedSize,
      uncompressedSize,
      dataOffset,
    });

    cursor += recordSize;
  }

  if (cursor !== centralDirectoryOffset + centralDirectorySize) {
    throw new Error("Invalid backup archive");
  }

  return { buffer, entries };
}

export function listZipEntries(archive) {
  return archive.entries.map((entry) => entry.name);
}

export async function extractZipArchive(archive, outputDir) {
  await fs.mkdir(outputDir, { recursive: true });

  for (const entry of archive.entries) {
    const outputPath = buildResolvedOutputPath(outputDir, entry.name);

    if (entry.isDirectory) {
      await fs.mkdir(outputPath, { recursive: true });
      continue;
    }

    const data = extractEntryData(archive, entry);
    if (data.length !== entry.uncompressedSize || (crc32(data) >>> 0) !== entry.checksum) {
      throw new Error(`Backup entry is corrupted: ${entry.name}`);
    }

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, data);
  }
}
