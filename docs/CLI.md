# CLI

To use `pino-applicationinsights` from the command line, you need to install it globally:

```bash
npm install -g pino-applicationinsights
```

## Example

Given an application `foo` that logs via pino, you would use `pino-applicationinsights` like so:

```bash
node foo | pino-applicationinsights --key blablabla
```

## Usage

You can pass the following options via cli arguments:

| Short command | Full command      | Description                                                   |
| ------------- | ----------------- | ------------------------------------------------------------- |
| -V            | --version         | Output the version number                                     |
| -k            | --key &lt;key&gt; | Instrumentation Key of the Azure Application Insights account |
| -h            | --help            | Output usage information                                      |

See the [API](./API.md) documentation for details.
