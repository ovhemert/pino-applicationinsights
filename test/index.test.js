'use strict'

const test =
  require('tap').test
const tested = require('../src/index')

test('creates write stream', (t) => {
  const ws =
    tested.createWriteStreamSync(
      {
        key: 'blablabla',
      },
    )
  t.ok(ws)
  t.end()
})

test('does not create write stream without key', (t) => {
  t.throws(
    tested.createWriteStreamSync,
  )
  t.end()
})
