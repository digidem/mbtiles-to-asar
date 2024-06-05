import { convertToAsar } from "../lib/index.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import assert from "assert";
import chalk from "chalk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const inputPath = path.resolve(
  __dirname,
  "fixtures",
  "countries-raster.mbtiles",
);
const outputPath = path.resolve(process.cwd(), "default");

async function runTest() {
  await convertToAsar(inputPath, outputPath);

  // Check if the tiles directory was created
  const tilesDir = path.join(outputPath, "tiles");
  assert(
    fs.existsSync(tilesDir),
    chalk.red(`Tiles directory was not created at ${tilesDir}`),
  );
  console.log(chalk.green(`Tiles directory exists at ${tilesDir}`));

  // Check if the ASAR file was created
  const asarOutput = path.join(tilesDir, "source.asar");
  assert(
    fs.existsSync(asarOutput),
    chalk.red(`ASAR file was not created at ${asarOutput}`),
  );
  console.log(chalk.green(`ASAR file exists at ${asarOutput}`));

  // Check if the style.json file was created
  const styleJsonPath = path.join(outputPath, "style.json");
  assert(
    fs.existsSync(styleJsonPath),
    chalk.red(`style.json file was not created at ${styleJsonPath}`),
  );
  console.log(chalk.green(`style.json file exists at ${styleJsonPath}`));
}

runTest().catch((err) => {
  console.error(chalk.red("Test failed:"), err);
  process.exit(1);
});
