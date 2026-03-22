import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import { prepareBinaryImageAsset, prepareDataUrlImageAsset } from "./media.js";

test("prepareBinaryImageAsset resizes large raster uploads and computes a hash", async () => {
  const input = await sharp({
    create: {
      width: 3200,
      height: 1800,
      channels: 3,
      background: { r: 42, g: 120, b: 84 },
    },
  })
    .jpeg({ quality: 96 })
    .toBuffer();
  const prepared = await prepareBinaryImageAsset(input, "image/jpeg", "Hero Banner.jpg");

  assert.equal(prepared.displayName, "Hero Banner");
  assert.equal(prepared.mimeType, "image/webp");
  assert.equal(prepared.extension, ".webp");
  assert.equal(prepared.contentHash.length, 64);
  assert.ok(prepared.buffer.byteLength < input.byteLength);

  const metadata = await sharp(prepared.buffer).metadata();
  assert.equal(metadata.width, 1920);
  assert.equal(metadata.height, 1080);
});

test("prepareDataUrlImageAsset accepts image data URLs", async () => {
  const pngBuffer = await sharp({
    create: {
      width: 64,
      height: 64,
      channels: 4,
      background: { r: 255, g: 200, b: 0, alpha: 1 },
    },
  })
    .png()
    .toBuffer();
  const prepared = await prepareDataUrlImageAsset(
    `data:image/png;base64,${pngBuffer.toString("base64")}`,
    "Badge",
  );

  assert.equal(prepared.displayName, "Badge");
  assert.equal(prepared.contentHash.length, 64);
  assert.ok(prepared.buffer.byteLength > 0);
});
