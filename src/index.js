'use strict'

const {
  createAppInsightsWriteSteam,
} = require('./appinsights-client')
const streams = require('./streams')
const pumpify = require('pumpify')

function createFastJsonParsingAppInsightsWriteStream(
  /**
   * @type {import('./primitives').getActiveAppInsightsClient}
   */
  getActiveAppInsightsClient,
) {
  if (
    typeof getActiveAppInsightsClient !==
    'function'
  ) {
    throw new Error(
      [
        'Options object no longer supported. Pass in one getActiveAppInsightsClient function.',
        'Must be at least:',
        ' module.exports.logger = () => {',
        "   let ai = require('applicationinsights')",
        '   ai.setup().start()',
        '   return ai.defaultClient',
        ' }',
      ].join('\n'),
    )
  }

  const parseJsonStream =
    streams.parseJsonStream()
  const batchStream = streams.batchStream(1)

  const aiClientWriteStream =
    createAppInsightsWriteSteam(
      getActiveAppInsightsClient,
    )

  return new pumpify(
    parseJsonStream,
    batchStream,
    aiClientWriteStream,
  )
}

module.exports = {
  createFastJsonParsingAppInsightsWriteStream,
}
