'use strict'

const {
  createAppInsightsWriteSteam,
} = require('./appinsights-client')
const streams = require('./streams')
const pumpify = require('pumpify')

function createAppInsightsWriteStream(
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
    createAppInsightsWriteSteam(
      setupAppInsights,
    )

  let a = new pumpify(
    parseJsonStream,
    batchStream,
    aiClientWriteStream,
  )
  console.log(
    'aiClientWriteStream, stream.Writable',
  )
  console.log(
    Object.keys(aiClientWriteStream),
  )
  console.log(Object.keys(a))
  console.dir(aiClientWriteStream)
  console.dir(a)
  return a
}

module.exports = {
  createAppInsightsWriteStream,
}
