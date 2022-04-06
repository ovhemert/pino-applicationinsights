#!/usr/bin/env node

const program = require('commander')

const pkg = require('../package.json')
const pinoInsights = require('././index')

// main cli logic
function main() {
  program
    .version(pkg.version)
    .option(
      '-k, --key <key>',
      'Application Insights Instrumentation Key',
    )
    .action(({ key }) => {
      try {
        const writeStream =
          pinoInsights.createWriteStreamSync(
            { key },
          )
        process.stdin.pipe(writeStream)
        console.info('logging')
      } catch (error) {
        console.log(error.message)
      }
    })

  program.parse(process.argv)
}

main()
