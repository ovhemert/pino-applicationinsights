'use strict'

const appInsights = require('applicationinsights')
const stream = require('stream')

const createAppInsightsWriteSteam =
  (
    /**
     * @type {import('./setupAppInsights').setupAppInsights}
     */
    setupAppInsights,
  ) => {
    const appInsightsInstance =
      setupAppInsights(
        appInsights,
      )

    const appInsightsDefaultClient =
      appInsightsInstance.defaultClient

    return insertStream(
      appInsightsDefaultClient,
    )
  }

const getLogException = (
  item,
) => {
  if (
    item.level !== 50 ||
    item.type !== 'Error'
  ) {
    return
  }
  const err = new Error(
    item.msg,
  )
  err.stack =
    item.stack || ''
  return err
}

const getLogMessage = (
  item,
) => {
  if (item.msg) {
    return item.msg
  }
  const severity =
    getLogSeverity(
      item.level,
    )
  return getLogSeverityName(
    severity,
  )
}

const getLogProperties =
  (item) => {
    const props =
      Object.assign(
        {},
        item,
      )
    delete props.msg
    return props
  }

const getLogSeverity = (
  level,
) => {
  if (
    level === 10 ||
    level === 20
  ) {
    return appInsights
      .Contracts
      .SeverityLevel
      .Verbose
  }
  if (level === 40) {
    return appInsights
      .Contracts
      .SeverityLevel
      .Warning
  }
  if (level === 50) {
    return appInsights
      .Contracts
      .SeverityLevel
      .Error
  }
  if (level === 60) {
    return appInsights
      .Contracts
      .SeverityLevel
      .Critical
  }
  return appInsights
    .Contracts
    .SeverityLevel
    .Information // 30
}

const getLogSeverityName =
  (severity) => {
    if (
      severity ===
      appInsights
        .Contracts
        .SeverityLevel
        .Verbose
    ) {
      return 'Verbose'
    }
    if (
      severity ===
      appInsights
        .Contracts
        .SeverityLevel
        .Warning
    ) {
      return 'Warning'
    }
    if (
      severity ===
      appInsights
        .Contracts
        .SeverityLevel
        .Error
    ) {
      return 'Error'
    }
    if (
      severity ===
      appInsights
        .Contracts
        .SeverityLevel
        .Critical
    ) {
      return 'Critical'
    }
    return 'Information'
  }

const insertException = (
  appInsightsDefaultClient,
  item,
) => {
  const exception =
    getLogException(item)
  if (!exception) {
    return
  }
  const telemetry = {
    exception,
    properties:
      getLogProperties(
        item,
      ),
  }
  appInsightsDefaultClient.trackException(
    telemetry,
  )
}

const insertTrace = (
  appInsightsDefaultClient,
  item,
) => {
  const telemetry = {
    message:
      getLogMessage(
        item,
      ),
    severity:
      getLogSeverity(
        item.level,
      ),
    properties:
      getLogProperties(
        item,
      ),
  }
  appInsightsDefaultClient.trackTrace(
    telemetry,
  )
}

const insert = (
  appInsightsDefaultClient,
  entities = [],
) => {
  const data =
    Array.isArray(
      entities,
    )
      ? entities
      : [entities]
  if (data.length <= 0) {
    return
  }
  data.forEach(
    (entity) => {
      insertTrace(
        appInsightsDefaultClient,
        entity,
      )
      if (
        entity.level ===
        50
      ) {
        insertException(
          appInsightsDefaultClient,
          entity,
        )
      }
    },
  )
}

const insertStream = (
  appInsightsDefaultClient,
) => {
  const writeStream =
    new stream.Writable({
      objectMode: true,
      highWaterMark: 1,
    })
  writeStream._write = (
    chunk,
    encoding,
    callback,
  ) => {
    try {
      insert(
        appInsightsDefaultClient,
        chunk,
      )
      callback(null)
    } catch (e) {
      if (
        e instanceof
        Error
      ) {
        callback(e)
      } else {
        throw new Error(
          'pino-applicationinsights/src/appinsights-client.js received an exception that is not an instanceof Error. Crashing process :)',
        )
      }
    }
  }
  return writeStream
}

module.exports = {
  createAppInsightsWriteSteam,
}
