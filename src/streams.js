'use strict'

// @ts-expect-error
const batch2 = require('batch2')
const split2 = require('split2')
// @ts-expect-error
const fastJsonParse = require('fast-json-parse')

// @ts-expect-error
function batchStream(size) {
  return batch2.obj({
    size,
  })
}

function parseJsonStream() {
  return split2(function (str) {
    const result = fastJsonParse(str)
    if (result.err) return null
    return result.value
  })
}

module.exports = {
  batchStream,
  parseJsonStream,
}
