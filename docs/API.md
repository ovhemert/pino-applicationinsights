# API

The library exposes a function to write directly to an Azure Application Insights from your own application. The example below shows how this can be done using [pino-multi-stream](https://github.com/pinojs/pino-multi-stream).

Example:

```js
const insights = require('pino-applicationinsights')
const pinoms = require('pino-multi-stream')
// create the Azure Application Insights destination stream
const writeStream =
  insights.createAppInsightsWriteStream()
// create pino loggger
const logger = pinoms({
  streams: [
    {
      stream: writeStream,
    },
  ],
})
// log some events
logger.info('Informational message')
logger.error(
  new Error('things got bad'),
  'error message',
)
```

## Functions

### createAppInsightsWriteStream

The `createAppInsightsWriteStream` function creates a writestream that `pino-multi-stream` can use to send logs to.

The `createWriteStream` function is removed.

Example:

```js
const writeStream =
  insights.createAppInsightsWriteStream({
    key: 'instrumentationkey',
  })
```

#### key

Type: `String` _(optional)_

The Instrumentation Key of the Azure Application Insights account. If not specified, defaults to APPINSIGHTS_INSTRUMENTATIONKEY environment variable.

Or you could configure Azure Application Insights with your custom preferences by passing `setup` callback property:

```js
const writeStream =
  insights.createAppInsightsWriteStream({
    setup: (applicationInsights) =>
      applicationInsights
        .setup('instrumentationkey')
        .setAutoCollectRequests(false)
        .setAutoCollectDependencies(false)
        .start(),
  })
```

The only parameter of the callback is the applicationInsights instate to setup and call `start` on.
