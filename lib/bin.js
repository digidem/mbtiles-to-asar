#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { convertToAsar } from './index.js'
import path from 'path'

const argv = yargs(hideBin(process.argv))
  .check(argv => {
    if (argv._.length !== 2) {
      throw new Error('Expected 2 arguments: input.mbtiles outputDir')
    }
    return true
  })
  .parse()

const [input, output] = argv._

await convertToAsar(
  path.join(process.cwd(), input),
  path.join(process.cwd(), output)
)
