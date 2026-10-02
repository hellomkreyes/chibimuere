/*
 * My Pictures: turns the originals in art-originals/ (kept out of git) into
 * web-ready files in public/art/ (committed), so the build and CI never need
 * sharp.
 *
 *   npm run images
 *
 * For each original (JPG, PNG, WebP, AVIF, TIFF, or HEIC via macOS sips):
 *   <name>-thumb.avif / .webp       240×144, cropped to the grid tile
 *   <name>-thumb@2x.avif / .webp    480×288
 *   <name>.avif / .webp             up to 1000×800, whole picture
 *   <name>@2x.avif / .webp          up to 2000×1600
 * Photos are turned upright and all metadata is dropped (no GPS, no camera
 * details). Files whose outputs are newer than the original are skipped.
 *
 * It also keeps content.json home.artsy.pictures in step: each picture's
 * width/height are filled in, and an original with no entry gets one with
 * "show": false, ready for its caption and alt text. Name the cursed early
 * piece "thumbs-db" (any extension) and it becomes the Thumbs.db easter egg.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, extname, join } from "node:path";
import sharp from "sharp";

const SOURCE = "art-originals";
const OUT = "public/art";
const CONTENT = "src/content.json";
const INPUT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".tif", ".tiff", ".heic", ".heif"]);
const CURSED = "thumbs-db";

const SIZES = [
  { suffix: "-thumb", width: 240, height: 144, fit: "cover" },
  { suffix: "-thumb@2x", width: 480, height: 288, fit: "cover" },
  { suffix: "", width: 1000, height: 800, fit: "inside" },
  { suffix: "@2x", width: 2000, height: 1600, fit: "inside" },
];

const slugify = (name) =>
  basename(name, extname(name))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// sharp's prebuilt binaries can't decode HEIC, so let macOS convert it first.
function readable(file, scratch) {
  if (![".heic", ".heif"].includes(extname(file).toLowerCase())) return file;
  if (process.platform !== "darwin") throw new Error(`${file}: HEIC needs macOS (sips); export it as JPG instead`);
  const jpg = join(scratch, `${slugify(file)}.jpg`);
  execFileSync("sips", ["-s", "format", "jpeg", file, "--out", jpg], { stdio: "ignore" });
  return jpg;
}

async function convert(file, slug, scratch) {
  const input = readable(file, scratch);
  for (const { suffix, width, height, fit } of SIZES) {
    const base = sharp(input)
      .rotate()
      .resize({ width, height, fit, position: sharp.strategy.attention, withoutEnlargement: true });
    await base.clone().avif({ quality: 50, effort: 6 }).toFile(join(OUT, `${slug}${suffix}.avif`));
    await base.clone().webp({ quality: 78 }).toFile(join(OUT, `${slug}${suffix}.webp`));
  }
}

const isStale = (file, slug) => {
  const out = join(OUT, `${slug}@2x.webp`);
  return !existsSync(out) || statSync(out).mtimeMs < statSync(file).mtimeMs;
};

if (!existsSync(SOURCE)) {
  mkdirSync(SOURCE);
  console.log(`Made ${SOURCE}/. Drop the originals in there and run this again.`);
  process.exit(0);
}
mkdirSync(OUT, { recursive: true });

const files = readdirSync(SOURCE)
  .filter((name) => INPUT.has(extname(name).toLowerCase()))
  .sort();
const scratch = mkdtempSync(join(tmpdir(), "chibi-images-"));
const content = JSON.parse(readFileSync(CONTENT, "utf8"));
content.home.artsy ??= {};
const pictures = (content.home.artsy.pictures ??= []);

try {
  for (const name of files) {
    const file = join(SOURCE, name);
    const slug = slugify(name);
    if (isStale(file, slug)) {
      await convert(file, slug, scratch);
      console.log(`✓ ${name} → ${OUT}/${slug}*`);
    } else {
      console.log(`· ${name} (up to date)`);
    }

    const { width, height } = await sharp(join(OUT, `${slug}.webp`)).metadata();
    let entry = pictures.find((picture) => picture.src === slug);
    if (!entry) {
      const cursed = slug === CURSED;
      entry = {
        src: slug,
        file: cursed ? "Thumbs.db" : name,
        title: "",
        year: "",
        medium: "",
        alt: "",
        ...(cursed && { cursed: true }),
        show: false,
      };
      pictures.push(entry);
      console.log(`  + added "${slug}" to content.json (hidden until it has a caption and alt text)`);
    }
    Object.assign(entry, { width, height });
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}

const missing = pictures.filter((picture) => !files.some((name) => slugify(name) === picture.src));
for (const picture of missing) console.warn(`! content.json lists "${picture.src}" but ${SOURCE}/ has no original for it`);

writeFileSync(CONTENT, JSON.stringify(content, null, 2) + "\n");
console.log(`\n${files.length} original(s), ${pictures.filter((p) => p.show !== false).length} shown on the site.`);
