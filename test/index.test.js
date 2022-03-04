'use strict'

const test = require('tap').test
const tested = require('../src/index')

test('creates write stream', t => {
  const ws = tested.createWriteStreamSync({ key: 'blablabla' })
  t.resolves(ws)
  t.end()
})

test('does not create write stream without key', t => {
  const ws = tested.createWriteStreamSync()
  t.rejects(ws)
  t.end()
})
