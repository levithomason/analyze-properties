const fs = require('fs')
const path = require('path')
const utf8 = require('utf8')
const pkg = require('../package.json')

const assetManifest = require('../dist/extension/asset-manifest.json')
const manifest = require('../src/extension/manifest.json')

// ----------------------------------------
// Version
// ----------------------------------------
manifest.version = pkg.version

// ----------------------------------------
// Add dist assets as extension content scripts
// ----------------------------------------

manifest.content_scripts = [
  {
    matches: ['*://www.realtor.com/realestateandhomes-detail/*'],
    css: [],
    js: [],
  },
]

Object.keys(assetManifest).forEach(key => {
  if (/\.css$/.test(key)) {
    manifest.content_scripts[0].css.push(assetManifest[key])
  }

  if (/\.js$/.test(key)) {
    manifest.content_scripts[0].js.push(assetManifest[key])
  }

  // ensure all assets are UTF-8 encoded, required by Chrome
  const filePath = path.resolve(__dirname, '../dist/extension', assetManifest[key])
  fs.writeFileSync(filePath, utf8.encode(fs.readFileSync(filePath).toString()), 'utf-8')
})

// Put scripts in the right order
// First manifest/vendor/main, then all numbered chunks
const [bundles, chunks] = manifest.content_scripts[0].js.reduce(
  (acc, next) => {
    if (/^(manifest|vendor|main).*$/.test(next)) acc[0].push(next)
    else acc[1].push(next)

    return acc
  },
  [[], []],
)

manifest.content_scripts[0].js = bundles
  .sort((a, b) => {
    if (/^manifest.*$/.test(a)) return -1
    if (/^main.*$/.test(a)) return 1

    return 0
  })
  .concat(chunks)

// ----------------------------------------
// Write manifest back to disk
// ----------------------------------------

fs.writeFileSync(
  path.resolve(__dirname, '../dist/extension/manifest.json'),
  JSON.stringify(manifest, null, 2),
  'utf-8',
)
