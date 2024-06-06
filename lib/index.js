const tilelive = require("@mapbox/tilelive");
const MBTiles = require("@mapbox/mbtiles");
const TileliveFile = require("tilelive-file");
const { promisify } = require("util");
const asar = require("@electron/asar");
const { mkdirp } = require("mkdirp");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { rimrafSync } = require("rimraf");
const pick = require("lodash/pick");

const debugLog = (message) => {
  if (process.env.DEBUG === "true") {
    console.log(message);
  }
};

async function convertToAsar(inputMBTiles, outputDir) {
  if (path.extname(inputMBTiles) !== ".mbtiles") {
    throw new Error(
      "Invalid input file: The file must have a .mbtiles extension.",
    );
  }
  debugLog(`Starting conversion of ${inputMBTiles} to ASAR format.`);

  const tilesDir = path.join(outputDir, "tiles");
  const asarOutput = path.join(tilesDir, "source.asar");
  mkdirp.sync(tilesDir);
  debugLog(`Created tiles directory at ${tilesDir}`);

  MBTiles.registerProtocols(tilelive);
  TileliveFile.registerProtocols(tilelive);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "temp-"));
  debugLog(`Temporary directory created at ${tempDir}`);

  const sourceUri = "mbtiles://" + inputMBTiles;
  debugLog(`Source URI: ${sourceUri}`);

  const load = promisify(tilelive.load.bind(tilelive));
  const copy = promisify(tilelive.copy.bind(tilelive));
  const info = promisify(tilelive.info.bind(tilelive));

  const metadata = await info(sourceUri);
  debugLog(`Metadata retrieved: ${JSON.stringify(metadata)}`);
  if (!metadata) {
    throw new Error("Invalid MBTiles file: Metadata could not be retrieved.");
  }
  const sinkUri = "file://" + tempDir + "?filetype=" + metadata.format;
  debugLog(`Sink URI: ${sinkUri}`);

  const src = await load(sourceUri);
  const dest = await load(sinkUri);
  debugLog(`Loaded source and destination.`);

  await copy(src, dest, {});
  debugLog(`Copy operation completed.`);

  await asar.createPackage(tempDir, asarOutput);
  debugLog(`ASAR package created at ${asarOutput}`);

  rimrafSync(tempDir);
  debugLog(`Temporary directory ${tempDir} removed.`);

  const layerMetadata = pick(metadata, [
    "minzoom",
    "maxzoom",
    "bounds",
    "center",
  ]);
  debugLog(`Layer metadata: ${JSON.stringify(layerMetadata)}`);

  const style = {
    version: 8,
    name: "Mapeo Offline Map",
    sources: {
      "offline-raster-tiles": {
        type: "raster",
        tiles: ["{host}/tiles/source/{z}/{x}/{y}." + metadata.format],
        tileSize: 256,
        ...layerMetadata,
      },
    },
    layers: [
      {
        id: "layer1",
        type: "raster",
        source: "offline-raster-tiles",
      },
    ],
  };
  debugLog(`Style JSON: ${JSON.stringify(style, null, 2)}`);

  fs.writeFileSync(
    path.join(outputDir, "style.json"),
    JSON.stringify(style, null, 2),
  );
  debugLog(`Style JSON written to ${path.join(outputDir, "style.json")}`);

  debugLog(`Conversion of ${inputMBTiles} to ASAR format completed.`);
}

module.exports = { convertToAsar };
