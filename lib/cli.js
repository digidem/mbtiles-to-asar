#!/usr/bin/env node

import { convertToAsar } from "./index.js";
import { program } from "commander";
import path from "path";
import packageJson from "../package.json" assert { type: "json" };
import { exit } from "process";
program
  .version(packageJson.version)
  .description("Convert MBTiles to ASAR format")
  .requiredOption("-i, --input <inputMBTiles>", "Input MBTiles file")
  .requiredOption("-o, --output <outputDir>", "Output directory")
  .parse(process.argv);

const options = program.opts();

const inputMBTiles = path.resolve(options.input);
const outputDir = path.resolve(options.output);

const startTime = Date.now();
const intervalId = setInterval(() => {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  process.stdout.write(
    `\rConversion in progress... ${elapsed} seconds elapsed.`,
  );
}, 1000);
console.log("Starting conversion...");
convertToAsar(inputMBTiles, outputDir)
  .then(() => {
    clearInterval(intervalId);
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000; // duration in seconds
    console.log(`Conversion complete! It took ${duration} seconds.`);
  })
  .catch((err) => {
    clearInterval(intervalId);
    console.error("Error during conversion:", err);
  });
