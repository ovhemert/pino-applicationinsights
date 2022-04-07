'use strict'

const appInsights = require('applicationinsights')
const stream = require('stream')

class AppInsightsClient {
  constructor(
    /**
     * @type {import('./setupAppInsights').setupAppInsights}
     */
    setupAppInsights,
  ) {
    const appInsightsInstance =
      setupAppInsights(
        appInsights,
      )
    this.insights =
      appInsightsInstance.defaultClient
  }

  getLogException(item) {
    if (
      item.level !==
        50 ||
      item.type !==
        'Error'
    ) {
      return
    }
    const err =
      new Error(item.msg)
    err.stack =
      item.stack || ''
    return err
  }

  getLogMessage(item) {
    if (item.msg) {
      return item.msg
    }
    const severity =
      this.getLogSeverity(
        item.level,
      )
    return this.getLogSeverityName(
      severity,
    )
  }

  getLogProperties(
    item,
  ) {
    const props =
      Object.assign(
        {},
        item,
      )
    delete props.msg
    return props
  }

  getLogSeverity(level) {
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

  getLogSeverityName(
    severity,
  ) {
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

  insertException(item) {
    const exception =
      this.getLogException(
        item,
      )
    if (!exception) {
      return
    }
    const telemetry = {
      exception,
      properties:
        this.getLogProperties(
          item,
        ),
    }
    this.insights.trackException(
      telemetry,
    )
  }

  insertTrace(item) {
    const telemetry = {
      message:
        this.getLogMessage(
          item,
        ),
      severity:
        this.getLogSeverity(
          item.level,
        ),
      properties:
        this.getLogProperties(
          item,
        ),
    }
    this.insights.trackTrace(
      telemetry,
    )
  }

  insert(entities = []) {
    const data =
      Array.isArray(
        entities,
      )
        ? entities
        : [entities]
    if (
      data.length <= 0
    ) {
      return
    }
    data.forEach(
      (entity) => {
        this.insertTrace(
          entity,
        )
        if (
          entity.level ===
          50
        ) {
          this.insertException(
            entity,
          )
        }
      },
    )
  }

  insertStream() {
    const writeStream =
      new stream.Writable(
        {
          objectMode: true,
          highWaterMark: 1,
        },
      )
    writeStream._write =
      (
        chunk,
        encoding,
        callback,
      ) => {
        try {
          this.insert(
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
            console.error(
              'pino-applicationinsights/src/appinsights-client.js received an exception that is not an instanceof Error. Crashing process :)',
            )
            process.exit()
          }
        }
      }
    return writeStream
  }
}

module.exports = {
  AppInsightsClient,
}
