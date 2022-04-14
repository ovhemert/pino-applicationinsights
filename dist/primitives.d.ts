import type applicationinsights_default_export from 'applicationinsights';
import type { TelemetryClient, Contracts } from 'applicationinsights';
export declare type strictAiSeverityLevel = 0 | 1 | 2 | 3 | 4;
export declare type pinoSeverityLevel = 10 | 20 | 30 | 40 | 50 | 60;
declare type NextLoggerNames = 'console' | 'next.js' | 'Error';
/**
 * Generated by pino inside of next-logger, I think
 */
export declare type LogItem = {
    level: pinoSeverityLevel;
    time: number;
    pid: number;
    hostname: string;
    name: NextLoggerNames;
    msg: string;
    /** speculating, need to verify.. */
    stack?: string;
};
export interface ExceptionItem extends LogItem {
    message: string;
    stack: string;
}
export declare type streamInputData = Array<LogItem>;
export declare type SeverityLevelNames = keyof typeof Contracts.SeverityLevel;
/**
 * You should likely provide `applicationinsights.defaultClient` but are welcome to try passing in any type of TelemetryClient.
 */
export declare type activeAppInsightsClient = TelemetryClient;
/**
 * Call `applicationinsights.setup().start()`,
 * then you can return `applicationinsights.defaultClient` but are welcome to try passing in any type of TelemetryClient.
 */
export declare type getActiveAppInsightsClient = (
/** literally `require('applicationinsights')` */
require_applicationinsights: typeof applicationinsights_default_export) => activeAppInsightsClient;
export {};
//# sourceMappingURL=primitives.d.ts.map