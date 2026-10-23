// RGBA pixels -> the panel's 1-bit framebuffer: row-major, MSB first, 1 = black.
// That is the layout Adafruit GFX's drawBitmap() reads, so the firmware blits
// the bytes as they arrive. Width must be a multiple of 8 (the panel is 800).
export function pack1bit(rgba: Uint8Array, w: number, h: number): Uint8Array {
  const out = new Uint8Array((w / 8) * h);
  for (let i = 0; i < w * h; i++) {
    const r = rgba[i * 4], a = rgba[i * 4 + 3];
    // ponytail: hard 50% threshold on red, no dithering; the layout is black on white
    if (a >= 128 && r < 128) out[i >> 3] |= 0x80 >> (i & 7);
  }
  return out;
}
