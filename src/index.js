'use strict'

const insights = require('./applicationinsights')
const streams = require('./streams')
const pumpify = require('pumpify')

/**
 * Should `createWriteStream` need to resolve asynchronously in the future, this method may be removed.
 */
function createWriteStreamSync (
  /**
   * @type {{
   *   setup?: (
   *     appInsights: typeof import('applicationinsights')
   *   ) => typeof import('applicationinsights').Configuration,
   *   key?: string
   * }}
   */
  options = {}
) {
  if (!options.setup && !options.key && !process.env.APPINSIGHTS_INSTRUMENTATIONKEY) { throw Error('Instrumentation key missing') }
  const client = new insights.Client(options)

  const parseJsonStream = streams.parseJsonStream()
  const batchStream = streams.batchStream(1)

  const writeStream = client.insertStream()

  return pumpify(parseJsonStream, batchStream, writeStream)
}

module.exports = {
  createWriteStreamSync
}
