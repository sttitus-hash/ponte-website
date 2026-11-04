/**
 * Puts the licensed brand web fonts into public/fonts at build time.
 *
 * The fonts (Clash Grotesk — ITF Free Font License, self-hosting permitted for the licensee's
 * own site; Ponte Dot — Ponte's own typeface) are not committed in usable form. Two sources:
 *
 *   1. FONTS_BUNDLE_B64   – base64 of fonts.tar.gz, kept as a secret build-environment variable
 *                          (may be split into FONTS_BUNDLE_B64_1, _2, … to stay under per-variable limits)
 *   2. FONTS_KEY          – hex key that decrypts a local, git-ignored assets/fonts.enc (AES-256-GCM)
 *   3. FONTS_ARCHIVE_URL  – URL of a fonts.tar.gz (optional FONTS_ARCHIVE_TOKEN sent as Bearer)
 *
 * Without either, the build still succeeds and the site uses its fallback stacks.
 * Files already present in public/fonts are left untouched (local development).
 */
import { createDecipheriv } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const out = join(process.cwd(), "public", "fonts");
mkdirSync(out, { recursive: true });

const present = readdirSync(out).filter((f) => f.endsWith(".woff2"));
if (present.length) {
  console.log(`[fonts] ${present.length} web font file(s) already in public/fonts — skipping.`);
  process.exit(0);
}

let archive = null;

const chunks = [];
if (process.env.FONTS_BUNDLE_B64) chunks.push(process.env.FONTS_BUNDLE_B64);
for (let i = 1; process.env[`FONTS_BUNDLE_B64_${i}`]; i++) chunks.push(process.env[`FONTS_BUNDLE_B64_${i}`]);

if (chunks.length) {
  archive = Buffer.from(chunks.join("").replace(/\s+/g, ""), "base64");
  console.log(`[fonts] read bundle from FONTS_BUNDLE_B64 (${chunks.length} part(s))`);
} else if (process.env.FONTS_KEY) {
  const enc = readFileSync(join(process.cwd(), "assets", "fonts.enc"));
  if (enc.subarray(0, 4).toString() !== "PFB1") throw new Error("[fonts] unexpected bundle header");
  const key = Buffer.from(process.env.FONTS_KEY.trim(), "hex");
  const iv = enc.subarray(4, 16);
  const tag = enc.subarray(16, 32);
  const body = enc.subarray(32);
  const d = createDecipheriv("aes-256-gcm", key, iv);
  d.setAuthTag(tag);
  archive = Buffer.concat([d.update(body), d.final()]);
  console.log("[fonts] decrypted assets/fonts.enc");
} else if (process.env.FONTS_ARCHIVE_URL) {
  const headers = process.env.FONTS_ARCHIVE_TOKEN
    ? { Authorization: `Bearer ${process.env.FONTS_ARCHIVE_TOKEN}` }
    : {};
  const res = await fetch(process.env.FONTS_ARCHIVE_URL, { headers });
  if (!res.ok) throw new Error(`[fonts] download failed: ${res.status}`);
  archive = Buffer.from(await res.arrayBuffer());
  console.log("[fonts] downloaded FONTS_ARCHIVE_URL");
}

if (!archive) {
  console.warn("[fonts] no font bundle configured (FONTS_BUNDLE_B64 / FONTS_KEY / FONTS_ARCHIVE_URL) — building with fallback fonts.");
  process.exit(0);
}

const tmp = join(tmpdir(), `ponte-fonts-${Date.now()}`);
mkdirSync(tmp, { recursive: true });
const tgz = join(tmp, "fonts.tar.gz");
writeFileSync(tgz, archive);
execFileSync("tar", ["xzf", tgz, "-C", tmp]);
for (const f of readdirSync(join(tmp, "fonts"))) {
  writeFileSync(join(out, f), readFileSync(join(tmp, "fonts", f)));
}
rmSync(tmp, { recursive: true, force: true });
console.log(`[fonts] installed ${readdirSync(out).filter((f) => f.endsWith(".woff2")).length} font file(s) into public/fonts`);
