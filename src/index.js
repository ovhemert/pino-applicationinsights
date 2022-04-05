'use strict'

const {
  AppInsightsClient,
} = require('./appinsights-client')
const streams = require('./streams')
const pumpify = require('pumpify')

function createWriteStreamSync(
  /**
   * @type {import('./setupAppInsights').setupAppInsights}
   */
  setupAppInsights,
) {
  if (typeof setupAppInsights === 'object') {
    throw new Error(
      "Options object no longer supported. Pass in one setupAppInsights function. Must be at least: require('applicationinsights').setup(process.env.APPINSIGHTS_CONNECTIONSTRING).start()",
    )
  }

  const parseJsonStream =
    streams.parseJsonStream()
  const batchStream = streams.batchStream(1)

  const aiClientWriteStream =
    new AppInsightsClient(
      setupAppInsights,
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
