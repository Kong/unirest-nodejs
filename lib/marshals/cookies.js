var Helpers = require('../helpers')

/**
 * @module marshals/cookies
 * @author Nijiko Yonskai
 */

/**
 * Convert array of cookies, or cookie string to a JavaScript object
 *
 * @param  {Mixed} obj Cookie array, or string
 * @return {Object}
 */
exports.marshal = function MarshalCookies (obj) {
  var cookies = {}
  var index
  var item

  function parse (cookie) {
    var pieces = Helpers.trim(cookie).split('=')
    var key = Helpers.trim(pieces[0])
    var value = Helpers.trim(pieces.slice(1).join('='))

    if (key && key !== '') {
      cookies[key] = value === '' ? true : value
    }
  }

  if (obj) {
    if (Helpers.type(obj) === "Array") {
      for (index = 0; index < obj.length; index++) {
        item = obj[index]

        if (Helpers.type(item) === "String" && item.indexOf(';') !== -1) {
          item.split(';').forEach(parse)
        }
      }
    } else if (Helpers.type(obj) === "String") {
      obj.split(';').forEach(parse)
    }
  }

  return cookies
}
