'use strict'

const appInsights = require('applicationinsights')
const stream = require('stream')

const createAppInsightsWriteSteam = (
    /**
     * @type {import('./setupAppInsights').setupAppInsights}
     */
    setupAppInsights,
  ) => {
    const appInsightsInstance =
    setupAppInsights(appInsights)

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
  /**
   * @type {import('./primitives').LogItem}
   */
  item,
) => {
  if (item.msg) {
    return item.msg
  }
  const severity = getLogSeverity(item.level)
  return getLogSeverityName(severity)
}

const getLogProperties = (
  /** @type {import('./primitives').LogItem} */
  { msg: _discardedMessage, ...item },
) => item

/** @returns {import('./primitives').strictAiSeverityLevel} */
const getLogSeverity = (
  /** @type {import('./primitives').pinoSeverityLevel} */
  level,
) => {
  if (level === 10 || level === 20) {
    return appInsights.Contracts
      .SeverityLevel.Verbose
  }
  if (level === 40) {
    return appInsights.Contracts
      .SeverityLevel.Warning
  }
  if (level === 50) {
    return appInsights.Contracts
      .SeverityLevel.Error
  }
  if (level === 60) {
    return appInsights.Contracts
      .SeverityLevel.Critical
  }
  if (level === 30) {
    return appInsights.Contracts
      .SeverityLevel.Information
  }
  throw new Error('unknown level:' + level)
}

/** @returns {import('./primitives').SeverityLevelNames} */
const getLogSeverityName = (
  /** @type {import('./primitives').strictAiSeverityLevel} */
  severity,
) => {
    if (
      severity ===
    appInsights.Contracts.SeverityLevel
        .Verbose
    ) {
      return 'Verbose'
    }
    if (
      severity ===
    appInsights.Contracts.SeverityLevel
        .Warning
    ) {
      return 'Warning'
    }
    if (
      severity ===
    appInsights.Contracts.SeverityLevel.Error
    ) {
      return 'Error'
    }
    if (
      severity ===
    appInsights.Contracts.SeverityLevel
        .Critical
    ) {
      return 'Critical'
    }
  if (
    severity ===
    appInsights.Contracts.SeverityLevel
      .Information
  ) {
    return 'Information'
  }
  throw new Error(
    'unknown SeverityLevel:' + severity,
  )
}

const insertException = (
  /** @type {import('applicationinsights').TelemetryClient} */
  appInsightsDefaultClient,
  /** @type {import('./primitives').LogItem} */
  item,
) => {
  const exception = getLogException(item)
  if (!exception) {
    return
  }
  const telemetry = {
    exception,
    properties: getLogProperties(item),
  }
  appInsightsDefaultClient.trackException(
    telemetry,
  )
}

const insertTrace = (
  /** @type {import('applicationinsights').TelemetryClient} */
  appInsightsDefaultClient,
  /** @type {import('./primitives').LogItem} */
  item,
) => {
  const telemetry = {
    message: getLogMessage(item),
    severity: getLogSeverity(item.level),
    properties: getLogProperties(item),
  }
  appInsightsDefaultClient.trackTrace(
    telemetry,
  )
}

const insert = (
  /** @type {import('applicationinsights').TelemetryClient} */
  appInsightsDefaultClient,
  /** @type {unknown} */
  streamInput = [], // avoid creating [undefined] array
) => {
  const item = Array.isArray(streamInput)
    ? streamInput
    : [streamInput]
  item.forEach((item) => {
      insertTrace(
        appInsightsDefaultClient,
      item,
      )
    if (item.level === 50) {
        insertException(
          appInsightsDefaultClient,
        item,
        )
      }
  })
}

const insertStream = (
  /** @type {import('applicationinsights').TelemetryClient} */
  appInsightsDefaultClient,
) => {
  const writeStream = new stream.Writable({
      objectMode: true,
      highWaterMark: 1,
    })
  writeStream._write = (
    logItems,
    _encoding,
    callback,
  ) => {
    try {
      insert(
        appInsightsDefaultClient,
        logItems,
      )
      callback(null)
    } catch (e) {
      if (e instanceof Error) {
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
