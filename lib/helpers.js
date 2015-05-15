/**
 * Infers the type of the specified object
 *
 * @param  {Object} object Object to infer the type of
 * @return {String} Name of type
 */
exports.type = function type (object) {
  return Object.prototype.toString.call(object).slice(8, -1)
}

/**
 * Merges the contents of two objects together into a new object.
 *
 * @param  {Object} defaults Object which will receive the properties of the options Object
 * @param  {Object} options  Object that will be merged into defaults
 * @return {Object}
 */
exports.extend = function extend (defaults, options) {
  var extended = {}
  var prop

  for (prop in defaults) {
    if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
      extended[prop] = defaults[prop]
    }
  }

  for (prop in options) {
    if (Object.prototype.hasOwnProperty.call(options, prop)) {
      extended[prop] = options[prop]
    }
  }

  return extended
}

/**
 * Removes whitespace from both ends of a string.
 *
 * @param  {String} string String to be trimmed of whitespace on both ends
 * @return {String}
 */
exports.trim = function trim (string) {
  return string.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')
}

/**
 * Checks haystack for the existence of needle
 *
 * @param  {Object|String|Array} haystack Value to query needle against
 * @param  {Mixed} needle                 Value to be queried against haystack for existance check
 * @return {Boolean}
 */
exports.contains = function contains (haystack, needle) {
  if (type(haystack) === "Object") {
    return haystack.hasOwnProperty(needle)
  }

  return haystack.indexOf(needle) !== -1
}

/**
 * Returns a list of values obtained by checking the specified string
 * whether it contains array value or object key, when true the value
 * is appended to the list to be returned.
 *
 * @param  {String} string String to be tested
 * @param  {Object|Array} map    Values / Keys to test against string.
 * @return {Array} List of values truthfully matched against string.
 */
exports.matches = function matches (string, map) {
  var results = []
  var value

  for (var key in map) {
    if (typeof map.length !== 'undefined') {
      key = map[key]
    }

    if (string.indexOf(key) !== -1) {
      results.push(map[key])
    }
}

  return results
}

/**
 * Returns the first value obtained through #matches
 *
 * @see #matches
 * @param  {String} string String to be tested
 * @param  {Object|Array} map Values / Keys to test against string.
 * @return {Mixed} First match value
 */
exports.firstMatch = function firstMatch (string, map) {
  return matches(string, map)[0]
}

/**
 * Mime-type parser
 *
 * @param  {String} type
 * @param  {Boolean} parse Should we parse?
 * @return {String}
 */
exports.mimetype = function mimetype (type) {
  return typeof type === 'string' && type ? type.split(/ *; */).shift() : false;
}