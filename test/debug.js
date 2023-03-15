'use strict'

const pino = require('pino')

const logger = pino({
  level: 'trace'
}, pino.multistream([{ stream: process.stdout }]))

logger.trace('trace message')
logger.debug('debug message')
logger.info('info message')
logger.warn('warn message')
logger.error(new Error('error message'))
logger.fatal('fatal message')

logger.trace({ labels: { foo: 'bar' }, source: 'debugger', service: 'myservice' }, 'trace message')
logger.error(new Error('things got bad'), 'error message')
