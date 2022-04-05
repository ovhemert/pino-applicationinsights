export type setupAppInsights =
  (
    appInsights: typeof import('applicationinsights'),
  ) => typeof import('applicationinsights')
