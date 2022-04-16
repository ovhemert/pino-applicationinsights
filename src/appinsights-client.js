'use strict'

const rawConsoleLog =
  console.debug.bind(console)

const appInsights = require('applicationinsights')
const stream = require('stream')

const SL =
  appInsights.Contracts.SeverityLevel

const createAppInsightsWriteSteam = (
  /**
   * @type {import('./primitives').getActiveAppInsightsClient}
   */
  getActiveAppInsightsClient,
) => {
  return insertStream(
    getActiveAppInsightsClient(appInsights),
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
  rawConsoleLog(
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

const copyOverLogPropertiesWithoutDupes = (
  /** @type {import('./primitives').LogItem} */
  {
    msg: _discardedMessage,
    level: _discardedLevel,
    ...item
  },
) => item

/** @returns {import('./primitives').strictAiSeverityLevel} */
const getLogSeverity = (
  /** @type {import('./primitives').pinoSeverityLevel} */
  level,
) => {
  // 10/20 - console.trace/console.debug? if enabled?
  if (level < 30) {
    return SL.Verbose
  }
  // 30 - console.log
  if (level < 40) {
    return SL.Information
  }
  // 40 - console.warn
  if (level < 50) {
    return SL.Warning
  }
  // 50 - console.error/exceptions
  if (level < 60) {
    return SL.Error
  }
  // 60 - crash
  if (level >= 60) {
    return SL.Critical
  }
}

/** @returns {import('./primitives').SeverityLevelNames} */
const getLogSeverityName = (
  /** @type {import('./primitives').strictAiSeverityLevel} */
  severity,
) => {
  if (severity === SL.Verbose) {
    return 'Verbose'
  }
  if (severity === SL.Warning) {
    return 'Warning'
  }
  if (severity === SL.Error) {
    return 'Error'
  }
  if (severity === SL.Critical) {
    return 'Critical'
  }
  if (severity === SL.Information) {
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
  /** @type {import('applicationinsights/out/Declarations/Contracts').ExceptionTelemetry}  */
  const telemetry = {
    exception: item.err,
    severity: getLogSeverity(item.level),
    properties:
      copyOverLogPropertiesWithoutDupes(
        item,
      ),
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
    properties:
      copyOverLogPropertiesWithoutDupes(
        item,
      ),
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
    // let the user see server start-up errors and general logs:
    rawConsoleLog(
      //  (collapse whitespace so pino-pretty decides to pretty-print these)
      JSON.stringify(item, null, 1),
    )
    insertTrace(
      appInsightsDefaultClient,
      item,
    )
    if (item.level >= 50) {
      } else {
        rawConsoleLog(
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
    streamInput,
    _encoding,
    callback,
  ) => {
    try {
      insert(
        appInsightsDefaultClient,
        streamInput,
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
