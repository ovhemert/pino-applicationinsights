'use strict'

const insights = require('./applicationinsights')
const streams = require('./streams')
const pumpify = require('pumpify')

function createWriteStreamSync(
  /**
   * @type {{
   *   setup: (
   *     appInsights: typeof import('applicationinsights')
   *   ) => typeof import('applicationinsights').Configuration,
   * }}
   */
  options,
) {
  if (!options.setup) {
    throw new Error(
      'setup function required. No other options are supported anymore.',
    )
  }

  const client =
    new insights.Client(
      options,
    )

  const parseJsonStream =
    streams.parseJsonStream()
  const batchStream =
    streams.batchStream(
      1,
    )

  const writeStream =
    client.insertStream()

  return pumpify(
    parseJsonStream,
    batchStream,
    writeStream,
  )
}

module.exports.createWriteStreamSync =
  createWriteStreamSync
