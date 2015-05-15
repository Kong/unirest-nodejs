var Helpers = require('../helpers')

/**
 * @module marshals/headers
 * @author Nijiko Yonskai
 */

/**
 * Convert headers string into JavaScript object with lowercase header names
 *
 * @param  {String} string Headers string to be marshalled to JavaScript object
 * @return {Object}
 */
exports.marshal = function (string) {
  var lines = string.split(/\r?\n/)
  var fields = {}
  var index
  var line
  var field
  var val

  // Remove Trailing CLRF
  lines.pop()

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i]
    index = line.indexOf(':')
    field = line.slice(0, index)
    val = Helpers.trim(line.slice(index + 1))
    fields[field] = val
  }

  return fields
}

/**
 * Convert JavaScript object to headers string, omitting request line
 *
 * @param  {Object} obj Object map containing key value data
 * @return {String}
 */
exports.unmarshal = function (obj) {
  var headers = ""

  for (var key in obj) {
    headers += Helpers.normalizeHeaderName(key) + ': ' + obj[key] + '\r\n'
  }

  return headers
}