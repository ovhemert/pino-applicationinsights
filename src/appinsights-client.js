'use strict'

const debugConsole =
  // TODO make originalConsole stuff from next-logger a separate package...
  // want very specific ts-expect-error directives:
  // prettier-ignore
  typeof globalThis !== undefined &&
  globalThis
      // @ts-expect-error
      .originalConsole
    ? globalThis
        // @ts-expect-error
        .originalConsole
    : global
        // @ts-expect-error
        .originalConsole
    ? global
        // @ts-expect-error
        .originalConsole
    : console

const rawConsoleLog =
  debugConsole.debug.bind(debugConsole)

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

const getLogMessage = (
  /**
   * @type {import('./primitives').LogItem}
   */
  item,
) => {
  return (
    item.msg || // prefer pino-native msg
    item.message || // just in case
    item.err?.message ||
    'no message provided'
  )
}

const copyOverLogPropertiesWithoutDupes = (
  /** @type {import('./primitives').LogItem} */
  {
    msg: _discardedMessage,
    level: _discardedLevel,
    err: _discardedErr,
    ...item
  },
) => item

/** @returns {import('./primitives').strictAiSeverityLevel} */
const mapPinoLevelToAiSeverity = (
  /** @type {import('./primitives').pinoSeverityLevel} */
  level,
) => {
  if (level < 30) {
    // 10/20 - console.trace/console.debug? if enabled?
    return SL.Verbose
  }
  if (level < 40) {
    // 30 - console.log
    return SL.Information
  }
  if (level < 50) {
    // 40 - console.warn
    return SL.Warning
  }
  if (level < 60) {
    // 50 - console.error/exceptions
    return SL.Error
  }
  // 60 - crash
  // level >= 60 === true
  return SL.Critical
}

const insertException = (
  /** @type {import('applicationinsights').TelemetryClient} */
  appInsightsDefaultClient,
  /** @type {import('./primitives').LogItem} */
  item,
) => {
  /** @type {import('applicationinsights/out/Declarations/Contracts').ExceptionTelemetry}  */
  const telemetry = {
    exception:
      // Being lazy - suppressing type error:
      /** @type {Error} */ (
        /** @type {unknown} */ (item.err)
      ) || new Error(getLogMessage(item)),
    severity: mapPinoLevelToAiSeverity(
      item.level,
    ),
    // Could turn item.time into a `Date` object, somehow, perhaps.
    // time: item.time,
    properties:
      copyOverLogPropertiesWithoutDupes(
        item,
      ),
  }
  rawConsoleLog('exception', telemetry)
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
    severity: mapPinoLevelToAiSeverity(
      item.level,
    ),
    // Could turn item.time into a `Date` object, somehow, perhaps.
    // time: item.time,
    properties:
      copyOverLogPropertiesWithoutDupes(
        item,
      ),
  }
  rawConsoleLog('trace', telemetry)
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
  const items = Array.isArray(streamInput)
    ? streamInput
    : [streamInput]
  items.forEach((item) => {
    const {
      // Noisy when logs hit pino-pretty/stdout
      prefix: _discardedPrefix,
      ...itemWithoutPrefix
    } = item
    // let the user see server start-up errors and general logs:
    // TODO: allow user to customize this somehow...
    rawConsoleLog(
      //  (collapse whitespace so pino-pretty decides to pretty-print these)
      JSON.stringify(itemWithoutPrefix),
    )
    // Copy-out any unique data from error objects:
    if (item.err) {
      /** @type {Record<string, unknown>} */
      const errData = {}
      for (const k in item.err) {
        if (
          Object.prototype.hasOwnProperty.call(
            item.err,
            k,
          ) &&
          k !== 'name' &&
          k !== 'type' &&
          k !== 'stack' &&
          k !== 'message' // ?
        ) {
          // pull out excess properties from item.err
          // These can be present on errors like "port 3000 is taken"
          //   { ... item.err now?
          //     err: {
          //       code: 'EADDRINUSE',
          //       errno: -48,
          //       syscall: 'listen',
          //       address: '0.0.0.0',
          //       port: 3000
          //     },
          //     level: 50,
          //     time: 1650069194014,
          //     pid: 79907,
          //     hostname: 'MacBook-Air',
          //     name: 'next-logger-strict-console',
          //     prefix: 'error'
          //   }
          errData[k] = item.err[k] // will get copied over by copyOverLogPropertiesWithoutDupes
        }
      }
      if (Object.keys(errData).length > 0) {
        // using sufficiently unique key to avoid over-writing other data
        item.pinoAI_errData = errData
      }
      if (
        Object.prototype.toString.call(
          item.err,
        ) !== '[object Error]'
      ) {
        const newRealError = new Error(
          (item.err?.message || // prefer no change
            getLogMessage(item)) +
            (!item.err?.stack
              ? ' (Error obj created by pinoAI)'
              : ''),
        )
        if (item.err?.stack) {
          // use original stack trace.
          newRealError.stack = item.err.stack
        } else {
          // newRealError.stack may not be perfect, very accurate, or insightful
          // But, at least it will be defined, who knows if it will be useful or not.
        }
        item.err = newRealError
      }
    }
    insertTrace(
      appInsightsDefaultClient,
      item,
    )
    if (item.level >= 50) {
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
