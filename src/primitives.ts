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

type NextLoggerNames =
  | 'console'
  | 'next.js'
  | 'Error' // exception??

/**
 * Generated by pino inside of next-logger, I think
 */
export type LogItem = {
  level: pinoSeverityLevel
  time: number
  pid: number
  hostname: string
  name: NextLoggerNames
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
  keyof typeof import('applicationinsights').Contracts.SeverityLevel