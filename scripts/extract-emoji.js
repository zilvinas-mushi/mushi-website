/* eslint-disable @typescript-eslint/no-require-imports -- Node build script,
   run by hand with `node scripts/extract-emoji.js <CODEPOINT> <out.png>`; it is
   not part of the app bundle. */

/*
 * Pull a glyph's colour bitmap straight out of Apple Color Emoji's `sbix`
 * table.
 *
 * The hero panel's face icon came from Figma as a node whose image was
 * 160 x 160 — exactly this font's largest strike — so what the design was drawn
 * from is this bitmap. Extracting it here beats pasting the node's base64,
 * which is how the asset got silently truncated the first time round (see
 * design/TOKENS.md, "Face icon").
 *
 * Usage: node scripts/extract-emoji.js 1F60E public/images/emoji-sunglasses.png
 */
const fs = require("fs");

const path = "/System/Library/Fonts/Apple Color Emoji.ttc";
const b = fs.readFileSync(path);
const cp = parseInt(process.argv[2], 16);
const out = process.argv[3];

let base = 0;
if (b.toString("ascii", 0, 4) === "ttcf") base = b.readUInt32BE(12); // first font

const numTables = b.readUInt16BE(base + 4);
const tables = {};
for (let i = 0; i < numTables; i++) {
  const o = base + 12 + i * 16;
  tables[b.toString("ascii", o, o + 4)] = { off: b.readUInt32BE(o + 8), len: b.readUInt32BE(o + 12) };
}

// cmap: format 12 covers the astral plane, which is where the emoji live.
const cmap = tables.cmap.off;
let sub12 = null;
for (let i = 0, n = b.readUInt16BE(cmap + 2); i < n; i++) {
  const rec = cmap + 4 + i * 8;
  const o = cmap + b.readUInt32BE(rec + 4);
  if (b.readUInt16BE(o) === 12) sub12 = o;
}
let gid = 0;
for (let i = 0, n = b.readUInt32BE(sub12 + 12); i < n; i++) {
  const g = sub12 + 16 + i * 12;
  const start = b.readUInt32BE(g), end = b.readUInt32BE(g + 4);
  if (cp >= start && cp <= end) { gid = b.readUInt32BE(g + 8) + (cp - start); break; }
}
if (!gid) throw new Error("no glyph for U+" + cp.toString(16));

const sbix = tables.sbix.off;
const numStrikes = b.readUInt32BE(sbix + 4);
const strikes = [];
for (let i = 0; i < numStrikes; i++) {
  const s = sbix + b.readUInt32BE(sbix + 8 + i * 4);
  strikes.push({ off: s, ppem: b.readUInt16BE(s) });
}
console.log("strikes:", strikes.map((s) => s.ppem).join(", "));

const strike = strikes.reduce((a, s) => (s.ppem > a.ppem ? s : a));
const g0 = strike.off + b.readUInt32BE(strike.off + 4 + gid * 4);
const g1 = strike.off + b.readUInt32BE(strike.off + 4 + (gid + 1) * 4);
if (g1 <= g0) throw new Error("no bitmap in strike " + strike.ppem);

const type = b.toString("ascii", g0 + 4, g0 + 8);
const png = b.subarray(g0 + 8, g1);
console.log(`gid=${gid} strike=${strike.ppem}ppem type=${type} bytes=${png.length}`);
if (type.trim() !== "png") throw new Error("unexpected graphic type " + type);

fs.writeFileSync(out, png);
console.log("wrote", out);
