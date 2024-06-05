# mbtiles-to-asar

## Description

This package converts MBTiles to ASAR format. It can be used both as a CLI tool and programmatically.

## Usage

### CLI

To install the package globally:

```sh
npm install -g mbtiles-to-asar
```

To use the CLI tool, run:

```sh
convert-to-asar -i <inputMBTiles> -o <outputDir>
```

- `-i, --input <inputMBTiles>`: Input MBTiles file
- `-o, --output <outputDir>`: Output directory

### Programmatically

To install the package in your project:

```sh
npm install -S mbtiles-to-asar
```

To use the package programmatically, import the `convertToAsar` function:

```javascript
import { convertToAsar } from "mbtiles-to-asar";

const inputMBTiles = "path/to/input.mbtiles";
const outputDir = "path/to/output";

convertToAsar(inputMBTiles, outputDir)
  .then(() => {
    console.log("Conversion complete!");
  })
  .catch((err) => {
    console.error("Error during conversion:", err);
  });
```

## License

MIT
