import sharp from 'sharp'
import path from 'node:path'

const IMAGES = path.resolve('public/images')

/**
 * Remove a flat background colour from a PNG and write a true-alpha version.
 * Pixels within `tol` of the sampled background become fully transparent,
 * with a soft feather band for clean edges.
 */
async function key({ input, output, tol = 42, feather = 26 }) {
  const img = sharp(path.join(IMAGES, input)).ensureAlpha()
  const { data, info } = await img
    .raw()
    .toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info

  // Sample background from the four corners (average).
  const corners = [
    0,
    (width - 1) * channels,
    (height - 1) * width * channels,
    ((height - 1) * width + (width - 1)) * channels,
  ]
  let br = 0,
    bg = 0,
    bb = 0
  for (const c of corners) {
    br += data[c]
    bg += data[c + 1]
    bb += data[c + 2]
  }
  br /= corners.length
  bg /= corners.length
  bb /= corners.length

  for (let i = 0; i < data.length; i += channels) {
    const dr = data[i] - br
    const dg = data[i + 1] - bg
    const db = data[i + 2] - bb
    const dist = Math.sqrt(dr * dr + dg * dg + db * db)
    if (dist <= tol) {
      data[i + 3] = 0
    } else if (dist <= tol + feather) {
      const a = (dist - tol) / feather
      data[i + 3] = Math.round(data[i + 3] * a)
    }
  }

  await sharp(data, { raw: { width, height, channels } })
    .png()
    .toFile(path.join(IMAGES, output))
  console.log(
    `[chroma-key] ${input} -> ${output} (bg rgb ${br.toFixed(0)},${bg.toFixed(0)},${bb.toFixed(0)})`,
  )
}

await key({
  input: 'floral-corner.png',
  output: 'floral-corner-alpha.png',
  tol: 46,
  feather: 30,
})
await key({
  input: 'peacock-feather.png',
  output: 'peacock-feather-alpha.png',
  tol: 60,
  feather: 34,
})
await key({
  input: 'mom-illustration.png',
  output: 'mom-illustration-alpha.png',
  tol: 40,
  feather: 24,
})

console.log('[chroma-key] done')
