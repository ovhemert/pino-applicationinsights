import type applicationinsights_default_export from 'applicationinsights'
import type {
  TelemetryClient,
  Contracts,
} from 'applicationinsights'

// Ideally: SeverityLevel is not an enum, see: https://github.com/microsoft/ApplicationInsights-node.js/issues/942
export type strictAiSeverityLevel =
  | 0
  | 1
  | 2
  | 3
  | 4

export type pinoSeverityLevel =
  | 10
  | 20
  | 30
  | 40
  | 50
  | 60

/**
 * Generated by pino inside of next-logger, I think
 */
export type LogItem = {
  level: pinoSeverityLevel
  time: number
  pid: number
  hostname: string
  name: string
  msg: string
  /** speculating, need to verify.. */
  stack?: string
}

export interface ExceptionItem
  extends LogItem {
  message: string
  stack: string
}

export type streamInputData = Array<LogItem>

export type SeverityLevelNames =
  keyof typeof Contracts.SeverityLevel

/**
 * You should likely provide `applicationinsights.defaultClient` but are welcome to try passing in any type of TelemetryClient.
 */
export type activeAppInsightsClient =
  TelemetryClient

/**
 * Call `applicationinsights.setup().start()`,
 * then you can return `applicationinsights.defaultClient` but are welcome to try passing in any type of TelemetryClient.
 */
export type getActiveAppInsightsClient = (
  /** literally `require('applicationinsights')` */
  require_applicationinsights: typeof applicationinsights_default_export,
  // No point in returning the same thing we just passed in:
) => activeAppInsightsClient
