'use strict'

const test = require('tap').test
const tested = require('../src/streams')

test('streams to batches', t => {
  const writeStream = tested.batchStream(10)
  writeStream.on('data', chunk => {
    t.equal(chunk.length, 10)
    if (chunk[0].id === 11) { t.end() }
  })
  for (let i = 1; i <= 20; i++) {
    writeStream.write({ id: i, name: `item ${i}` })
  }
  writeStream.end()
})

test('streams valid json', t => {
  const writeStream = tested.parseJsonStream()
  writeStream.on('data', chunk => {
    t.deepEqual(chunk, { id: '1', name: 'item 1' })
    t.end()
  })
  writeStream.write('{ "id": "1", "name": "item 1" }')
  writeStream.end()
})

test('does not stream invalid json', t => {
  const writeStream = tested.parseJsonStream()
  writeStream.on('data', chunk => {
    t.fail('Should not be here')
  }).on('end', () => {
    t.end()
  })
  writeStream.write('{ this is not valid json }')
  writeStream.end()
})
