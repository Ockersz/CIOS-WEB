import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
export const UPLOAD_URL_PREFIX = "/uploads";

const MIME_EXTENSION_MAP = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
  "image/avif": ".avif",
};

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

async function writeBufferToUpload(buffer, mimeType, baseName, extensionHint = "") {
  await ensureUploadDirectory();
  const extension = extensionHint || getExtensionFromMimeType(mimeType) || ".jpg";
  const storedName = buildStoredFileName(baseName, extension);
  const outputPath = path.join(UPLOAD_DIR, storedName);
  await fs.writeFile(outputPath, buffer);

  return {
    storedName,
    url: `${UPLOAD_URL_PREFIX}/${storedName}`,
    mimeType: mimeType || "application/octet-stream",
    sizeBytes: buffer.byteLength,
    displayName: sanitizeDisplayName(baseName),
  };
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
  return writeBufferToUpload(buffer, mimeType, preferredName || "uploaded-image");
}

export async function downloadRemoteImage(url, preferredName) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const mimeType = response.headers.get("content-type")?.split(";")[0] || "image/jpeg";
  const extensionHint = getExtensionFromUrl(url) || getExtensionFromMimeType(mimeType);

  return writeBufferToUpload(buffer, mimeType, preferredName || "remote-image", extensionHint);
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
