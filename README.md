# pino-applicationinsights

[![CI](https://github.com/ovhemert/pino-applicationinsights/workflows/CI/badge.svg)](https://github.com/ovhemert/pino-applicationinsights/actions)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/2913ed8b1afa45de9a2dbcf965b94773)](https://www.codacy.com/app/ovhemert/pino-applicationinsights?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=ovhemert/pino-applicationinsights&amp;utm_campaign=Badge_Grade)
[![Known Vulnerabilities](https://snyk.io/test/npm/pino-applicationinsights/badge.svg)](https://snyk.io/test/npm/pino-applicationinsights)
[![Coverage Status](https://coveralls.io/repos/github/ovhemert/pino-applicationinsights/badge.svg?branch=master)](https://coveralls.io/github/ovhemert/pino-applicationinsights?branch=master)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)

This module provides a "transport" for [pino][pino] that forwards messages to a [Azure Application Insights][applicationinsights].

## Installation

To use globally from command line:

```bash
$ npm install -g pino-applicationinsights
```

To include as a library in your project:

```bash
$ npm install pino-applicationinsights
```

## CLI

Want to use `pino-applicationinsights` from the CLI?
See the [CLI](./docs/CLI.md) documentation for details.

## API

Want to use `pino-applicationinsights` as a library in your project?
See the [API](./docs/API.md) documentation for details.

## Maintainers

Osmond van Hemert
[![Github](https://img.shields.io/badge/-website.svg?style=social&logoColor=333&logo=github)](https://github.com/ovhemert)
[![Web](https://img.shields.io/badge/-website.svg?style=social&logoColor=333&logo=nextdoor)](https://ovhemert.dev)

## Contributing

If you would like to help out with some code, check the [details](./docs/CONTRIBUTING.md).

Not a coder, but still want to support? Have a look at the options available to [donate](https://ovhemert.dev/donate).

## License

Licensed under [MIT](./LICENSE).

[pino]: https://www.npmjs.com/package/pino
[applicationinsights]: https://docs.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview
