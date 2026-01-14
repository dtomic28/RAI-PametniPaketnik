const sharp = require("sharp");

const K_ZIGZAG = [
  0, 1, 8, 16, 9, 2, 3, 10, 17, 24, 32, 25, 18, 11, 4, 5, 12, 19, 26, 33, 40,
  48, 41, 34, 27, 20, 13, 6, 7, 14, 21, 28, 35, 42, 49, 56, 57, 50, 43, 36, 29,
  22, 15, 23, 30, 37, 44, 51, 58, 59, 52, 45, 38, 31, 39, 46, 53, 60, 61, 54,
  47, 55, 62, 63,
];

const K_TRIMASK = [
  [15, 14, 13, 12, 11, 10, 9, 8],
  [14, 13, 12, 11, 10, 9, 8, 7],
  [13, 12, 11, 10, 9, 8, 7, 6],
  [12, 11, 10, 9, 8, 7, 6, 5],
  [11, 10, 9, 8, 7, 6, 5, 4],
  [10, 9, 8, 7, 6, 5, 4, 3],
  [9, 8, 7, 6, 5, 4, 3, 2],
  [8, 7, 6, 5, 4, 3, 2, 1],
];

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

function toTwos(v, bits) {
  const mask = bits === 64 ? BigInt("0xFFFFFFFFFFFFFFFF") : (1n << BigInt(bits)) - 1n;
  if (v < 0) {
    const pos = BigInt(-v);
    return (~pos + 1n) & mask;
  }
  return BigInt(v) & mask;
}

function fromTwos(u, bits) {
  if (bits <= 0) return 0;
  const mask = bits === 64 ? BigInt("0xFFFFFFFFFFFFFFFF") : (1n << BigInt(bits)) - 1n;
  u &= mask;
  const sign = 1n << BigInt(bits - 1);
  if (u & sign) {
    const extended = u | ~mask;
    return Number(extended);
  }
  return Number(u);
}

function bitsForSigned(v, maxBits = 13) {
  for (let b = 1; b <= maxBits; b++) {
    if (fromTwos(toTwos(v, b), b) === v) return b;
  }
  return maxBits;
}

class BitWriter {
  constructor() {
    this.bytes = [];
    this.buf = 0;
    this.cnt = 0;
  }
  writeBit(b) {
    this.buf = (this.buf << 1) | (b & 1);
    this.cnt++;
    if (this.cnt === 8) {
      this.bytes.push(this.buf);
      this.buf = 0;
      this.cnt = 0;
    }
  }
  writeBitsBig(vBig, n) {
    for (let i = n - 1; i >= 0; i--) {
      const bit = (vBig >> BigInt(i)) & 1n;
      this.writeBit(Number(bit));
    }
  }
  writeBitsNumber(v, n) {
    for (let i = n - 1; i >= 0; i--) this.writeBit((v >> i) & 1);
  }
  finish() {
    if (this.cnt) {
      this.buf <<= 8 - this.cnt;
      this.bytes.push(this.buf);
      this.buf = 0;
      this.cnt = 0;
    }
    return Buffer.from(this.bytes);
  }
}

class BitReader {
  constructor(buf, offsetBytes = 0) {
    this.buf = buf;
    this.bytePos = offsetBytes;
    this.bitBuf = 0;
    this.cnt = 0;
  }
  fill() {
    if (this.bytePos >= this.buf.length) return false;
    this.bitBuf = this.buf[this.bytePos++];
    this.cnt = 8;
    return true;
  }
  readBit() {
    if (this.cnt === 0 && !this.fill()) return null;
    this.cnt--;
    return (this.bitBuf >> this.cnt) & 1;
  }
  readBits(n) {
    let v = 0n;
    for (let i = 0; i < n; i++) {
      const bit = this.readBit();
      if (bit === null) return null;
      v = (v << 1n) | BigInt(bit);
    }
    return v;
  }
}

function buildDctMatrix() {
  const C = Array.from({ length: 8 }, () => Array(8).fill(0));
  for (let u = 0; u < 8; u++) {
    const alpha = u === 0 ? 1 / Math.sqrt(8) : Math.sqrt(2 / 8);
    for (let x = 0; x < 8; x++) {
      C[u][x] = alpha * Math.cos(((2 * x + 1) * u * Math.PI) / 16);
    }
  }
  return C;
}
const C = buildDctMatrix();
const CT = Array.from({ length: 8 }, (_, i) => Array.from({ length: 8 }, (_, j) => C[j][i]));

function matMul8(A, B) {
  const out = Array.from({ length: 8 }, () => Array(8).fill(0));
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      let s = 0;
      for (let k = 0; k < 8; k++) s += A[i][k] * B[k][j];
      out[i][j] = s;
    }
  }
  return out;
}

function dct2(block) {
  return matMul8(matMul8(C, block), CT);
}
function idct2(coeff) {
  return matMul8(matMul8(CT, coeff), C);
}

function applyTriangularZeroing(block, factor) {
  if (factor <= 0) return;
  for (let u = 0; u < 8; u++) {
    for (let v = 0; v < 8; v++) {
      const mark = K_TRIMASK[u][v];
      if (factor >= 15 || (mark >= 1 && factor >= mark)) block[u][v] = 0;
    }
  }
}

function blockToZigZagInts(coeff) {
  const out = new Array(64).fill(0);
  for (let k = 0; k < 64; k++) {
    const idx = K_ZIGZAG[k];
    const u = Math.floor(idx / 8);
    const v = idx % 8;
    out[k] = Math.round(coeff[u][v]);
  }
  return out;
}

function zigZagIntsToBlock(zz) {
  const b = Array.from({ length: 8 }, () => Array(8).fill(0));
  for (let k = 0; k < 64; k++) {
    const idx = K_ZIGZAG[k];
    const u = Math.floor(idx / 8);
    const v = idx % 8;
    b[u][v] = zz[k];
  }
  return b;
}

function encodeBlock(zz, bw) {
  const dc = clamp(zz[0] | 0, -2040, 2040);
  bw.writeBitsBig(toTwos(dc, 12), 12);

  let i = 1;
  while (i < 64) {
    let run = 0;
    while (i + run < 64 && zz[i + run] === 0) run++;

    if (i + run >= 64) {
      bw.writeBit(0);
      bw.writeBitsNumber(run, 6);
      i += run;
      break;
    }

    const ac = clamp(zz[i + run] | 0, -4080, 4080);
    const L = clamp(bitsForSigned(ac, 13), 1, 13);

    bw.writeBit(0);
    bw.writeBitsNumber(run, 6);
    bw.writeBitsNumber(L, 4);
    bw.writeBitsBig(toTwos(ac, L), L);

    i += run + 1;
  }
}

function decodeBlock(br) {
  const zz = new Array(64).fill(0);
  const u = br.readBits(12);
  if (u === null) return null;
  zz[0] = fromTwos(u, 12);

  let count = 1;
  while (count < 64) {
    const flag = br.readBit();
    if (flag === null) return null;

    if (flag === 0) {
      const run = br.readBits(6);
      if (run === null) return null;

      if (count + Number(run) >= 64) {
        for (let k = 0; k < Number(run) && count < 64; k++) zz[count++] = 0;
        break;
      }

      const L = br.readBits(4);
      if (L === null || L === 0n || L > 13n) return null;

      const val = br.readBits(Number(L));
      if (val === null) return null;

      for (let k = 0; k < Number(run); k++) zz[count++] = 0;
      zz[count++] = fromTwos(val, Number(L));
    } else {
      const L = br.readBits(4);
      if (L === null || L === 0n || L > 13n) return null;
      const val = br.readBits(Number(L));
      if (val === null) return null;
      zz[count++] = fromTwos(val, Number(L));
    }
  }
  return zz;
}

function padReplicateRGB(raw, w, h) {
  const nw = Math.ceil(w / 8) * 8;
  const nh = Math.ceil(h / 8) * 8;
  if (nw === w && nh === h) return { raw, w, h };

  const out = Buffer.alloc(nw * nh * 3);
  for (let y = 0; y < nh; y++) {
    const sy = y < h ? y : h - 1;
    for (let x = 0; x < nw; x++) {
      const sx = x < w ? x : w - 1;
      const srcIdx = (sy * w + sx) * 3;
      const dstIdx = (y * nw + x) * 3;
      out[dstIdx + 0] = raw[srcIdx + 0];
      out[dstIdx + 1] = raw[srcIdx + 1];
      out[dstIdx + 2] = raw[srcIdx + 2];
    }
  }
  return { raw: out, w: nw, h: nh };
}

function compressChannel(rawRGB, W, H, channelIndex, bw, factor) {
  for (let y = 0; y < H; y += 8) {
    for (let x = 0; x < W; x += 8) {
      const blk = Array.from({ length: 8 }, () => Array(8).fill(0));
      for (let u = 0; u < 8; u++) {
        for (let v = 0; v < 8; v++) {
          const idx = ((y + u) * W + (x + v)) * 3 + channelIndex;
          blk[u][v] = rawRGB[idx] - 128.0;
        }
      }
      let coeff = dct2(blk);
      applyTriangularZeroing(coeff, factor);
      const zz = blockToZigZagInts(coeff);
      encodeBlock(zz, bw);
    }
  }
}

function decompressChannel(br, W, H) {
  const out = new Uint8Array(W * H);
  for (let y = 0; y < H; y += 8) {
    for (let x = 0; x < W; x += 8) {
      const zz = decodeBlock(br);
      if (!zz) throw new Error("decodeBlock failed");
      const coeff = zigZagIntsToBlock(zz);
      const blk = idct2(coeff);

      for (let u = 0; u < 8; u++) {
        for (let v = 0; v < 8; v++) {
          const iv = clamp(Math.round(blk[u][v] + 128.0), 0, 255);
          out[(y + u) * W + (x + v)] = iv;
        }
      }
    }
  }
  return out;
}

async function compressBuffer(inputBuffer, factor = 6) {
  if (factor < 0 || factor > 15) throw new Error("factor must be in [0..15]");

  const { data, info } = await sharp(inputBuffer).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  if (info.channels !== 3) throw new Error("expected 3-channel RGB");

  const padded = padReplicateRGB(data, info.width, info.height);
  const W = padded.w;
  const H = padded.h;
  const raw = padded.raw;

  const bw = new BitWriter();

  const header = Buffer.alloc(4);
  header.writeUInt16LE(W, 0);
  header.writeUInt16LE(H, 2);

  compressChannel(raw, W, H, 0, bw, factor);
  compressChannel(raw, W, H, 1, bw, factor);
  compressChannel(raw, W, H, 2, bw, factor);

  const payload = bw.finish();
  return Buffer.concat([header, payload]);
}

async function decompressBuffer(binBuffer) {
  if (!Buffer.isBuffer(binBuffer)) binBuffer = Buffer.from(binBuffer);
  if (binBuffer.length < 4) throw new Error("file too small");

  const W = binBuffer.readUInt16LE(0);
  const H = binBuffer.readUInt16LE(2);

  const br = new BitReader(binBuffer, 4);
  const r = decompressChannel(br, W, H);
  const g = decompressChannel(br, W, H);
  const b = decompressChannel(br, W, H);

  const rgb = Buffer.alloc(W * H * 3);
  for (let i = 0; i < W * H; i++) {
    rgb[i * 3 + 0] = r[i];
    rgb[i * 3 + 1] = g[i];
    rgb[i * 3 + 2] = b[i];
  }

  return await sharp(rgb, { raw: { width: W, height: H, channels: 3 } }).jpeg({ quality: 85 }).toBuffer();
}

module.exports = {
  compressBuffer,
  decompressBuffer,
};
