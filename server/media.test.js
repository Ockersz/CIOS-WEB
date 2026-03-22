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

test("prepareBinaryImageAsset keeps small transparent logo graphics lossless", async () => {
  const logoBuffer = await sharp({
    create: {
      width: 256,
      height: 256,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: Buffer.from(
          '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">' +
            '<circle cx="128" cy="128" r="96" fill="#d1ab25"/>' +
            '<path d="M80 128h96" stroke="#111111" stroke-width="18" stroke-linecap="round"/>' +
            "</svg>",
        ),
      },
    ])
    .png()
    .toBuffer();

  const prepared = await prepareBinaryImageAsset(logoBuffer, "image/png", "ciosdark");

  assert.equal(prepared.mimeType, "image/png");
  assert.equal(prepared.extension, ".png");
  assert.deepEqual(prepared.buffer, logoBuffer);
});

test("prepareBinaryImageAsset keeps named logo graphics lossless", async () => {
  const logoBuffer = await sharp({
    create: {
      width: 320,
      height: 120,
      channels: 3,
      background: { r: 250, g: 250, b: 250 },
    },
  })
    .composite([
      {
        input: Buffer.from(
          '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="120">' +
            '<rect width="320" height="120" fill="#fafafa"/>' +
            '<text x="24" y="76" font-size="54" font-family="Arial" fill="#1a1a1a">CIOS</text>' +
            "</svg>",
        ),
      },
    ])
    .png()
    .toBuffer();

  const prepared = await prepareBinaryImageAsset(
    logoBuffer,
    "image/png",
    "CIOS Dark Logo",
  );

  assert.equal(prepared.mimeType, "image/png");
  assert.equal(prepared.extension, ".png");
  assert.deepEqual(prepared.buffer, logoBuffer);
});

test("prepareBinaryImageAsset keeps ciosdark-style logo files high fidelity", async () => {
  const logoBuffer = await sharp({
    create: {
      width: 1400,
      height: 420,
      channels: 3,
      background: { r: 249, g: 249, b: 243 },
    },
  })
    .composite([
      {
        input: Buffer.from(
          '<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="420">' +
            '<rect width="1400" height="420" fill="#f9f9f3"/>' +
            '<text x="80" y="250" font-size="170" font-family="Arial" fill="#d1ab25">CIOS</text>' +
            "</svg>",
        ),
      },
    ])
    .png()
    .toBuffer();

  const prepared = await prepareBinaryImageAsset(logoBuffer, "image/png", "ciosdark");

  assert.equal(prepared.mimeType, "image/png");
  assert.equal(prepared.extension, ".png");
  assert.deepEqual(prepared.buffer, logoBuffer);
});
