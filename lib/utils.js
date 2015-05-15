/**
 * @module utils
 * @author Nijiko Yonskai
 */

/**
 * Simple Utility Methods for checking information about a value.
 *
 * @param  {Mixed}  value  Could be anything.
 * @return {Object}
 */
exports.is = function is (value) {
  return {
    a: function (check) {
      if (check.prototype) {
        check = check.prototype.constructor.name
      }

      var type = Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
      return value !== null && type === check.toLowerCase()
    }
  }
}

/**
 * Simple Utility Methods for checking information about a value.
 *
 * @param  {Mixed}  value  Could be anything.
 * @return {Object}
 */
exports.does = function does (value) {
  var arrayIndexOf = (Array.indexOf ? function (arr, obj, from) {
    return arr.indexOf(obj, from)
  } : function (arr, obj, from) {
    var l = arr.length
    var i = from ? parseInt((1*from) + (from<0 ? l:0), 10) : 0

    i = i < 0 ? 0 : i

    for (; i < l; i++) {
      if (i in arr  &&  arr[i] === obj) {
        return i
      }
    }

    return -1
  })

  return {
    startWith: function (string) {
      if (exports.is(value).a(String)) return value.slice(0, string.length) === string
      if (exports.is(value).a(Array)) return value[0] === string
      return false
    },

    endWith: function (string) {
      if (exports.is(value).a(String)) return value.slice(-string.length) === string
      if (exports.is(value).a(Array)) return value[value.length - 1] === string
      return false
    },

    contain: function (field) {
      if (exports.is(value).a(String)) return value.indexOf(field) !== -1
      if (exports.is(value).a(Object)) return value.hasOwnProperty(field)
      if (exports.is(value).a(Array)) return !!~arrayIndexOf(value, field)
      return false
    }
  }
}

/**
 * Removes whitespace from both ends of a string.
 *
 * @param  {String} string String to be trimmed of whitespace on both ends
 * @return {String}
 */
exports.trim = function (string) {
  return string.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')
}

/**
 * Return unique identifier string of random characters of length `len`.
 *
 *     utils.uid(10) // "FDaS435D2z"
 *
 * @param  {Number} len
 * @return {String}
 */
exports.uid = function uid (len) {
  var output = ''
  var chars = 'abcdefghijklmnopqrstuvwxyz123456789'
  var nchars = chars.length

  while (len--) {
    output += chars[Math.random() * nchars | 0]
  }

  return output
}

/**
 * Replaces the character at the specified index with the specified character given.
 *
 * @param {String} string
 * @param {Number} index
 * @param {String} char
 */
exports.setCharAt = function (string, index, char) {
  return string.substr(0, index) + char + string.substr(index + 1)
}

/**
 * Normalizes header name to Upper-Camel-Case notation
 *
 * @param {String} string Dash delimited header name
 */
exports.normalizeHeaderName = function normalizeHeaderName (string) {
  var pieces = string.split('-')
  var length = pieces.length
  var index = 0

  for (; index < length; index++) {
    pieces[index] = exports.setCharAt(pieces[index], 0, pieces[index].charAt(0).toUpperCase())
  }

  return pieces.join('-')
}
