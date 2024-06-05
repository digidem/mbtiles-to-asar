import tilelive from '@mapbox/tilelive'
import MBTiles from '@mapbox/mbtiles'
import TileliveFile from 'tilelive-file'
import { promisify } from 'util'
import asar from '@electron/asar'
import { temporaryDirectory } from 'tempy'
import { mkdirp } from 'mkdirp'
import path from 'path'
import fs from 'fs'
import { rimrafSync } from 'rimraf'
import pick from 'lodash/pick.js'

export async function convertToAsar (inputMBTiles, outputDir) {
  const tilesDir = path.join(outputDir, 'tiles')
  const asarOutput = path.join(tilesDir, 'source.asar')
  mkdirp.sync(tilesDir)

  MBTiles.registerProtocols(tilelive)
  TileliveFile.registerProtocols(tilelive)
  const tempDir = temporaryDirectory()

  const sourceUri = 'mbtiles://' + inputMBTiles

  const load = promisify(tilelive.load.bind(tilelive))
  const copy = promisify(tilelive.copy.bind(tilelive))
  const info = promisify(tilelive.info.bind(tilelive))

  const metadata = await info(sourceUri)
  const sinkUri = 'file://' + tempDir + '?filetype=' + metadata.format

  const src = await load(sourceUri)
  const dest = await load(sinkUri)

  await copy(src, dest, {})

  await asar.createPackage(tempDir, asarOutput)

  rimrafSync(tempDir)

  const layerMetadata = pick(metadata, [
    'minzoom',
    'maxzoom',
    'bounds',
    'center'
  ])

  const style = {
    version: 8,
    name: 'Mapeo Offline Map',
    sources: {
      'offline-raster-tiles': {
        type: 'raster',
        tiles: ['{host}/tiles/source/{z}/{x}/{y}.' + metadata.format],
        tileSize: 256,
        ...layerMetadata
      }
    },
    layers: [
      {
        id: 'layer1',
        type: 'raster',
        source: 'offline-raster-tiles'
      }
    ]
  }

  fs.writeFileSync(
    path.join(outputDir, 'style.json'),
    JSON.stringify(style, null, 2)
  )
}
