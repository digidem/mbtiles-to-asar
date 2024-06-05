import { convertToAsar } from "../lib/index.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const inputPath = path.resolve(
  __dirname,
  "fixtures",
  "countries-raster.mbtiles",
);
const outputPath = path.resolve(process.cwd(), "default");
await convertToAsar(inputPath, outputPath);
