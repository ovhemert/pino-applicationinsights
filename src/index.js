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
  if (
    !options.setup &&
    !options.key &&
    !process.env.APPINSIGHTS_INSTRUMENTATIONKEY
  ) {
    throw new Error('Instrumentation key missing')
  }

  const client = new insights.Client(options)

  const parseJsonStream = streams.parseJsonStream()
  const batchStream = streams.batchStream(1)

  const writeStream = client.insertStream()

  return pumpify(parseJsonStream, batchStream, writeStream)
}

/**
 * This forces callers to use `await` which in turn will allow next-logger to use `await` should we need to in the future (without causing any breaking changes)
 *
 * You should probably use `createWriteStreamSync` instead.
 *
 * @deprecated
 */
async function createWriteStream (...args) {
  return createWriteStreamSync(...args)
}

module.exports = {
  createWriteStream,
  createWriteStreamSync
}
