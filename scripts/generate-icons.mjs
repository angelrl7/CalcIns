/**
 * Generates PWA icons (192x192 and 512x512 PNG) from the SVG favicon.
 * Run once: node scripts/generate-icons.mjs
 *
 * Requires: npm install -D sharp  (one-time dev dep, not bundled)
 */
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

let sharp
try {
  sharp = (await import('sharp')).default
} catch {
  console.error('sharp not found. Install it with: npm install -D sharp')
  process.exit(1)
}

const svgPath = join(root, 'public', 'favicon.svg')
const svg = readFileSync(svgPath)

const sizes = [192, 512]
for (const size of sizes) {
  const dest = join(root, 'public', 'icons', `icon-${size}.png`)
  await sharp(svg).resize(size, size).png().toFile(dest)
  console.log(`✓ Generated ${dest}`)
}
