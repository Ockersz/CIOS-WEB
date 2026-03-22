import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
export const UPLOAD_URL_PREFIX = "/uploads";
const MAX_OPTIMIZED_IMAGE_DIMENSION = 1920;
const OPTIMIZABLE_RASTER_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const MIME_EXTENSION_MAP = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
  "image/avif": ".avif",
  "application/octet-stream": ".bin",
};
const EXTENSION_MIME_MAP = Object.fromEntries(
  Object.entries(MIME_EXTENSION_MAP).map(([mimeType, extension]) => [extension, mimeType]),
);

export async function ensureUploadDirectory() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export function sanitizeDisplayName(value) {
  return String(value || "image")
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim() || "image";
}

export function slugifyFileName(value) {
  return sanitizeDisplayName(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "image";
}

function getExtensionFromMimeType(mimeType) {
  return MIME_EXTENSION_MAP[mimeType?.toLowerCase?.()] || "";
}

function getMimeTypeFromExtension(extension) {
  return EXTENSION_MIME_MAP[String(extension || "").toLowerCase()] || "";
}

function getExtensionFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const extension = path.extname(pathname);
    return extension ? extension.toLowerCase() : "";
  } catch {
    return "";
  }
}

function buildStoredFileName(baseName, extension) {
  return `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${slugifyFileName(baseName)}${extension || ".jpg"}`;
}

function buildContentHash(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function normalizeMimeType(mimeType, extensionHint = "") {
  const normalizedMimeType = String(mimeType || "").toLowerCase().trim();
  if (normalizedMimeType && normalizedMimeType !== "application/octet-stream") {
    return normalizedMimeType;
  }

  return getMimeTypeFromExtension(extensionHint) || "application/octet-stream";
}

function getOutputExtension(mimeType, fallbackExtension = "") {
  return getExtensionFromMimeType(mimeType) || fallbackExtension || ".bin";
}

async function optimizeImageBuffer(buffer, mimeType, extensionHint = "") {
  const normalizedMimeType = normalizeMimeType(mimeType, extensionHint);
  const normalizedExtension = getOutputExtension(normalizedMimeType, extensionHint);

  if (!OPTIMIZABLE_RASTER_MIME_TYPES.has(normalizedMimeType)) {
    return {
      buffer,
      mimeType: normalizedMimeType,
      extension: normalizedExtension,
    };
  }

  try {
    const source = sharp(buffer, { failOn: "none", limitInputPixels: false }).rotate();
    const metadata = await source.metadata();
    if (!metadata.width || !metadata.height) {
      return {
        buffer,
        mimeType: normalizedMimeType,
        extension: normalizedExtension,
      };
    }

    const resized = source.resize({
      width: MAX_OPTIMIZED_IMAGE_DIMENSION,
      height: MAX_OPTIMIZED_IMAGE_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    });
    const { data, info } = await resized
      .webp({
        quality: metadata.hasAlpha ? 86 : 82,
        alphaQuality: 90,
        effort: 4,
      })
      .toBuffer({ resolveWithObject: true });
    const wasResized = info.width < metadata.width || info.height < metadata.height;
    const shouldKeepOriginal = !wasResized && data.byteLength >= buffer.byteLength * 0.98;

    if (shouldKeepOriginal) {
      return {
        buffer,
        mimeType: normalizedMimeType,
        extension: normalizedExtension,
      };
    }

    return {
      buffer: data,
      mimeType: "image/webp",
      extension: ".webp",
    };
  } catch {
    return {
      buffer,
      mimeType: normalizedMimeType,
      extension: normalizedExtension,
    };
  }
}

function buildStoredAssetOutput(prepared, storedName) {
  return {
    storedName,
    url: `${UPLOAD_URL_PREFIX}/${storedName}`,
    mimeType: prepared.mimeType || "application/octet-stream",
    sizeBytes: prepared.buffer.byteLength,
    displayName: prepared.displayName,
    contentHash: prepared.contentHash,
  };
}

export function getUploadPath(storedName) {
  return path.join(UPLOAD_DIR, storedName);
}

export async function removeStoredImageAsset(storedName) {
  if (!storedName) return;
  await fs.rm(getUploadPath(storedName), { force: true });
}

export async function writePreparedImageAsset(prepared, options = {}) {
  await ensureUploadDirectory();
  const storedName =
    options.storedName || buildStoredFileName(prepared.displayName, prepared.extension);
  await fs.writeFile(getUploadPath(storedName), prepared.buffer);
  return buildStoredAssetOutput(prepared, storedName);
}

export async function prepareBinaryImageAsset(
  buffer,
  mimeType,
  preferredName,
  extensionHint = "",
) {
  if (!buffer || !buffer.byteLength) {
    throw new Error("Invalid image upload");
  }

  const normalizedBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  const effectiveExtension = extensionHint || path.extname(String(preferredName || ""));
  const optimized = await optimizeImageBuffer(
    normalizedBuffer,
    mimeType || "application/octet-stream",
    effectiveExtension,
  );

  return {
    buffer: optimized.buffer,
    mimeType: optimized.mimeType,
    extension: optimized.extension,
    displayName: sanitizeDisplayName(preferredName || "uploaded-image"),
    contentHash: buildContentHash(optimized.buffer),
  };
}

export async function prepareStoredImageAsset(storedName, mimeType, preferredName) {
  return prepareBinaryImageAsset(
    await fs.readFile(getUploadPath(storedName)),
    mimeType,
    preferredName || storedName,
    path.extname(storedName),
  );
}

async function writeBufferToUpload(buffer, mimeType, baseName, extensionHint = "") {
  return writePreparedImageAsset(
    await prepareBinaryImageAsset(buffer, mimeType, baseName, extensionHint),
  );
}

export async function saveBinaryImage(buffer, mimeType, preferredName) {
  if (!buffer || !buffer.byteLength) {
    throw new Error("Invalid image upload");
  }

  return writeBufferToUpload(
    Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer),
    mimeType || "application/octet-stream",
    preferredName || "uploaded-image",
  );
}

export async function saveDataUrlImage(dataUrl, preferredName) {
  return writePreparedImageAsset(await prepareDataUrlImageAsset(dataUrl, preferredName));
}

export async function prepareDataUrlImageAsset(dataUrl, preferredName) {
  const raw = String(dataUrl || "").trim();
  if (!raw.startsWith("data:")) {
    throw new Error("Invalid image upload");
  }

  const commaIndex = raw.indexOf(",");
  if (commaIndex === -1) {
    throw new Error("Invalid image upload");
  }

  const metadata = raw.slice(5, commaIndex);
  const base64 = raw.slice(commaIndex + 1);
  const parts = metadata.split(";");
  const mimeType = parts[0] || "application/octet-stream";
  const isBase64 = parts.some((part) => part.toLowerCase() === "base64");

  if (!isBase64 || !base64) {
    throw new Error("Invalid image upload");
  }

  const buffer = Buffer.from(base64, "base64");
  return prepareBinaryImageAsset(
    buffer,
    mimeType,
    preferredName || "uploaded-image",
    getExtensionFromMimeType(mimeType),
  );
}

export async function downloadRemoteImage(url, preferredName) {
  return writePreparedImageAsset(await prepareRemoteImageAsset(url, preferredName));
}

export async function prepareRemoteImageAsset(url, preferredName) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const mimeType = response.headers.get("content-type")?.split(";")[0] || "image/jpeg";
  const extensionHint = getExtensionFromUrl(url) || getExtensionFromMimeType(mimeType);
  return prepareBinaryImageAsset(
    buffer,
    mimeType,
    preferredName || "remote-image",
    extensionHint,
  );
}

export function inferImageNameFromUrl(url) {
  try {
    const parsed = new URL(url);
    const nameFromPath = path.basename(parsed.pathname).replace(/\.[a-z0-9]+$/i, "");
    return sanitizeDisplayName(nameFromPath || parsed.hostname || "image");
  } catch {
    return "image";
  }
}
