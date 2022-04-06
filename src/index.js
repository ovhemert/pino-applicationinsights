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

  const parseJsonStream =
    streams.parseJsonStream()
  const batchStream = streams.batchStream(1)

  const aiClientWriteStream =
    new insights.Client(
      options,
    ).insertStream()

  return new pumpify(
    parseJsonStream,
    batchStream,
    aiClientWriteStream,
  )
}

module.exports = {
  createWriteStreamSync,
}
