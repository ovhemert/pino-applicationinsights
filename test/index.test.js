'use strict'

const test = require('tap').test
const tested = require('../src/index')

test('creates write stream', t => {
  const ws = tested.createWriteStream({ key: 'blablabla' })
  t.resolves(ws)
  t.end()
})

test('does not create write stream without key', t => {
  const ws = tested.createWriteStream()
  t.rejects(ws)
  t.end()
})
