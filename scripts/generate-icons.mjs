// Generates simple placeholder PWA icons (jade background + white coin
// circle) as raw PNGs, with no image-library dependency (hand-rolled PNG
// encoder using Node's built-in zlib for deflate).
import fs from "node:fs"
import path from "node:path"
import zlib from "node:zlib"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c >>> 0
  }
  return table
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  }
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii")
  const lenBuf = Buffer.alloc(4)
  lenBuf.writeUInt32BE(data.length, 0)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf])
}

function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function generatePng(size, bgHex, fgHex) {
  const bg = hexToRgb(bgHex)
  const fg = hexToRgb(fgHex)
  const cx = size / 2
  const cy = size / 2
  const radius = size * 0.32

  const raw = Buffer.alloc(size * (1 + size * 3))
  let offset = 0
  for (let y = 0; y < size; y++) {
    raw[offset++] = 0 // filter: none
    for (let x = 0; x < size; x++) {
      const dx = x - cx + 0.5
      const dy = y - cy + 0.5
      const inCircle = dx * dx + dy * dy <= radius * radius
      const [r, g, b] = inCircle ? fg : bg
      raw[offset++] = r
      raw[offset++] = g
      raw[offset++] = b
    }
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr.writeUInt8(8, 8) // bit depth
  ihdr.writeUInt8(2, 9) // color type: RGB
  ihdr.writeUInt8(0, 10)
  ihdr.writeUInt8(0, 11)
  ihdr.writeUInt8(0, 12)

  const idat = zlib.deflateSync(raw)

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ])
}

const outDir = path.join(__dirname, "..", "public", "icons")
fs.mkdirSync(outDir, { recursive: true })

for (const size of [192, 512]) {
  const png = generatePng(size, "#2fbf8f", "#0e1512")
  fs.writeFileSync(path.join(outDir, `icon-${size}.png`), png)
  console.log(`Wrote icon-${size}.png`)
}
