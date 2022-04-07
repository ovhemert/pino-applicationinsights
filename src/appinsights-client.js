'use strict'

const rawConsoleLog =
  console.log.bind(console)

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

/**
 * @type {(
 *   item: import('./primitives').LogItem
 * ) => import('./primitives').ExceptionItem}
 */
const getLogException = (item) => ({
  ...item,
  message:
    item.msg || crash_logMsgRequired(),
  // guarantee there's a `name` property:
  name:
    item.name !== 'Error'
      ? item.name
      : 'Error',
  stack:
    item.stack || manuallyCreateStackTrace(),
})

const manuallyCreateStackTrace = () => {
  console.warn(
    'item missing stack trace... adding one now..',
  )
  const stack = new Error(
    'manually created stacktrace',
  ).stack
  if (!stack) {
    throw new Error(
      'manuallyCreateStackTrace: `new Error(<placeholder>) failed to produce an error with a .stack (stacktrace) property',
    )
  }
  return stack
}

const crash_logMsgRequired = () => {
  throw new Error(
    'log item has no msg property. Crashing.',
  )
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
  const telemetry = {
    exception: getLogException(item),
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
    rawConsoleLog(
      'processing log item:',
      item,
    )
    insertTrace(
      appInsightsDefaultClient,
      item,
    )
    if (item.level === 50) {
      if (
        item.type === 'Error' &&
        item.stack
      ) {
        // Now it's a "real" error...
        rawConsoleLog('inserting exception')
        insertException(
          appInsightsDefaultClient,
          item,
        )
      } else {
        console.warn(
          'item may or may not be a "real" exception.',
        )
      }
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
