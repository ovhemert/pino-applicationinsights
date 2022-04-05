'use strict'

const insights = require('../src/appinsights-client')

function main() {
  const iKey =
    process.env
      .APPINSIGHTS_INSTRUMENTATIONKEY
  const client =
    new insights.AppInsightsClient(
      {
        iKey,
      },
    )

  const log = {
    level: 30,
    time: 1553862903459,
    pid: 23164,
    hostname:
      'Osmonds-MacBook-Pro.local',
    msg: 'info message',
    v: 1,
  }
  client.insert(log)
}

main()
