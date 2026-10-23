// Self-check for the e-ink bit packing. Run: node lib/eink.test.ts
import assert from "node:assert";
import { pack1bit } from "./eink.ts";

// 16x1: black, white, transparent-black, dark grey, then 12 white.
const px = (r: number, a = 255) => [r, r, r, a];
const rgba = new Uint8Array([
  ...px(0), ...px(255), ...px(0, 0), ...px(100),
  ...Array(12).fill(px(255)).flat(),
]);
assert.deepEqual([...pack1bit(rgba, 16, 1)], [0b10010000, 0]);

// Pixel 8 starts the second byte at its MSB.
rgba.set(px(0), 8 * 4);
assert.deepEqual([...pack1bit(rgba, 16, 1)], [0b10010000, 0b10000000]);

console.log("eink ok");
