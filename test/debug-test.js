'use strict'

const insights = require('../src/applicationinsights')

function main() {
  const iKey =
    process.env
      .APPINSIGHTS_INSTRUMENTATIONKEY
  const client = new insights.Client({
    iKey,
  })

  const log = {
    level: 30,
    time: 1553862903459,
    pid: 23164,
    hostname: 'Osmonds-MacBook-Pro.local',
    msg: 'info message',
    v: 1,
  }
  client.insert(log)
}

main()
